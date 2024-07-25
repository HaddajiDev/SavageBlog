import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const GetUserPosts_2 = createAsyncThunk(
  'user/posterUser_2',
  async ({ id, page }) => {
    try {
      const response = await axios.get(`https://savage-blog-back.vercel.app/user/allposts/${id}?page=${page}`);
      return response.data.posts;
    } catch (error) {
      console.log(error);
      return [];
    }
  }
);

const initialState = {
  posters: [],
  status: 'idle'
};

export const UserPosterSlice = createSlice({
  name: 'userPoster',
  initialState,
  reducers: {
    clearPosters: (state) => {
      state.posters = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(GetUserPosts_2.pending, (state) => {
        state.status = 'loading';
        
      })
      .addCase(GetUserPosts_2.fulfilled, (state, action) => {
        state.status = 'succeeded';        
        const newPosts = action.payload;
        const existingPostIds = new Set(state.posters.map(post => post._id));
        const filteredNewPosts = newPosts.filter(post => !existingPostIds.has(post._id));
        state.posters = [...state.posters, ...filteredNewPosts];
      })
      .addCase(GetUserPosts_2.rejected, (state) => {
        state.status = 'failed';
      });
  }
});

export const { clearPosters } = UserPosterSlice.actions;

export default UserPosterSlice.reducer;
