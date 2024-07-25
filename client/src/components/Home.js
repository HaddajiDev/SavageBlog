import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import PostsList from './PostsList';
import PostAPost from './PostAPost';

function Home() {
  const user = useSelector((state) => state.user.user);
  const navigate = useNavigate();
  const [posting, setPosting] = useState(false);
  const generateAvatarUrl = (username) => {
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
  };

  return (
    <div>
      {/* {posting ? <PostAPost /> : <><button onClick={() => setPosting(!posting)}>Post a post</button></>} */}
      <div className='postingBG mt-3 mb-3'>
        <div className='postBG'>
          <div className='profileImageWrapper'>
            {user.profileImageUrl ? (
              <img src={user.profileImageUrl} className="pr_image" alt={`${user.username}'s profile`} />
            ) : (
              <img src={generateAvatarUrl(user.username)} className="pr_image" alt={`${user.username}'s avatar`} />
            )}
          </div>
          <div className='inputWrapper'>
            <input
              readOnly
              className='postInput'
              placeholder={`What is on your mind, ${user.username}?`}
              onClick={() => navigate('/post')}
            />
          </div>
        </div>
      </div>

      {/* <PostAPost /> */}
      <PostsList />
    </div>
  )
}

export default Home