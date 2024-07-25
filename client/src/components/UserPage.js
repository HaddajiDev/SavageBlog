import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { clearPosters, GetUserPosts_2 } from '../redux/UserPostsSlice';
import PostCard from './PostCard';

function UserPage() {
  const location = useLocation();
  const { state } = location;
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.userPoster.posters);
  const status = useSelector((state) => state.userPoster.status);

  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Fetch posts when user ID or page changes
  
  useEffect(() => {
    if (state && state._id) {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          
          const result = await dispatch(GetUserPosts_2({ id: state._id, page }));
          
          const fetchedPosts = result.payload;
          if (fetchedPosts.length === 0) {
            setHasMore(false);
          } else if (fetchedPosts.length < 10) {
            setHasMore(false);
          }
        } catch (error) {
          console.error('Failed to fetch posts:', error);
        } finally {
          setLoading(false);
        }
      };
      fetchPosts();
    }
  }, [dispatch, state, page]);

  const loadMorePosts = () => {
    if (hasMore) {
      setPage(prevPage => prevPage + 1);
    }
  };

  const generateAvatarUrl = (username) => {
    return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(clearPosters());
  }, []);

  return (
    <div className="user-profile">
      <div className="profile-header">
        {state?.profileImageUrl ? (
          <img src={state.profileImageUrl} alt={`${state.username}'s profile`} className="profile-image" />
        ) : (
          <img src={generateAvatarUrl(state.username)} alt={`${state.username}'s profile`} className="profile-image" />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1>{state?.username}</h1>
          {state?.bio}
        </div>
      </div>

      <div className="posts-list">
        {posts.length > 0 ? (
          posts.map((post) => (
            <PostCard key={post._id} post={post} check={"check"} />
          ))
        ) : (
          <p>No posts available</p>
        )}
        {loading ? (
          <p>Loading...</p>
        ) : hasMore ? (
          <button onClick={loadMorePosts} className="load-more-button">Load More</button>
        ) : (
          <p>No more posts</p>
        )}
      </div>
    </div>
  );
}

export default UserPage;
