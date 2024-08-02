import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { DeleteUser, GetAllusers } from '../redux/UserSlice';
import { Link } from 'react-router-dom';

function DashBoard() {
	const users = useSelector((state) => state.user.users);

	const dispatch = useDispatch();
	useEffect(() => {
		dispatch(GetAllusers());
	}, [users]);

	const [searchValue, setValue] = useState('');

	const handleDelete = (id) => {
		dispatch(DeleteUser(id));
	}

  return (
		<div>
            <div className='container mt-5'>
                <div className='row'>
                    <div className='col-12'>
                        <h1 className='mb-2'>All users</h1>
                        <div className='search-box mb-3'>
                            <input type='text'
                                placeholder='Search by username'
                                className='search-dash'
                                onChange={(e) => setValue(e.target.value)}
                            />
                            <div className='searchicon'>
                                <i class="fa fa-search fa-2x" aria-hidden="true"></i>
                            </div>
                        </div>
                        <div className='table-container'>
                            <table className='carttable'>
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Email</th>
                                        <th>Profile</th>
                                        <th>Delete</th>
                                        <th>Role</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users?.filter((el) => el.username.toLowerCase().includes(searchValue.toLowerCase())).map((el) => (
                                        <tr key={el._id}>
                                            
                                            <td>{el.username}</td>
                                            <td>{el.email}</td>
                                            <td>                                                
                                                <Link style={{ all: 'unset', cursor: 'pointer' }} to={`/profile/${el.username}`} state={el}>
                                                    <button>
                                                        <i class="fa fa-eye fa-lg" aria-hidden="true"></i>
                                                    </button>
                                                </Link>                                                
                                            </td>
                                            <td>
                                                <button onClick={() => handleDelete(el._id)}><i class="fa fa-trash fa-lg" aria-hidden="true"></i></button>
                                            </td>
                                            <td>{el.isAdmin ? 'Admin' : 'User'}</td>                            
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                
            </div>
        </div>
  )
}

export default DashBoard