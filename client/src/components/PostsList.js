import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GetAllposters, clearPosters } from '../redux/PosterSlice';
import PostCard from './PostCard';

function PostsList() {
  const dispatch = useDispatch();
  const posters = useSelector((state) => state.poster.posters);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  
  const pageSize = 10;

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const result = await dispatch(GetAllposters(page));
        const fetchedPosts = result.payload;
        
        if (fetchedPosts.length < pageSize) {
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [dispatch, page]);

  const loadMorePosts = () => {
    if (hasMore) {
      setPage((prevPage) => prevPage + 1);
    }
  };

  const refreshPosts = async (state) => {
    setPage(1);    
    if(state === 1){
      dispatch(GetAllposters(1));
      dispatch(clearPosters());
    } else {
      dispatch(GetAllposters(1));
    }    
  };

  useEffect(() => {
    dispatch(clearPosters());
  }, [])
  return (
    <div className="posts-list">
      {posters.length > 0 ? (
        posters.map((el) => (
          <PostCard key={el._id} post={el} refreshPosts={refreshPosts} check={"check"} />
        ))
      ) : (
        <p>No Posts yet.. be the first to post</p>
      )}
      {loading ? (
        <p>Loading...</p>
      ) : hasMore && posters.length >= pageSize ? (
        <button onClick={loadMorePosts} className="load-more-button">
          Load More
        </button>
      ) : (
        <p>No more posts</p>
      )}
    </div>
  );
}

export default PostsList;
