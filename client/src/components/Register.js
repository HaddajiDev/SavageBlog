import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { userRegister } from '../redux/UserSlice';
import { Link, useNavigate } from 'react-router-dom';

function Register() {
  const [user, setUser] = useState({
    email: '',
    username: '',
    password: ''
  });

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { status, error } = useSelector((state) => state.user);
  const handleStuff = async () => {
    try {
		setLoading(true);
      	await dispatch(userRegister(user)).unwrap();
	  	setLoading(false);
      	navigate('/verify');
    } catch (error) {
      	console.log(error);
    }
  };

  return (
    <div className='conti'>
      <div className="login-container">
                <h2 className="card-title">Sign up</h2>
                <div className='login-form'>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Email (valid email)" onChange={(e) => setUser({...user, email: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <input type="text" className="form-control" placeholder="Username" onChange={(e) => setUser({...user, username: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <input type="password" className="form-control" placeholder="Password" onChange={(e) => setUser({...user, password: e.target.value })} />
                  </div>
                  <button className="btn btn-primary mb-3" onClick={() => handleStuff()}>
                  {status === 'pending' ?  <i class="fa fa-spinner fa-pulse fa-2x fa-fw fa-lg"></i> : "Sign up now" }
                  </button>
                </div>
          <div >			
          {status === 'failed' && <p style={{ color: 'red' }}>{error}</p>}	
          <Link to="/login" className="text-center mt-3">You have an account ? Login</Link>
          </div>
          
      </div>
    </div>
    
  );
}

export default Register;