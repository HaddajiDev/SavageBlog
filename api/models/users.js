const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImageUrl: {
    type: String,
    default: ''
  },
  bio: {
    type: String,
    default: ''
  },
  posts:[ {  
    postId:{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'post'
    },      
  }],
  comments:[
     {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'comment',
  }
],
  notifications: [
    {
      msg: {type: String},
      profileImageUrl: {type: String},
      read: {type: Boolean, default: false}
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
});

module.exports = mongoose.model('User', userSchema);
