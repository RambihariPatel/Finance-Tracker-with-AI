import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice'
import transactionReducer from './slices/transactionSlice'
import budgetReducer from './slices/budgetSlice'
import insightReducer from './slices/insightSlice'
import goalReducer from './slices/goalSlice'
import subscriptionReducer from './slices/subscriptionSlice'

// configure the redux store with the following reducers:
//   auth         → authReducer
//   transactions → transactionReducer
//   budget       → budgetReducer
//   insights     → insightReducer
const store = configureStore({
  reducer: {
    auth: authReducer,
    transactions: transactionReducer,
    budget: budgetReducer,
    insights: insightReducer,
    goals: goalReducer,
    subscriptions: subscriptionReducer
  }
})

export default store
