import { Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import VerifyEmailPage from './components/VerifyEmailPage';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { currentUser } from './redux/UserSlice';
import ValiditionPrivateRoute from './components/ValiditionPrivateRoute';
import Profile from './components/Profile';
import PostAPost from './components/PostAPost';
import 'bootstrap/dist/css/bootstrap.min.css';
import PostPagee from './components/PostPagee';
import Navbar from './components/NavBar';
import UserPage from './components/UserPage';

import UpdatedPoster from './components/UpdatedPoster';
import DashBoard from './components/DashBoard';

import AdminPrivateRoute from './components/AdminPrivateRoute';

function App() {
  const isAuth = localStorage.getItem("token");
  const dispatch = useDispatch();  

  const [ping, setPing] = useState(false);
  useEffect(() => {
    if(isAuth){
      dispatch(currentUser());
    }    
  }, [ping]);
  
  return (
    <div className="App">
      <Navbar />
      <Routes>
        
        <Route element={<ValiditionPrivateRoute state="home" />}>
          <Route path='/' element={<Home />}/>
          <Route path='/profile' element={<Profile />}/>
          <Route path='/post' element={<PostAPost />}/>
          <Route path='/post/:id' element={<PostPagee />}/>
          <Route path='/profile/:id' element={<UserPage />}/>
          <Route path='/updatePost' element={<UpdatedPoster />}/>
        </Route>
        <Route element={<ValiditionPrivateRoute state="login" />}>
          <Route path='/login' element={<Login />} />
          <Route path='/verify' element={<VerifyEmailPage />} />
          <Route path='/register' element={<Register />}/>
        </Route>
        <Route element={<AdminPrivateRoute />}>
          <Route path='/dashboard' element={<DashBoard />}/>
        </Route> 

        
      </Routes>
      
    </div>
  );
}

export default App;
