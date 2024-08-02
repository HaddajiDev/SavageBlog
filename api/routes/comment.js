const express = require('express');
const router = express.Router();
const Post = require('../models/post');
const User = require('../models/users');

const Comment = require('../models/comment');


// Add a comment to a post
router.post('/:postId/comments', async (req, res) => {
	const { postId } = req.params;
	const { author, body } = req.body;
	
	try {
	  const comment = new Comment({
		post: postId,
		author: author,
		body: body,
	  });
	  
	  await comment.save();
  
	  const post = await Post.findById(postId);
	  const PostAuthor = await User.findById(post.author);
      const user = await User.findById(author);

      if(PostAuthor.username !== user.username){
        const poster = await Post.findById(postId);
        const PosterUser = await User.findById(poster.author);
        PostAuthor.notifications.push({msg: `${user.username} commented in your post`, profileImageUrl: user.profileImageUrl, 
            post: {...poster, author: PosterUser}});
        await PostAuthor.save();
      }

	  user.comments.push(comment._id);
	  post.comments.push(comment._id);


	  await user.save();
	  await post.save();
	  
	  res.status(201).send({comment: comment});
	} catch (err) {
	  res.status(400).send({ message: err.message });
	}
});


router.delete('/:id', async (req, res) => {
    try {
        const comment = await Comment.findById(req.params.id);
        if (!comment) {
            return res.send({ error: "Comment not found" });
        }

        const post = await Post.findById(comment.post);
        post.comments = post.comments.filter((el) => el.toString() !== comment._id.toString());

        const user = await User.findById(comment.author);
        user.comments = user.comments.filter((el) => el.toString() !== comment._id.toString());

        await Comment.findByIdAndDelete(req.params.id);
        await user.save();
        await post.save();

        res.send({ msg: "Comment deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const { body } = req.body;
        const comment = await Comment.findByIdAndUpdate(
            req.params.id,
            { body },
            { new: true }
        );
        if (!comment) {
            return res.status(404).send({ error: "Comment not found" });
        }
        res.send(comment);
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
});

module.exports = router;
