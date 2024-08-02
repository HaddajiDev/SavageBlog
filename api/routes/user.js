const express = require('express');
const router = express.Router();
const User = require('../models/users');
const Post = require('../models/post');
const bcrypt = require('bcrypt');
const Comment = require('../models/comment');

var jwt = require('jsonwebtoken');

const {loginRules, registerRules, validation, UpdateRules} = require('../middleware/validator');

const isAuth = require('../middleware/passport');

const sendVerificationEmail = require('../utils/sendVerificationEmail');

router.get('/', async (requset, result) => {
	try {
        const users = await User.find();
        result.status(200).send({users: users});
    } catch (error) {
        result.status(400).send({error});
    }
});

//register
router.post("/register", registerRules(), validation, async (request, result) => {
    try {
        // Check if email exists
        const search = await User.findOne({ email: request.body.email });
        if (search) {
            return result.status(400).send({error :'Email already exists'});
        }

        // Hash the password
        const salt = 10;
        const genSalt = await bcrypt.genSalt(salt);
        const hashed_password = await bcrypt.hash(request.body.password, genSalt);		

        // Create new user with hashed password
        let newUser = new User({
            ...request.body,
            password: hashed_password
        });

        // Save new user
        let res = await newUser.save();
        

		//create token
		const payload = {
			_id: res._id
		}
		const token = await jwt.sign(payload, process.env.SCTY_KEY, {
			expiresIn: '7d'
		});

        await sendVerificationEmail(res);

        result.status(200).send({ user: res, msg: "user added", token: `bearer ${token}` });
        //result.status(200).send({ user: res, msg: "User added. Verification email sent." });

    } catch (error) {
        console.error(error);
        result.status(500).send({error :'Something went wrong'});
    }
});


//login
router.post('/login', loginRules(), validation, async (request, result) => {
    const { email, password } = request.body;
    try {
        // Await the result of findOne
        const searchedUser = await User.findOne({ email });
        if (!searchedUser) {
            return result.status(400).send({error: "User not found"});
        }

        // Await the result of bcrypt.compare
        const match = await bcrypt.compare(password, searchedUser.password);

        if (!match) {
            return result.status(400).send({error: "Invalid credentials"});
        }       

		//create token
		const payload = {
			_id: searchedUser._id
		}
		const token = await jwt.sign(payload, process.env.SCTY_KEY, {
			expiresIn: '7d'
		});
        
        result.status(200).send({ user: searchedUser, msg: 'User logged in successfully', token: `bearer ${token}` });
    } catch (error) {
        console.error("Error during login:", error);
        result.status(500).send({error: "Login Failed"});
    }
});

router.get('/current', isAuth(), (request, result) => {
    result.status(200).send({user: request.user});
});

router.get('/verify/email/:id', async (req, res) => {
    try {
      
      let user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(400).send('Invalid token or user not found');
      }
  
      user.isVerified = true;
      await user.save();
  
      res.redirect(`https://savageblog.vercel.app/`);

    } catch (error) {
      console.error('Verification error:', error);
      res.status(500).send('Server error');
    }
});

router.get('/allposts/:id', async (req, res) => {
    const { page = 1 } = req.query;
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).send('User not found');
        }
        
        let limit = 10;
        const posts = await Post.find({
            _id: { $in: user.posts.map(postRef => postRef.postId) }
        })
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

        const postDetails = await Promise.all(posts.map(async (post) => {
            const author = await User.findById(post.author);
            return {
                title: post.title,
                body: post.body,
                author: {
                    username: author.username,
                    profileImageUrl: author.profileImageUrl,
                    bio: author.bio,
                    friendInvitation: author.friendInvitation,
                    friends: author.friends
                },
                comments: post.comments,
                category: post.category,
                tags: post.tags,
                imageUrl: post.imageUrl,
                createdAt: post.createdAt,
                updatedAt: post.updatedAt,
                _id: post._id,
                likes: post.Likes.length,
                dislikes: post.DisLikes.length
            };
        }));

        res.status(200).send({ posts: postDetails });
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).send({ error: 'Server error' });
    }
});

router.put('/:id', async (req, res) => {
    const { username, email, bio, password, profileImageUrl } = req.body;

    try {
        const updateFields = { username, email, bio, profileImageUrl };
        if (password) {
            updateFields.password = password;
        }

        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: updateFields }, { new: true });

        if (!updatedUser) {
            return res.status(404).send({ error: 'User not found' });
        }

        res.send({user: updatedUser});
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
    
});

router.get('/notification/:id', async(req, res) => {
    try {
        const user = await User.findById(req.params.id);
        const notifications = user.notifications;
        res.send({notification : notifications});
    } catch (error) {
        res.status(500).send({ error: error });
    }
});

router.post('/notification/read/:id', async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (user) {
            user.notifications.forEach(notification => {
                if(notification.read == false){
                    notification.read = true;
                }                
            });
            await user.save();
            res.send({ success: true });
        } else {
            res.status(404).send({ error: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.delete('/:id', async (req, res) => {
    try {
      const userId = req.params.id; 

      const user = await User.findById(userId);
        if (!user) {
        return res.status(404).json({ message: 'User not found' });
        }        
            
        const postIds = user.posts.map(post => post.postId._id);
        
        const commentsToDelete = await Comment.find({
        post: { $in: postIds },
        author: userId
        });
        
        await Comment.deleteMany({ _id: { $in: commentsToDelete.map(comment => comment._id) } });
        
        await Comment.deleteMany({ post: { $in: postIds } });
        
        await Post.deleteMany({ _id: { $in: postIds } });
        
        await Comment.deleteMany({ _id: { $in: user.comments } });
        
        await User.findByIdAndDelete(userId);
  
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });



  //send invi
  router.post('/sendInvite', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      const user = await User.findById(friendId);
      const friend = await User.findById(userId); //me
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
      const existingInvite = user.friendInvitation.some(invite => invite.userId.toString() === userId.toString());
    if (existingInvite) {
      return res.status(400).send({ message: 'Invitation already sent' });
    }

      const username = friend.username;
      const bio = friend.bio;
      const body = username + " sent you an invitation";
      const imageUrl = friend.profileImageUrl;
      user.friendInvitation.push({ userId, imageUrl, username, body, bio});
      
      await user.save();
  
      res.status(200).send({ message: 'Friend invitation sent' });
    } catch (error) {
      
      res.status(500).send({ error });
    }
  });
  
  // Add friend
  router.post('/addFriend', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }
  
      const friend = await User.findById(friendId);
      if (!friend) {
        return res.status(404).send({ message: 'Friend not found' });
      }

      const userAlreadyFriend = user.friends.some(f => f.freindId.toString() === friendId);
      const friendAlreadyFriend = friend.friends.some(f => f.freindId.toString() === userId);

    if (userAlreadyFriend || friendAlreadyFriend) {      
      friend.friendInvitation = friend.friendInvitation.filter(invite => invite.userId.toString() !== userId);
      await friend.save();
      return res.status(200).send({ message: 'Invitation removed (already friends)' });
    }
  
      friend.friends.push({freindId: userId });
      user.friends.push({ freindId: friendId });

      user.friendInvitation = user.friendInvitation.filter(invite => invite.userId.toString() !== friendId);
      friend.friendInvitation = friend.friendInvitation.filter(invite => invite.userId.toString() !== userId);


      await user.save();
      await friend.save();
      res.status(200).send({ message: 'Friend added' });
    } catch (error) {
      
      res.status(500).send({ error });
    }
  });
  
  // Remove friend invitation
  router.delete('/friend/removeInvite', async (req, res) => {
    try {
      const { userId, friendId } = req.body;  
      
      if (!userId || !friendId) {        
        return res.status(400).send({ message: 'Missing userId or friendId' });
      }
  
      const user = await User.findById(userId);
      if (!user) {        
        return res.status(404).send({ message: 'User not found' });
      }
  
      if (!user.friendInvitation || !Array.isArray(user.friendInvitation)) {        
        return res.status(400).send({ message: 'Invalid friend invitation list' });
      }
  
      const initialLength = user.friendInvitation.length;
      user.friendInvitation = user.friendInvitation.filter(invite => invite.userId.toString() !== friendId);
  
      const finalLength = user.friendInvitation.length;
      if (initialLength === finalLength) {        
        return res.status(404).send({ message: 'No friend invitation found with the provided friendId' });
      }
  
      await user.save();      
      res.status(200).send({ message: 'Friend invitation removed' });
    } catch (error) {      
      res.status(500).send({ error: 'Internal server error' });
    }
  });
  
  


  //remove Friend
  router.delete('/friend/removeFriend', async (req, res) => {
    try {
      const { userId, friendId } = req.body;
    
      const user = await User.findById(userId);
      if (!user) {        
        return res.status(404).send({ message: 'User not found' });
      }
  
      const friend = await User.findById(friendId);
      if (!friend) {        
        return res.status(404).send({ message: 'Friend not found' });
      }

      const userIdStr = userId.toString();
      const friendIdStr = friendId.toString();
  
      const initialUserFriendsCount = user.friends.length;
      user.friends = user.friends.filter(f => f.friendId && f.friendId.toString() !== friendIdStr);
      const finalUserFriendsCount = user.friends.length;
  
      const initialFriendFriendsCount = friend.friends.length;
      friend.friends = friend.friends.filter(f => f.friendId && f.friendId.toString() !== userIdStr);
      const finalFriendFriendsCount = friend.friends.length;
  
      if (initialUserFriendsCount === finalUserFriendsCount && initialFriendFriendsCount === finalFriendFriendsCount) {        
        return res.status(404).send({ message: 'No friend relationship found with the provided friendId' });
      }
  
      await user.save();
      await friend.save();  
      
      res.status(200).send({ message: 'Friend removed' });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
  
  
  router.get('/friend/all/:id', async(req, res) => {
    const userId = req.params.id;
    try {
      const user = await User.findById(userId);
      res.send({friends: user.friends});
    } catch (error) {
      res.send({error: error});
    }
  })

  router.get('/invite/all/:id', async(req, res) => {
    const userId = req.params.id;
    try {
      const user = await User.findById(userId);
      res.send({invitations: user.friendInvitation});
    } catch (error) {
      res.send({error: error});
    }
  })


  router.post('/invitation/read/:id', async (req, res) => {
    try {
      const userId = req.params.id;
      const user = await User.findById(userId);
  
      if (user) {
        user.friendInvitation.forEach(invitation => {
          if (invitation.read === false) {
            invitation.read = true;
          }
        });
        await user.save();
        res.send({ success: true });
      } else {
        res.status(404).send({ error: 'User not found' });
      }
    } catch (error) {
      res.status(500).send({ error: error.message });
    }
  });
  
  

module.exports = router;