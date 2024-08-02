import React from 'react'
import { Link, useLocation } from 'react-router-dom'

function FriendsList() {
    const location = useLocation();
    const {state} = location;
    
  const generateAvatarUrl = (username) => {
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
  };

  return (
    <div>
      <h3 className='mt-5' style={{textAlign: 'center'}}>Friends</h3>
      <div className='invites-container mt-3'>
        <div className="friend-invites-container">
          {state?.friends.length > 0 ? state?.friends.slice().reverse().map((el) => (            
            <div key={el.userId} className="friend-invite">              
              <Link style={{all: 'unset', textAlign: 'center', cursor: 'pointer'}}
              to={`/profile/${el.username}`} 
              state={{ _id: el.freindId, profileImageUrl: el.imageUrl, username: el.username, bio: el.bio, friendInvitation: el.friendInvitation, friends: el.friends }}
              >                
                {el.imageUrl ? <img src={el.imageUrl} /> : <img src={generateAvatarUrl(el.username)} />}              
                <h1>{el.username}</h1>
                <p>{el.bio}</p>
              </Link>
              <div className="friend-invite-buttons">
                
              </div>              
            </div>
          )) : (
            <p className="no-requests">No Freinds</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default FriendsList