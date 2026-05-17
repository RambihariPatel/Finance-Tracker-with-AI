import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import * as budgetService from '../../services/budgetService'

const getError = (error) => error.response?.data?.message || error.message || 'Something went wrong'

export const fetchBudget = createAsyncThunk('budget/fetch', async (_, { rejectWithValue }) => {
  try {
    const response = await budgetService.getBudget()
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

export const saveBudget = createAsyncThunk('budget/save', async (data, { rejectWithValue }) => {
  try {
    const response = await budgetService.setBudget(data)
    return response.data.data
  } catch (error) {
    return rejectWithValue(getError(error))
  }
})

const initialState = {
  monthlyBudget: 0,
  categories: [],
  remaining: 0,
  loading: false,
  error: ''
}

const budgetSlice = createSlice({
  name: 'budget',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudget.pending, (state) => {
        state.loading = true
        state.error = ''
      })
      .addCase(fetchBudget.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.monthlyBudget = action.payload.monthlyBudget
          state.categories = action.payload.categoryBudgets || []
        }
      })
      .addCase(fetchBudget.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload
      })
      
      .addCase(saveBudget.fulfilled, (state, action) => {
        if (action.payload) {
          state.monthlyBudget = action.payload.monthlyBudget
          state.categories = action.payload.categoryBudgets || []
        }
      })
  }
})

export default budgetSlice.reducer