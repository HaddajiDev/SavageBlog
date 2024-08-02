import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

// Publish a new poster
export const PublishPoster = createAsyncThunk('poster/publish', async (poster) => {
  try {
    const result = await axios.post('https://savage-blog-back.vercel.app/post/', poster);
    return result.data;
  } catch (error) {
     
  }
});

// Get all posters //get(`https://savage-blog-back.vercel.app/post/?page=${page}`);
export const GetAllposters = createAsyncThunk('poster/all', async (page = 1, { rejectWithValue }) => {
  try {
    const response = await axios.get(`https://savage-blog-back.vercel.app/post/?page=${page}`);
    return response.data.posts;
  } catch (error) {
    
    return rejectWithValue(error.response?.data.message || 'An error occurred');
  }
});

// Like a post
export const LikePost = createAsyncThunk('poster/like', async ({ id, userId }) => {
  try {
    const result = await axios.post(`https://savage-blog-back.vercel.app/post/${id}/like/`, { userId });
    return result.data;
  } catch (error) {
    
  }
});

// Dislike a post
export const DislikePost = createAsyncThunk('poster/dislike', async ({ id, userId }) => {
  try {
    const result = await axios.post(`https://savage-blog-back.vercel.app/post/${id}/dislike/`, { userId });
    return result.data;
  } catch (error) {
    
  }
});

// Get comments for a post //axios.get(`https://savage-blog-back.vercel.app/post/${id}/comments/`);
export const GetComments = createAsyncThunk('poster/comment', async (id) => {
  try {
    const result = await axios.get(`https://savage-blog-back.vercel.app/post/${id}/comments/`);
    return { postId: id, comments: result.data.comments };
  } catch (error) {
    
  }
});

//axios.get(`https://savage-blog-back.vercel.app/post/${id}/`);
export const GetPoster = createAsyncThunk('poster/one', async (id) => {
  try {
    const result = await axios.get(`https://savage-blog-back.vercel.app/post/${id}/`);
    return result.data;
  } catch (error) {
    
  }
});

export const DeletePoster = createAsyncThunk('poster/delete', async(id) => {
  try {
    const result = await axios.delete(`https://savage-blog-back.vercel.app/post/${id}/`);
    return result.data;
  } catch (error) {
    
  }
});


export const UpdatePoster = createAsyncThunk('poster/update', async({id, edited}) => {
  try {
    const result = await axios.put(`https://savage-blog-back.vercel.app/post/${id}/`, edited);
    return result.data;
  } catch (error) {
    
  }
});

const initialState = {
  posters: [],
  status: null,
  comments: {},
  poster: null
};

export const PosterSlice = createSlice({
  name: 'poster',
  initialState,
  reducers: {
    clearPosters: (state) => {
      state.posters = [];
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(PublishPoster.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(PublishPoster.fulfilled, (state) => {
        state.status = 'fulfilled';
      })
      .addCase(PublishPoster.rejected, (state, action) => {
        state.status = 'rejected';
        console.error('PublishPoster rejected:', action.error.message);
      })
      
      .addCase(GetAllposters.pending, (state) => {
        state.status = 'pending';        
      })
      .addCase(GetAllposters.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.posters = [
          ...state.posters.filter(post => !action.payload.some(newPost => newPost._id === post._id)),
          ...action.payload
        ];
      })
      .addCase(GetAllposters.rejected, (state, action) => {
        state.status = 'rejected';
        console.error('GetAllposters rejected:', action.error.message);
      })
      
      .addCase(GetComments.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(GetComments.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        if (action.payload && action.payload.postId) {
          state.comments[action.payload.postId] = action.payload.comments;
        }
      })
      .addCase(GetComments.rejected, (state, action) => {
        state.status = 'rejected';
        console.error('GetComments rejected:', action.error.message);
      })

      .addCase(GetPoster.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(GetPoster.fulfilled, (state, action) => {
        state.status = 'fulfilled';
        state.poster = action.payload.post;
      })
      .addCase(GetPoster.rejected, (state, action) => {
        state.status = 'rejected';        
      })


      .addCase(DeletePoster.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(DeletePoster.fulfilled, (state, action) => {
        state.status = 'fulfilled';        
      })
      .addCase(DeletePoster.rejected, (state, action) => {
        state.status = 'rejected';        
      })


      .addCase(UpdatePoster.pending, (state) => {
        state.status = 'pending';
      })
      .addCase(UpdatePoster.fulfilled, (state, action) => {
        state.status = 'fulfilled';        
      })
      .addCase(UpdatePoster.rejected, (state, action) => {
        state.status = 'rejected';        
      })
  }
});

export const { clearPosters } = PosterSlice.actions;

export default PosterSlice.reducer;
