const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
  title: {
    type: String,
    
  },
  body: {
    type: String,
    
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true,    
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'comment',
    }
  ],
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'category',
  },
  tags: [
    {
      type: String,
    },
  ],
  imageUrl: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Boolean,
    default: false
  },
  Likes: [
    {
      userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
    }
  ],
  DisLikes: [
    {
      userId: {type: mongoose.Schema.Types.ObjectId, ref: 'users'}
    }
  ],
});

module.exports = mongoose.model('Post', postSchema);
