import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = '/api/goals';

// Fetch all goals
export const fetchGoals = createAsyncThunk(
  'goals/fetchGoals',
  async (_, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.get(API_URL, config);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to fetch goals'
      );
    }
  }
);

// Create new goal
export const createGoal = createAsyncThunk(
  'goals/createGoal',
  async (goalData, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(API_URL, goalData, config);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to create goal'
      );
    }
  }
);

// Update goal
export const updateGoal = createAsyncThunk(
  'goals/updateGoal',
  async ({ id, goalData }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.put(`${API_URL}/${id}`, goalData, config);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to update goal'
      );
    }
  }
);

// Add funds to goal
export const addFundsToGoal = createAsyncThunk(
  'goals/addFundsToGoal',
  async ({ id, amount }, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      const response = await axios.post(`${API_URL}/${id}/add-funds`, { amount }, config);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to add funds'
      );
    }
  }
);

// Delete goal
export const deleteGoal = createAsyncThunk(
  'goals/deleteGoal',
  async (id, thunkAPI) => {
    try {
      const token = thunkAPI.getState().auth.token;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await axios.delete(`${API_URL}/${id}`, config);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || error.message || 'Failed to delete goal'
      );
    }
  }
);

const goalSlice = createSlice({
  name: 'goals',
  initialState: {
    goals: [],
    loading: false,
    error: null
  },
  reducers: {
    clearGoalError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetch
      .addCase(fetchGoals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchGoals.fulfilled, (state, action) => {
        state.loading = false;
        state.goals = action.payload;
      })
      .addCase(fetchGoals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // create
      .addCase(createGoal.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createGoal.fulfilled, (state, action) => {
        state.loading = false;
        state.goals.unshift(action.payload);
      })
      .addCase(createGoal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // update
      .addCase(updateGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      // add funds
      .addCase(addFundsToGoal.fulfilled, (state, action) => {
        const index = state.goals.findIndex(g => g._id === action.payload._id);
        if (index !== -1) {
          state.goals[index] = action.payload;
        }
      })
      // delete
      .addCase(deleteGoal.fulfilled, (state, action) => {
        state.goals = state.goals.filter(g => g._id !== action.payload);
      });
  }
});

export const { clearGoalError } = goalSlice.actions;
export default goalSlice.reducer;
