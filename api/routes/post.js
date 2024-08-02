const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/users');
const Comment = require('../models/comment');

//get all
// Get all posts with pagination
router.get('/', async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  try {
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const postsWithUser = await Promise.all(posts.map(async (post) => {
      const author = await User.findById(post.author);
      if (!author) {
        
        return null;
      }
      return {
        title: post.title,
        body: post.body,
        author: {
          username: author.username,
          profileImageUrl: author.profileImageUrl,
          posts: author.posts,
          bio: author.bio,
          friendInvitation: author.friendInvitation,
          friends: author.friends,
          _id: author._id,
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

    
    const filteredPosts = postsWithUser.filter(post => post !== null);

    res.status(200).send({ posts: filteredPosts });
  } catch (err) {
    console.error('Error fetching posts:', err);
    res.status(500).send({ message: 'Server error' });
  }
});


// Get post by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params; // Corrected parameter extraction
  try {
    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    const author = await User.findById(post.author);
    const postWithUser = {
      title: post.title,
      body: post.body,
      author: {
        username: author.username,
        profileImageUrl: author.profileImageUrl,
        posts: author.posts,
        bio: author.bio,
        friendInvitation: author.friendInvitation,
        friends: author.friends,
        _id: author._id,        
      },
      comments: post.comments,
      category: post.category,
      tags: post.tags,
      imageUrl: post.imageUrl,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,      
      likes: post.Likes.length,
      dislikes: post.DisLikes.length,
      _id: post._id,
    };

    res.status(200).send({ post: postWithUser });
  } catch (error) {
    console.error('Error fetching post:', error);
    res.status(500).send({ message: 'Server error' });
  }
});



//add post
router.post('/', async (req, res) => {
  const post = new Post({
    title: req.body.title,
    body: req.body.body,
    author: req.body.author,
    category: req.body.category,
    tags: req.body.tags,
    imageUrl: req.body.imageUrl,
  });

  try {
    const newPost = await post.save();
    const user = await User.findById(req.body.author);
    user.posts.push({postId: newPost._id});
    await user.save();
    res.status(201).send({post: newPost});
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

// Update a post
router.put('/:id', async (request, result) => {
  try {
      let updatedPost = await Post.findByIdAndUpdate(
          request.params.id, 
          { $set: request.body }, 
          { new: true }
      );
      result.status(200).send(updatedPost);
  } catch (error) {
      console.log(error);
      result.status(500).send({ error: 'Failed to update post' });
  }
});

// Delete a post
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const post = await Post.findById(id);    
    
    const user = await User.findById(post.author);
    
    if (user) {      
      user.posts = user.posts.filter(postItem => postItem.postId.toString() !== id);
      await user.save();
    }
    
    if (post.comments.length > 0) {
      await Promise.all(post.comments.map(async (commentId) => {
        await Comment.findByIdAndDelete(commentId);
      }));
    }
    
    
    await Post.findByIdAndDelete(id);
    
    res.send({ message: 'Post deleted' });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


// Like a post
router.post('/:id/like', async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }
    const Postuser = await User.findById(post.author);
    const LikedUser = await User.findById(userId);

    const likeIndex = post.Likes.findIndex(like => like.userId.toString() === userId.toString());

    if (likeIndex !== -1) {
      post.Likes.splice(likeIndex, 1);
      await post.save();
      return res.status(200).send({ message: 'Post unliked successfully', post });
    }

    
    const dislikeIndex = post.DisLikes.findIndex(dislike => dislike.userId.toString() === userId.toString());

    if (dislikeIndex !== -1) {
      post.DisLikes.splice(dislikeIndex, 1);
    }

    if(Postuser.username !== LikedUser.username){
      const poster = await Post.findById(postId);
      const PosterUser = await User.findById(poster.author);
      Postuser.notifications.push({msg: `${LikedUser.username} Liked your post`, profileImageUrl: LikedUser.profileImageUrl,
         post: {...poster, ...PosterUser}});
    }
    
    
    post.Likes.push({ userId: userId });
    await post.save();
    await Postuser.save();
    res.status(200).send({ message: 'Post liked successfully', post });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.post('/:id/dislike', async (req, res) => {
  const postId = req.params.id;
  const userId = req.body.userId;

  try {
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).send({ message: 'Post not found' });
    }

    
    const dislikeIndex = post.DisLikes.findIndex(dislike => dislike.userId.toString() === userId.toString());

    if (dislikeIndex !== -1) {
      post.DisLikes.splice(dislikeIndex, 1);
      await post.save();
      return res.status(200).send({ message: 'Post undisliked successfully', post });
    }

    
    const likeIndex = post.Likes.findIndex(like => like.userId.toString() === userId.toString());

    if (likeIndex !== -1) {
      post.Likes.splice(likeIndex, 1);
    }

    post.DisLikes.push({ userId: userId });
    await post.save();

    res.status(200).send({ message: 'Post disliked successfully', post });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});

router.get('/:postId/comments', async (req, res) => {
  const { postId } = req.params;

  try {    
    const comments = await Comment.find({ post: postId });
    if (comments.length === 0) {
      return res.status(404).send({ message: 'No comments found for this post' });
    }    
    const commentsWithUserDetails = await Promise.all(comments.map(async (comment) => {
      const author = await User.findById(comment.author);
      if (author) {
        return {
          postId: comment.post,
          authorId: author._id,
          body: comment.body,
          bio: author.bio,
          username: author.username,
          profileImageUrl: author.profileImageUrl,
          createdAt: comment.createdAt,
          friendInvitation: author.friendInvitation,
          friends: author.friends,
          _id: comment._id,     
               
        };
      } else {
        return {
          postId: comment.post,
          authorId: null,
          body: comment.body,
          username: '[Deleted User]',
          profileImageUrl: '',
          createdAt: comment.createdAt,
        };
      }
    }));

    res.status(200).send({ comments: commentsWithUserDetails });
  } catch (err) {
    res.status(500).send({ message: err.message });
  }
});


module.exports = router;