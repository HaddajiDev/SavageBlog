import { configureStore } from '@reduxjs/toolkit'
import UserSlice from './UserSlice'
import PosterSlice from './PosterSlice'
import UserPostsSlice from './UserPostsSlice'

export const store = configureStore({
  reducer: {
	  user: UserSlice,
    poster: PosterSlice,
    userPoster: UserPostsSlice
  },
})