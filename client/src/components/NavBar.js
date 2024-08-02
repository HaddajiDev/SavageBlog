import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { GetUserNotifications, logout, userLogin, GetUserNotificationsRead, GetAllInvitation } from '../redux/UserSlice';
import logo from '../logo_2.png';


function Navbar() {
    const user = useSelector((state) => state.user.user);
    const notifications = useSelector((state) => state.user.notifications);
    const dispatch = useDispatch();    
    
    const [user_, setUser] = useState({ email: '', password: '' });
    const [showDropdown, setShowDropdown] = useState(false);

    const friendInvites = useSelector((state) => state.user.friendInvites);

    const generateAvatarUrl = (username) => {
        return `https://api.dicebear.com/9.x/thumbs/svg?seed=${username}&flip=true&backgroundColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf&backgroundType=solid,gradientLinear&backgroundRotation=0,10,20&shapeColor=0a5b83,1c799f,69d2e7,f1f4dc,f88c49,transparent`;
    };

    useEffect(() => {
        if (user?._id) {
            dispatch(GetUserNotifications(user._id));
            dispatch(GetAllInvitation(user._id));
        }
    }, [dispatch, user]);

    const handleLogOut = async () => {
        await dispatch(logout());
        window.location.reload();        
    };


    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (!showDropdown) {
            dispatch(GetUserNotificationsRead(user._id));
        }
    };

    //get invitation in other route
    const navigate = useNavigate();
    const inviteRoute = () => {
        navigate('/invitation');
    }

    const handleNotificationClick = (notification) => {
        
    };

    const notificationsUp = notifications?.slice().reverse();
    const unreadCount = notifications?.filter(notification => !notification.read).length;

    const unreadInvititaion = friendInvites?.filter(invite => !invite.read).length;
    
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light" style={{width: "100%"}}>
            <div className="container cont">
                <Link className="navbar-brand logocon" to='/'><img src={logo} className='logo' alt='' style={{width: '180px'}}/></Link>
                {user ? (
                    <>                        
                        <div className="cont" id="navbarSupportedContent">                            
                            <ul className="navbar-nav ms-auto">
                                <li className="nav-item">
                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                                        {user.isAdmin ? <Link to='/dashboard' style={{all: 'unset', cursor: 'pointer'}}><i class="fa-solid fa-gauge-high fa-lg"></i></Link> : <></>}
                                        <div className="notification-container">
                                            <i className="fa-solid fa-user-group fa-lg" style={{cursor: 'pointer'}} onClick={inviteRoute}></i>
                                            {unreadInvititaion > 0 && <span className="notification-badge">{unreadInvititaion}</span>}
                                        </div>
                                        
                                        <div className="notification-container">                                            
                                            <i className="fa-solid fa-bell fa-lg" style={{cursor: 'pointer'}} onClick={toggleDropdown}></i>
                                            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
                                            {showDropdown && (
                                                <div className="notification-dropdown">
                                                    {notificationsUp?.slice(0, 5).map((notification, index) => {
                                                        const [username, ...msgParts] = notification.msg.split(' ');
                                                        const msg = msgParts.join(' ');
                                                        const profileImageUrl = notification.profileImageUrl || generateAvatarUrl(username);
                                                        
                                                        return (
                                                            <Link style={{all: 'unset', cursor: 'pointer'}}
                                                                to={`/post/${notification.post._id}`} state={notification.post}
                                                            >
                                                                <div key={index} className="notification-item" onClick={() => handleNotificationClick(notification)}>
                                                                    <img src={profileImageUrl} alt="avatar" style={{ width: '35px', borderRadius: '50%', marginRight: '10px' }} />
                                                                    <strong>{username}</strong> {msg}
                                                                </div>
                                                            </Link>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                        <div className='cont'>
                                            <Link className="nav-link" to='/profile' style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
                                                {user?.profileImageUrl ? (
                                                    <img src={user?.profileImageUrl} style={{ width: '35px', height: '35px', borderRadius: '50%' }} alt="profile" />
                                                ) : (
                                                    <img src={generateAvatarUrl(user?.username)} style={{ width: '35px', height: '35px', borderRadius: '50%' }} alt="avatar" />
                                                )}
                                                {user?.username}
                                            </Link>
                                        </div>
                                        <button className='logout' onClick={handleLogOut}>LogOut</button>
                                    </div>
                                </li>
                            </ul>
                        </div>
                    </>
                ) : (
                    <></>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
