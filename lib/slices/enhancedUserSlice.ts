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
  profileChanges: boolean
  lastUpdated: string | null
}

const initialState: UserState = {
  currentUser: null,
  loading: false,
  error: null,
  profileChanges: false,
  lastUpdated: null,
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

// Async thunk to update user profile with enhanced validation
export const updateUserProfile = createAsyncThunk(
  'user/updateUserProfile',
  async (userData: { name: string; email: string; phone?: string }) => {
    const response = await fetch('/api/users/enhanced-profile', {
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

// Async thunk to update user avatar with enhanced validation
export const updateUserAvatar = createAsyncThunk(
  'user/updateUserAvatar',
  async (avatarUrl: string) => {
    // This function now just returns the avatar URL since the file upload
    // is handled directly in the component before calling this action
    return { avatarUrl }
  }
)

// Async thunk to update password with enhanced validation
export const updateUserPassword = createAsyncThunk(
  'user/updateUserPassword',
  async (passwordData: { currentPassword: string; newPassword: string; otp: string }) => {
    const response = await fetch('/api/users/enhanced-password', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(passwordData),
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update password')
    }
    
    return response.json()
  }
)

const enhancedUserSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<User>) => {
      state.currentUser = action.payload
      state.error = null
      state.lastUpdated = new Date().toISOString()
    },
    clearUser: (state) => {
      state.currentUser = null
      state.error = null
      state.profileChanges = false
      state.lastUpdated = null
    },
    updateUserField: (state, action: PayloadAction<Partial<User>>) => {
      if (state.currentUser) {
        state.currentUser = { ...state.currentUser, ...action.payload }
        state.profileChanges = true
      }
    },
    setProfileChanges: (state, action: PayloadAction<boolean>) => {
      state.profileChanges = action.payload
    },
    clearError: (state) => {
      state.error = null
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
        state.lastUpdated = new Date().toISOString()
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
          state.currentUser = { ...state.currentUser, ...action.payload }
        }
        state.error = null
        state.profileChanges = false
        state.lastUpdated = new Date().toISOString()
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
          state.currentUser = { ...state.currentUser, ...action.payload }
        }
        state.error = null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateUserAvatar.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update avatar'
      })
    
    // Update user password
    builder
      .addCase(updateUserPassword.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateUserPassword.fulfilled, (state, action) => {
        state.loading = false
        if (state.currentUser) {
          state.currentUser = { ...state.currentUser, ...action.payload }
        }
        state.error = null
        state.lastUpdated = new Date().toISOString()
      })
      .addCase(updateUserPassword.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update password'
      })
  },
})

export const { 
  setUser, 
  clearUser, 
  updateUserField, 
  setProfileChanges, 
  clearError 
} = enhancedUserSlice.actions

export default enhancedUserSlice.reducer
