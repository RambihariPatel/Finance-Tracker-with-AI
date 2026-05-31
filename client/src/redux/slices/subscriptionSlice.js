import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import * as subscriptionService from '../../services/subscriptionService';

export const fetchSubscriptions = createAsyncThunk(
  'subscriptions/fetchSubscriptions',
  async (_, thunkAPI) => {
    try {
      const response = await subscriptionService.getSubscriptions();
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to fetch subscriptions');
    }
  }
);

export const createSubscription = createAsyncThunk(
  'subscriptions/createSubscription',
  async (subData, thunkAPI) => {
    try {
      const response = await subscriptionService.createSubscription(subData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to create subscription');
    }
  }
);

export const updateSubscription = createAsyncThunk(
  'subscriptions/updateSubscription',
  async ({ id, subData }, thunkAPI) => {
    try {
      const response = await subscriptionService.updateSubscription(id, subData);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to update subscription');
    }
  }
);

export const deleteSubscription = createAsyncThunk(
  'subscriptions/deleteSubscription',
  async (id, thunkAPI) => {
    try {
      await subscriptionService.deleteSubscription(id);
      return id;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to delete subscription');
    }
  }
);

export const paySubscription = createAsyncThunk(
  'subscriptions/paySubscription',
  async (id, thunkAPI) => {
    try {
      const response = await subscriptionService.paySubscription(id);
      return response.data.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || 'Failed to pay subscription');
    }
  }
);

const subscriptionSlice = createSlice({
  name: 'subscriptions',
  initialState: {
    subscriptions: [],
    loading: false,
    error: null
  },
  reducers: {
    clearSubscriptionError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSubscriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.subscriptions = action.payload;
      })
      .addCase(fetchSubscriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createSubscription.fulfilled, (state, action) => {
        state.subscriptions.push(action.payload);
      })
      .addCase(updateSubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.subscriptions[index] = action.payload;
      })
      .addCase(paySubscription.fulfilled, (state, action) => {
        const index = state.subscriptions.findIndex(s => s._id === action.payload._id);
        if (index !== -1) state.subscriptions[index] = action.payload;
      })
      .addCase(deleteSubscription.fulfilled, (state, action) => {
        state.subscriptions = state.subscriptions.filter(s => s._id !== action.payload);
      });
  }
});

export const { clearSubscriptionError } = subscriptionSlice.actions;
export default subscriptionSlice.reducer;
