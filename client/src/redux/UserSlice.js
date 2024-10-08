import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';


export const userRegister = createAsyncThunk("user/register", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post('https://savage-blog-back.vercel.app/user/register', user);
		return await response.data;
	} catch (error) {
		console.log(error);
		return rejectWithValue(error.response.data)
	}
});

export const userLogin = createAsyncThunk("user/login", async(user, {rejectWithValue})=>{
	try {
		let response = await axios.post('https://savage-blog-back.vercel.app/user/login', user);
		return response.data;
	} catch (error) {
		console.log(error);
		return rejectWithValue(error.response.data)
	}
});

export const currentUser = createAsyncThunk("user/current", async()=>{
	try {
		let result = await axios.get('https://savage-blog-back.vercel.app/user/current', {
			headers:{
				Authorization: localStorage.getItem("token"),
			}
		});
		return await result;
	} catch (error) {
		console.log(error);
	}
});

export const verifyEmail = createAsyncThunk("user/verifyEmail", async(id) => {
	try {
	  const response = await axios.get(`https://savage-blog-back.vercel.app/api/verify/email/${id}`);
	  return response.data;
	} catch (error) {
	  console.error('Error during email verification:', error.response ? error.response.data : error.message);
	  throw error;
	}
});

export const GetUserPosts = createAsyncThunk(
    'user/getposts',
    async ({ id, page }, { rejectWithValue }) => {
        try {
            const response = await axios.get(`https://savage-blog-back.vercel.app/user/allposts/${id}?page=${page}`);
            return response.data.posts;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

export const UpdateUser = createAsyncThunk('user/update', async({ id, edited }) => {
    try {
        const response = await axios.put(`https://savage-blog-back.vercel.app/user/${id}`, edited);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
});


export const GetUserNotifications = createAsyncThunk("user/notify", async(id) => {
	try {
		const response = await axios.get(`https://savage-blog-back.vercel.app/user/notification/${id}`);
	  	return response.data;
	} catch (error) {
		console.log(error);
	}
});

export const GetUserNotificationsRead = createAsyncThunk("user/notifyRead", async(id) => {
	try {
		const response = await axios.post(`https://savage-blog-back.vercel.app/user/notification/read/${id}`);
	  	return response.data;
	} catch (error) {
		console.log(error);
	}
});

export const GetAllusers = createAsyncThunk('user/all', async() => {
	try {
		const response = await axios.get('https://savage-blog-back.vercel.app/user/');
		return response.data;
	} catch (error) {
		console.log(error);
	}
})

export const DeleteUser = createAsyncThunk('user/delete', async(id) => {
	try {
		const response = await axios.delete(`https://savage-blog-back.vercel.app/user/${id}`);
		return response.data;
	} catch (error) {
		console.log(error);
	}
});

export const sendFriendRequset = createAsyncThunk('user/requestFriend', async({userId, friendId}) => {
	try {
		const response = await axios.post(`https://savage-blog-back.vercel.app/user/sendInvite`, {userId, friendId});
		return response.data;
	} catch (error) {
		
	}
});

export const AcceptFriendRequset = createAsyncThunk('user/AcceptRequest', async({ userId, friendId }) => {
	try {
		const response = await axios.post(`https://savage-blog-back.vercel.app/user/addFriend`, {userId, friendId});
		return response.data;
	} catch (error) {
		
	}
});

export const RejectFriendRequest = createAsyncThunk('user/RejectInvite', async ({ userId, friendId }) => {
	try {
	  const response = await axios.delete('https://savage-blog-back.vercel.app/user/friend/removeInvite', {
		data: { userId, friendId }
	  });
	  return response.data;
	} catch (error) {
	  console.error('Error rejecting friend request:', error);
	  throw error;
	}
  });
  
  export const removeFriend = createAsyncThunk('user/removeFriend', async ({ userId, friendId }, { rejectWithValue }) => {
	try {
	  const response = await axios.delete('https://savage-blog-back.vercel.app/user/friend/removeFriend', {
		data: { userId, friendId }
	  });
	  return response.data;
	} catch (error) {
	  console.error('Failed to remove friend:', error);
	  return rejectWithValue(error.response.data);
	}
  });


export const GetAllFriends = createAsyncThunk('user/allFriends', async(id) => {
	try {
		const response = await axios.get(`https://savage-blog-back.vercel.app/user/friend/all/${id}`);
		return response.data;
	} catch (error) {
		console.log(error);
	}
});

export const GetAllInvitation = createAsyncThunk('user/allInvitation', async(id) => {
	try {
		const response = await axios.get(`https://savage-blog-back.vercel.app/user/invite/all/${id}`);
		return response.data; 
	} catch (error) {
		console.log(error);
	}
});


export const GetAllInvitationRead = createAsyncThunk('user/InvitionRead', async(id) => {
	try {
		const response = await axios.post(`https://savage-blog-back.vercel.app/user/invitation/read/${id}`);
		return response.data;
	} catch (error) {
		console.log(error);
	}
})


export const generateToken = createAsyncThunk('user/tokenGenerate', async ({ email }, { rejectWithValue }) => {
	try {
		const response = await axios.post('https://savage-blog-back.vercel.app/api/generate-token', { email });
		return response.data;	
		
	} catch (error) {
		return rejectWithValue(error.response.data);
	}
});


const initialState = {
  	user: null,
	status: null,
	posts: [],
	notifications: null,
	users: null,
	error: null,
	friends: null,
	friendInvites: null,
	token: null
}

export const UserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
	logout:(state, action) => {
		state.user = null;
		localStorage.removeItem("token");
	}
	
  },
  extraReducers: (builder) => {
	builder	
	
	//login
	.addCase(userLogin.pending, (state, action) => {		
		state.status = "pending";
		state.error = null;
	})
	.addCase(userLogin.fulfilled, (state, action) => {
		state.status = "success";
		state.user = action.payload?.user;
		localStorage.setItem("token", action.payload.token);
	})
	.addCase(userLogin.rejected, (state, action) => {
		state.status = "failed";
		state.error = action.payload.error || 'Something went wrong';
	})

	//signInup
	.addCase(userRegister.pending, (state) => {
		state.status = "pending";
		state.error = null;
	})
	.addCase(userRegister.fulfilled, (state, action) => {
		state.status = "success";
		state.user = action.payload.user;		
		localStorage.setItem("token", action.payload.token);		
	})
	.addCase(userRegister.rejected, (state, action) => {
		state.status = "failed";
		state.error = action.payload.error || 'Something went wrong';
	})

	//Current
	.addCase(currentUser.pending, (state) => {
		state.status = "pending";
	})
	.addCase(currentUser.fulfilled, (state, action) => {
		state.status = "success";
		
		state.user = action.payload?.data.user;				
	})
	.addCase(currentUser.rejected, (state) => {
		state.status = "failed";
	})

	.addCase(verifyEmail.pending, (state) => {
        state.status = "pending";
      })
      .addCase(verifyEmail.fulfilled, (state, action) => {
        state.status = "success";
        state.user = action.payload.user;
        
      })
      .addCase(verifyEmail.rejected, (state) => {
        state.status = "failed";
      })

	  .addCase(GetUserPosts.pending, (state) => {
        state.status = "pending";		
      })
      .addCase(GetUserPosts.fulfilled, (state, action) => {
        state.status = "success";
		const newPosts = action.payload;
		const existingPostIds = new Set(state.posts.map(post => post._id));		
		const filteredNewPosts = newPosts.filter(post => !existingPostIds.has(post._id));	  		
		state.posts = [...state.posts, ...filteredNewPosts];
      })
      .addCase(GetUserPosts.rejected, (state) => {
        state.status = "failed";
      })



	  .addCase(UpdateUser.pending, (state) => {
		state.status = "pending";
	})
	.addCase(UpdateUser.fulfilled, (state, action) => {
		state.status = "success";
		state.user = action.payload.user;
	})
	.addCase(UpdateUser.rejected, (state) => {
		state.status = "failed";
	})


	.addCase(GetUserNotifications.pending, (state) => {
		state.status = "pending";
	})
	.addCase(GetUserNotifications.fulfilled, (state, action) => {
		state.status = "success";
		state.notifications = action.payload?.notification;
	})
	.addCase(GetUserNotifications.rejected, (state) => {
		state.status = "failed";
	})


	.addCase(GetUserNotificationsRead.pending, (state) => {
		state.status = "pending";
	})
	.addCase(GetUserNotificationsRead.fulfilled, (state, action) => {
		state.status = "success";
		state.notifications.forEach(notification => notification.read = true);

	})
	.addCase(GetUserNotificationsRead.rejected, (state) => {
		state.status = "failed";
	})


	.addCase(GetAllusers.pending, (state) => {
		state.status = "pending";
	})
	.addCase(GetAllusers.fulfilled, (state, action) => {
		state.status = "success";
		state.users = action.payload.users;

	})
	.addCase(GetAllusers.rejected, (state) => {
		state.status = "failed";
	})



	.addCase(DeleteUser.pending, (state) => {
		state.status = "pending";
	})
	.addCase(DeleteUser.fulfilled, (state, action) => {
		state.status = "success";
	})
	.addCase(DeleteUser.rejected, (state) => {
		state.status = "failed";
	})


	.addCase(AcceptFriendRequset.pending, (state) => {
		state.status = "pending";
	})
	.addCase(AcceptFriendRequset.fulfilled, (state, action) => {
		state.status = "success";
		state.friends = action.payload?.friends;
	})
	.addCase(AcceptFriendRequset.rejected, (state) => {
		state.status = "failed";
	})

	.addCase(GetAllFriends.pending, (state) => {
		state.status = "pending";
	})
	.addCase(GetAllFriends.fulfilled, (state, action) => {
		state.status = "success";
		state.friends = action.payload.friends;
	})
	.addCase(GetAllFriends.rejected, (state) => {
		state.status = "failed";
	})

	.addCase(GetAllInvitation.pending, (state) => {
		state.status = "pending";
	})
	.addCase(GetAllInvitation.fulfilled, (state, action) => {
		state.status = "success";
		state.friendInvites = action.payload.invitations;
	})
	.addCase(GetAllInvitation.rejected, (state) => {
		state.status = "failed";
	})

	.addCase(removeFriend.pending, (state) => {
		state.status = "pending";
	})
	.addCase(removeFriend.fulfilled, (state, action) => {
		state.status = "success";
		state.friends = action.payload?.friends;
	})
	.addCase(removeFriend.rejected, (state) => {
		state.status = "failed";
	})

	.addCase(generateToken.pending, (state) => {
		state.status = "pending";
	})
	.addCase(generateToken.fulfilled, (state, action) => {
		state.status = "success";
		state.token = action.payload?.token;
	})
	.addCase(generateToken.rejected, (state) => {
		state.status = "failed";
	})
	
  }
})

// Action creators are generated for each case reducer function
export const {logout } = UserSlice.actions

export default UserSlice.reducer