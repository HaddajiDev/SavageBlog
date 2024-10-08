import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { clearPosters, GetUserPosts_2 } from '../redux/UserPostsSlice';
import PostCard from './PostCard';
import { GetAllInvitation, sendFriendRequset, RejectFriendRequest, AcceptFriendRequset, GetAllFriends, removeFriend } from '../redux/UserSlice';
import { Alert } from './FriendRequestsPage';

function UserPage() {
  const location = useLocation();
  const { state: viewedUser } = location;
  const dispatch = useDispatch();
  const posts = useSelector((state) => state.userPoster.posters);
  const currentUser = useSelector((state) => state.user.user);
  const friends = useSelector((state) => state.user.friends) ?? [];
  const friendInvites = useSelector((state) => state.user.friendInvites) ?? [];
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [ping, setPing] = useState(false);

  useEffect(() => {
    dispatch(clearPosters());
  }, [dispatch]);

  useEffect(() => {
    if (viewedUser && viewedUser._id) {
      const fetchPosts = async () => {
        setLoading(true);
        try {
          const result = await dispatch(GetUserPosts_2({ id: viewedUser._id, page }));
          const fetchedPosts = result.payload;
          if (fetchedPosts.length === 0 || fetchedPosts.length < 10) {
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
  }, [dispatch, viewedUser, page]);

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
  }, []);

  useEffect(() => {
    if (currentUser && currentUser._id) {
      dispatch(GetAllInvitation(currentUser._id));
      dispatch(GetAllFriends(currentUser._id));
    }
  }, [ping, dispatch, currentUser]);

  const [loadingInvite, setLoadingInvite] = useState(false);
  const sentInviteFunc = async() => {
    setLoadingInvite(true);
    await dispatch(sendFriendRequset({ userId: currentUser._id, friendId: viewedUser?._id }));
    setPing(!ping);
    setLoadingInvite(false);
    Alert("Friend request sent", "success");
  };

  const [loadingAccept, setLoadingAccept] = useState(false);
  const acceptRequest = async(friendId) => {
    setLoadingAccept(true);
    await dispatch(AcceptFriendRequset({ userId: currentUser._id, friendId }));
    setPing(!ping);
    setLoadingAccept(false);
    Alert("Requset Accpted", 'success');
  };

  const [loadingDecline, setLoadingDecline] = useState(false);
  const declineRequest = async(friendId) => {
    setLoadingDecline(true);
    await dispatch(RejectFriendRequest({ userId: currentUser._id, friendId }));
    setPing(!ping);
    setLoadingDecline(false);
    Alert("Requset Declined", 'success');
  };

  const [LoadingRemove, setLoadingRemove] = useState(false);
  const removeFriendFunc = async() => {
    setLoadingRemove(true);
    await dispatch(removeFriend({ userId: currentUser._id, friendId: viewedUser?._id }));
    setLoadingRemove(false);
    setPing(!ping);
    Alert("Friend Removed", 'success');
  };

  const checkInvitationStatus = () => {
    const sentInvite = viewedUser.friendInvitation.some(invite => invite.userId === currentUser._id);
    const receivedInvite = friendInvites.some(invite => invite.userId === viewedUser._id);
    const isFriend = friends.some(friend => friend.freindId === viewedUser._id);

    if (isFriend) {
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className='buttonPage' disabled>Friends</button>
          <button className='buttonPage decline' onClick={() => removeFriendFunc()}>{LoadingRemove ?
           <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : 'Remove'}</button>
        </div>
      );
    } else if (receivedInvite) {
      return (
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className='buttonPage accept' onClick={() => acceptRequest(viewedUser._id)}>{loadingAccept ?
           <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : 'Accept'}</button>
          <button className='buttonPage decline' onClick={() => declineRequest(viewedUser._id)}>{loadingDecline ?
           <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : 'Decline'}</button>
        </div>
      );
    } else if (sentInvite) {
      return <button className='buttonPage' disabled>Request Sent</button>;
    } else {
      return (
        <>
        {<button className='buttonPage' onClick={sentInviteFunc}>{loadingInvite ?
          <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : 'Add Friend'
          }</button> }
        </>
      );
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-header">
        {viewedUser?.profileImageUrl ? (
          <img src={viewedUser.profileImageUrl} alt={`${viewedUser.username}'s profile`} className="profile-image" />
        ) : (
          <img src={generateAvatarUrl(viewedUser.username)} alt={`${viewedUser.username}'s profile`} className="profile-image" />
        )}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <h1 className='userPageName'>{viewedUser?.username}</h1>
          {viewedUser?.bio}
        </div>
      </div>
      {currentUser._id === viewedUser?._id ? null : checkInvitationStatus()}

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
