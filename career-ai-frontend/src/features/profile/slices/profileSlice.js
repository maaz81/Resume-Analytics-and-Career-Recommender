// profileSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { fetchProfileAPI, updateProfileAPI } from './profileAPI';

// Load profile thunk
export const loadProfile = createAsyncThunk(
  'profile/load',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchProfileAPI();
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to load profile');
    }
  }
);

// Update profile thunk
export const updateProfile = createAsyncThunk(
  'profile/update',
  async (data, { rejectWithValue }) => {
    try {
      return await updateProfileAPI(data);
    } catch (err) {
      return rejectWithValue(err.response?.data?.message || 'Failed to update profile');
    }
  }
);

// Slice
const profileSlice = createSlice({
  name: 'profile',
  initialState: {
    profile: null,
    isLoading: false,
    isUpdating: false,
    error: null,
    updateSuccess: false,
  },
  reducers: {
    clearUpdateSuccess: (state) => {
      state.updateSuccess = false;
    },
  },
  extraReducers: (builder) => {
    builder
      // Load profile
      .addCase(loadProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.profile = action.payload;
      })
      .addCase(loadProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
        state.updateSuccess = false;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isUpdating = false;
        state.profile = { ...state.profile, ...action.payload };
        state.updateSuccess = true;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload;
      });
  },
});

export const { clearUpdateSuccess } = profileSlice.actions;
export default profileSlice.reducer;