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
  friendInvitation: [
    {
      userId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
      imageUrl: {type: String},
      username: {type:String},
      body: {type: String},
      bio: {type: String},
      read: {type: Boolean, default: false}
    }
  ],
  friends: [
    {
      freindId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
      room: {type: Number, unique: true, }
    }
  ]
});


//assign diffrent room number
userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('friends')) {
    const maxRoom = await mongoose.model('User').aggregate([
      { $unwind: '$friends' },
      { $group: { _id: null, maxRoom: { $max: '$friends.room' } } }
    ]);

    let nextRoomNumber = 1;
    if (maxRoom.length > 0 && maxRoom[0].maxRoom) {
      nextRoomNumber = maxRoom[0].maxRoom + 1;
    }   
    user.friends = user.friends.map(friend => {
      if (!friend.room) {
        friend.room = nextRoomNumber++;
      }
      return friend;
    });
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
