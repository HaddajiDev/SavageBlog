import React from 'react'
import { useSelector } from 'react-redux';

import {Outlet, Navigate} from 'react-router-dom'

function AdminPrivateRoute() {
    const currentUser = useSelector((state) => state.user.user);
  	return currentUser?.isAdmin ? <Outlet /> : <Navigate to='/'/>
}

export default AdminPrivateRoute