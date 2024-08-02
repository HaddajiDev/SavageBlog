import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AcceptFriendRequset, GetAllInvitation, GetAllInvitationRead, RejectFriendRequest } from '../redux/UserSlice';

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

  return (
    <div>
      <div>
        {friendInvites.length > 0 ? friendInvites?.map((el) => (
          <div key={el.userId}>
            <h1>{el.username}</h1>
            <button onClick={() => acceptRequest(el.userId)}>Accept</button>
            <button onClick={() => declineRequest(el.userId)}>Decline</button>
          </div>
        )) : <><p>No requests</p></>}
      </div>
    </div>
  );
}

export default FriendRequestsPage;
