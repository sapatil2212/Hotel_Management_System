import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

export interface User {
  id: string
  name: string
  email: string
  phone?: string
  role: string
  avatarUrl?: string
  createdAt: string
  updatedAt: string
}

interface UserState {
  currentUser: User | null
  loading: boolean
  error: string | null
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
}

// Async thunk to fetch user data
export const fetchUserData = createAsyncThunk(
  'user/fetchUserData',
  async (userId: string) => {
    const response = await fetch(`/api/users/${userId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch user data')
    }
    return response.json()
  }
)

// Async thunk to update user profile
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: { name: string; email: string; phone?: string }) => {
    const response = await fetch('/api/users', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update profile')
    }
    
    return response.json()
  }
)

// Async thunk to update user avatar
export const updateUserAvatar = createAsyncThunk(
  'user/updateUserAvatar',
  async (avatarUrl: string) => {
    const response = await fetch('/api/users/upload-avatar', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ avatarUrl }),
    })
    
    if (!response.ok) {
      throw new Error('Failed to upload avatar')
    }
    
    return response.json()
  }
)

// Async thunk to update user email
export const updateUserEmail = createAsyncThunk(
  'user/updateUserEmail',
  async (emailData: { newEmail: string; otp: string }) => {
    const response = await fetch('/api/users/update-email', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(emailData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update email')
    }
    
    return response.json()
  }
)

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.error = null
    },
    clearUser: (state) => {
      state.currentUser = null
      state.error = null
    },
    updateUserField: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    // Fetch user data
    builder
      .addCase(fetchUserData.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchUserData.fulfilled, (state, action) => {
        state.loading = false
        state.currentUser = action.payload
        state.error = null
      })
      .addCase(fetchUserData.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch user data'
      })
    
    // Update user profile
    builder
      .addCase(updateUserProfile.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserProfile.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload.user }
        }
        state.error = null
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update profile'
      })
    
    // Update user avatar
    builder
      .addCase(updateUserAvatar.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserAvatar.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload.user }
        }
        state.error = null
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update avatar'
      })
    
    // Update user email
    builder
      .addCase(updateUserEmail.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserEmail.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload.user }
        }
        state.error = null
      })
      .addCase(updateUserEmail.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update email'
      })
  },
})

export const { setUser, clearUser, updateUserField } = userSlice.actions
export default userSlice.reducer
