import React from 'react';
import { useSelector } from 'react-redux';
import { Outlet, Navigate } from 'react-router-dom';

function ValiditionPrivateRoute({ state }) {
    const currentUser = useSelector((state_) => state_.user.user);
    
    if (state === 'home') {        
        return currentUser?.isVerified ? <Outlet /> : <Navigate to='/login' />;
    } else if (state === 'login') {        
        return !currentUser?.isVerified ? <Outlet /> : <Navigate to='/' />;
    }    
    return <Navigate to='/' />;
}

export default ValiditionPrivateRoute;
