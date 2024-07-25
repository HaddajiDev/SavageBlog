import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';


export const AddComment = createAsyncThunk("comment", async({id, user}) => {
    try {
        const result = await axios.post(`http://localhost:3000/comment/${id}/comments`, user);
    } catch (error) {
        
    }
});


export const DeleteComment = createAsyncThunk("comment/delete", async (id, { rejectWithValue }) => {
    try {
        const result = await axios.delete(`http://localhost:3000/comment/${id}`);
        return result.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

export const UpdateComment = createAsyncThunk("comment/update", async ({ id, body }, { rejectWithValue }) => {
    try {
        const result = await axios.put(`http://localhost:3000/comment/${id}`, { body });
        return result.data;
    } catch (error) {
        return rejectWithValue(error.response.data);
    }
});

const initialState = {
	comments: null,
    status: null
}

export const PosterSlice = createSlice({
	name: 'poster',
	initialState,
	extraReducers: (builder) => {
		builder
        .addCase(AddComment.pending, (state) => {
            state.status = 'pending';
        })
        .addCase(AddComment.fulfilled, (state) => {
            state.status = 'fulfilled';
        })
        .addCase(AddComment.rejected, (state) => {
            state.status = 'rejected';
        })


        .addCase(DeleteComment.pending, (state) => {
            state.status = 'pending';
        })
        .addCase(DeleteComment.fulfilled, (state) => {
            state.status = 'fulfilled';
        })
        .addCase(DeleteComment.rejected, (state) => {
            state.status = 'rejected';
        })

        .addCase(UpdateComment.pending, (state) => {
            state.status = 'pending';
        })
        .addCase(UpdateComment.fulfilled, (state, action) => {
            state.status = 'fulfilled';
            const index = state.comments.findIndex(comment => comment._id === action.payload._id);
            if (index !== -1) {
                state.comments[index] = action.payload;
            }
        })
        .addCase(UpdateComment.rejected, (state) => {
            state.status = 'rejected';
        })
    }
})