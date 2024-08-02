import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AcceptFriendRequset, GetAllInvitation, GetAllInvitationRead, RejectFriendRequest } from '../redux/UserSlice';
import { Link } from 'react-router-dom';
import { timeFromNow } from './PostCard';

function FriendRequestsPage() {
  const user = useSelector((state) => state.user.user);
  const friendInvites = useSelector((state) => state.user.friendInvites);
  const dispatch = useDispatch();

  const [ping, setPing] = useState(false);

  useEffect(() => {
    if (user && user._id) {
      dispatch(GetAllInvitation(user._id));
      dispatch(GetAllInvitationRead(user._id));
    }
  }, [ping, user]);

  const acceptRequest = (friendId) => {
    dispatch(AcceptFriendRequset({ userId: user._id, friendId }));
	setPing(!ping);
  };

  const declineRequest = (friendId) => {
    dispatch(RejectFriendRequest({ userId: user._id, friendId }));
	setPing(!ping);
  };

  const generateAvatarUrl = (username) => {
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
  };

  return (
    <div>
      <h3 className='mt-5' style={{textAlign: 'center'}}>Friends Requests</h3>
      <div className='invites-container mt-3'>
        <div className="friend-invites-container">
          {friendInvites.length > 0 ? friendInvites?.slice().reverse().map((el) => (            
            <div key={el.userId} className="friend-invite">
              <div style={{display: 'flex', width: '100%', justifyContent: 'flex-end', alignItems: 'flex-end', fontSize:'10px'}}>
                <p>{timeFromNow(el.date)}</p>
              </div>
              <Link style={{all: 'unset', textAlign: 'center', cursor: 'pointer'}}
              to={`/profile/${el.username}`} 
              state={{ _id: el.userId, profileImageUrl: el.imageUrl, username: el.username, bio: el.bio, friendInvitation: el.friendInvitation, friends: el.friends }}
              >                
                {el.imageUrl ? <img src={el.imageUrl} /> : <img src={generateAvatarUrl(el.username)} />}              
                <h1>{el.username}</h1>
                <p>{el.bio}</p>
              </Link>
              <div className="friend-invite-buttons">
                <button className="accept-button" onClick={() => acceptRequest(el.userId)}>Accept</button>
                <button className="decline-button" onClick={() => declineRequest(el.userId)}>Decline</button>
              </div>              
            </div>
          )) : (
            <p className="no-requests">No requests</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default FriendRequestsPage;
