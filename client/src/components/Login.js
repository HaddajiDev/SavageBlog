import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { currentUser, userLogin } from '../redux/UserSlice';


function Login() {
  const [user, setUser] = useState({
    email: '',
    password: ''
  });

  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  
  const { status, error } = useSelector((state) => state.user);

  
  const handleLogin = async () => {
    
    try {
      setLoading(true);
      await dispatch(userLogin(user)).unwrap();
      setLoading(false);
    } catch (error) {
      console.error('Failed to login:', error);
    }
  };

  return (
    <div className='conti'>
      <div className="login-container">
        <h1>Login</h1>
        <div className="login-form">
          <input type="text" placeholder="email" onChange={(e) => setUser({ ...user, email: e.target.value })} className="form-control" />
          <input type="password" placeholder="password" onChange={(e) => setUser({ ...user, password: e.target.value })} className="form-control" />
          <button onClick={() => handleLogin()} className="btn btn-primary mb-3">
            {status === 'pending' ?  <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : "Login" }</button>          
        </div>
        {status === 'failed' && <p style={{ color: 'red' }}>{error}</p>}
        <Link to="/register" className="">You don't have an account ? Register</Link>
      </div>
    </div>
    
  );
}

export default Login;