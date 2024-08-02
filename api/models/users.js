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
      post : {type: Object},
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
      friendInvitation: {type: Array},
      friends: {type: Array},
      date: {type: Date, default: Date.now},
      read: {type: Boolean, default: false}
    }
  ],
  friends: [
    {
      freindId: {type: mongoose.Schema.Types.ObjectId, ref: 'user'},
      imageUrl: {type: String},
      username: {type:String},      
      bio: {type: String},
      friendInvitation: {type: Array},
      friends: {type: Array},
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

    let nextRoomNumber = 2; // Start with the first even number
    if (maxRoom.length > 0 && maxRoom[0].maxRoom) {
      nextRoomNumber = Math.ceil((maxRoom[0].maxRoom + 1) / 2) * 2; // Ensure it's even
    }

    for (let friend of user.friends) {
      if (!friend.room) {
        friend.room = nextRoomNumber;
        nextRoomNumber += 2; // Increment by 2 to keep room numbers even

        // Find the corresponding friend and update their room number as well
        const correspondingFriend = await mongoose.model('User').findById(friend.friendId);
        if (correspondingFriend) {
          const userInCorrespondingFriendList = correspondingFriend.friends.find(f => f.friendId.equals(user._id));
          if (userInCorrespondingFriendList) {
            userInCorrespondingFriendList.room = friend.room;
            await correspondingFriend.save();
          }
        }
      }
    }
  }
  next();
});

module.exports = mongoose.model('User', userSchema);
