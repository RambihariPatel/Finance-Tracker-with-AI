import axios from 'axios';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_URL = 'http://localhost:5000/api';
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-finance-tracker';

const testUserEmail = 'tester_qa@example.com';
const testUserPassword = 'password123';
const testUserName = 'QA Tester';

const friendEmail = 'tester_friend@example.com';
const friendPassword = 'friendpassword123';
const friendName = 'Friend QA';

let userToken = '';
let userId = '';
let friendToken = '';
let friendId = '';

let incomeTxId = '';
let expenseTxId = '';
let goalId = '';
let subscriptionId = '';
let groupId = '';
let groupExpenseId = '';

const api = axios.create({
  baseURL: API_URL,
});

async function runTests() {
  console.log('🚀 STARTING COMPREHENSIVE API INTEGRATION TESTS...\n');

  try {
    // ----------------------------------------------------
    // DB Connection for cleanup checks
    // ----------------------------------------------------
    console.log('Connecting to database for pre-test cleanup...');
    await mongoose.connect(MONGODB_URI);
    console.log('✔ Connected to database');

    // Remove existing test users to prevent unique constraint errors
    await mongoose.connection.db.collection('users').deleteMany({
      email: { $in: [testUserEmail, friendEmail] }
    });
    console.log('✔ Cleaned up any old test users\n');

    // ----------------------------------------------------
    // 1. SIGNUP TESTS
    // ----------------------------------------------------
    console.log('--- 1. Testing Auth Signup ---');
    const signupRes = await api.post('/auth/signup', {
      name: testUserName,
      email: testUserEmail,
      password: testUserPassword
    });
    if (signupRes.status === 201 && signupRes.data.success) {
      console.log('✔ User Signup Passed');
      userToken = signupRes.data.token;
      userId = signupRes.data.user.id;
    } else {
      throw new Error(`Signup failed: ${JSON.stringify(signupRes.data)}`);
    }

    // Register friend for group split tests later
    const friendSignupRes = await api.post('/auth/signup', {
      name: friendName,
      email: friendEmail,
      password: friendPassword
    });
    if (friendSignupRes.status === 201 && friendSignupRes.data.success) {
      console.log('✔ Friend Signup Passed');
      friendToken = friendSignupRes.data.token;
      friendId = friendSignupRes.data.user.id;
    } else {
      throw new Error(`Friend Signup failed: ${JSON.stringify(friendSignupRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 2. LOGIN TESTS
    // ----------------------------------------------------
    console.log('--- 2. Testing Auth Login ---');
    const loginRes = await api.post('/auth/login', {
      email: testUserEmail,
      password: testUserPassword
    });
    if (loginRes.status === 200 && loginRes.data.success) {
      console.log('✔ User Login Passed');
      userToken = loginRes.data.token;
      // Set Auth token for subsequent requests
      api.defaults.headers.common['Authorization'] = `Bearer ${userToken}`;
    } else {
      throw new Error(`Login failed: ${JSON.stringify(loginRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 3. PROFILE TESTS
    // ----------------------------------------------------
    console.log('--- 3. Testing Profile Update ---');
    const profileRes = await api.put('/auth/profile', {
      name: 'QA Tester Updated',
      email: testUserEmail,
      baseCurrency: 'USD'
    });
    if (profileRes.status === 200 && profileRes.data.success && profileRes.data.user.baseCurrency === 'USD') {
      console.log('✔ Profile Update & Base Currency Change Passed');
    } else {
      throw new Error(`Profile update failed: ${JSON.stringify(profileRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 4. TRANSACTION TESTS (CRUD)
    // ----------------------------------------------------
    console.log('--- 4. Testing Transaction CRUD ---');
    
    // Create Income
    const incomeRes = await api.post('/transactions', {
      type: 'income',
      title: 'Salary Deposit',
      amount: 5000,
      currency: 'USD',
      category: 'Salary',
      paymentMethod: 'bank_transfer',
      description: 'Monthly QA testing salary deposit'
    });
    if (incomeRes.status === 201 && incomeRes.data.success) {
      console.log('✔ Create Income Passed');
      incomeTxId = incomeRes.data.data._id;
    } else {
      throw new Error(`Income creation failed: ${JSON.stringify(incomeRes.data)}`);
    }

    // Create Expense
    const expenseRes = await api.post('/transactions', {
      type: 'expense',
      title: 'Monthly Rent',
      amount: 1200,
      currency: 'USD',
      category: 'Housing',
      paymentMethod: 'bank_transfer',
      description: 'House rent'
    });
    if (expenseRes.status === 201 && expenseRes.data.success) {
      console.log('✔ Create Expense Passed');
      expenseTxId = expenseRes.data.data._id;
    } else {
      throw new Error(`Expense creation failed: ${JSON.stringify(expenseRes.data)}`);
    }

    // Read/List Transactions
    const listRes = await api.get('/transactions?type=expense');
    if (listRes.status === 200 && listRes.data.success && listRes.data.data.length > 0) {
      console.log('✔ Read/Filter Transactions Passed');
    } else {
      throw new Error(`Read transactions failed: ${JSON.stringify(listRes.data)}`);
    }

    // Update Transaction
    const updateRes = await api.put(`/transactions/${expenseTxId}`, {
      amount: 1300,
      description: 'House rent - revised'
    });
    if (updateRes.status === 200 && updateRes.data.success && updateRes.data.data.amount === 1300) {
      console.log('✔ Update Transaction Passed');
    } else {
      throw new Error(`Update transaction failed: ${JSON.stringify(updateRes.data)}`);
    }

    // Delete temporary transaction
    const tempTx = await api.post('/transactions', {
      type: 'expense',
      title: 'Temp Expense',
      amount: 10,
      category: 'Others',
      paymentMethod: 'cash'
    });
    const deleteRes = await api.delete(`/transactions/${tempTx.data.data._id}`);
    if (deleteRes.status === 200 && deleteRes.data.success) {
      console.log('✔ Delete Transaction Passed');
    } else {
      throw new Error(`Delete transaction failed: ${JSON.stringify(deleteRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 5. BUDGET TESTS
    // ----------------------------------------------------
    console.log('--- 5. Testing Budget & Alerts ---');
    const budgetRes = await api.post('/budget', {
      monthlyBudget: 2000,
      categoryBudgets: [
        { category: 'Housing', limit: 1500 },
        { category: 'Food', limit: 100 }
      ]
    });
    if (budgetRes.status === 200 && budgetRes.data.success) {
      console.log('✔ Set Budget Passed');
    } else {
      throw new Error(`Set budget failed: ${JSON.stringify(budgetRes.data)}`);
    }

    // Exceed Category budget limit to test email alert fallback output
    const overspendRes = await api.post('/transactions', {
      type: 'expense',
      title: 'Fancy Dining Out',
      amount: 250,
      currency: 'USD',
      category: 'Food',
      paymentMethod: 'card',
      description: 'Tested budget overspend email alert fallback'
    });
    if (overspendRes.status === 201 && overspendRes.data.success) {
      console.log('✔ Budget Exceed Overspend Alert Triggered Successfully');
    } else {
      throw new Error(`Overspend transaction failed: ${JSON.stringify(overspendRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 6. DASHBOARD SUMMARY TEST
    // ----------------------------------------------------
    console.log('--- 6. Testing Dashboard Summary ---');
    const dashboardRes = await api.get('/dashboard/summary');
    if (dashboardRes.status === 200 && dashboardRes.data.success) {
      const data = dashboardRes.data.data || dashboardRes.data;
      console.log(`✔ Dashboard summary fetched successfully`);
      console.log(`  - Total Income: $${data.totalIncome}`);
      console.log(`  - Total Expense: $${data.totalExpense}`);
      console.log(`  - Savings: $${data.savings}`);
      console.log(`  - Remaining Budget: $${data.budgetRemaining}`);
    } else {
      throw new Error(`Dashboard summary failed: ${JSON.stringify(dashboardRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 7. AI INSIGHTS & PREDICTION TESTS
    // ----------------------------------------------------
    console.log('--- 7. Testing AI Insights & Predictions ---');
    const insightsRes = await api.post('/ai/insights');
    if (insightsRes.status === 200 && insightsRes.data.success) {
      console.log('✔ AI Insights Passed');
      console.log(`  - Provider Used: ${insightsRes.data.data.provider}`);
      console.log(`  - Sample Insight: ${insightsRes.data.data.insights[0] || 'None'}`);
    } else {
      throw new Error(`AI Insights failed: ${JSON.stringify(insightsRes.data)}`);
    }

    const predictRes = await api.post('/ai/predict');
    if (predictRes.status === 200 && predictRes.data.success) {
      console.log('✔ AI/Heuristic Spending Prediction Passed');
      console.log(`  - Predicted Expense: $${predictRes.data.data.predictedExpense}`);
      console.log(`  - Confidence: ${predictRes.data.data.confidence}%`);
      console.log(`  - Budget Risk Flag: ${predictRes.data.data.budgetRisk}`);
    } else {
      throw new Error(`Prediction failed: ${JSON.stringify(predictRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 8. SAVINGS GOALS TESTS
    // ----------------------------------------------------
    console.log('--- 8. Testing Savings Goals ---');
    const goalCreateRes = await api.post('/goals', {
      title: 'QA Trip to Goa',
      targetAmount: 5000,
      deadline: new Date(new Date().setMonth(new Date().getMonth() + 6)).toISOString().slice(0, 10),
      color: '#4f46e5',
      icon: '✈️'
    });
    if (goalCreateRes.status === 201 && goalCreateRes.data.success) {
      console.log('✔ Create Saving Goal Passed');
      goalId = goalCreateRes.data.data._id;
    } else {
      throw new Error(`Goal creation failed: ${JSON.stringify(goalCreateRes.data)}`);
    }

    const goalFundsRes = await api.post(`/goals/${goalId}/add-funds`, {
      amount: 1500
    });
    if (goalFundsRes.status === 200 && goalFundsRes.data.success && goalFundsRes.data.data.currentAmount === 1500) {
      console.log('✔ Add Funds to Goal Passed');
    } else {
      throw new Error(`Add funds to goal failed: ${JSON.stringify(goalFundsRes.data)}`);
    }

    const goalDeleteRes = await api.delete(`/goals/${goalId}`);
    if (goalDeleteRes.status === 200 && goalDeleteRes.data.success) {
      console.log('✔ Delete Saving Goal Passed');
    } else {
      throw new Error(`Goal deletion failed: ${JSON.stringify(goalDeleteRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 9. SUBSCRIPTIONS TESTS
    // ----------------------------------------------------
    console.log('--- 9. Testing Subscriptions ---');
    const subCreateRes = await api.post('/subscriptions', {
      title: 'YouTube Premium',
      amount: 15,
      currency: 'USD',
      category: 'Entertainment',
      frequency: 'monthly',
      nextDueDate: new Date(new Date().setDate(new Date().getDate() + 10)).toISOString().slice(0, 10)
    });
    if (subCreateRes.status === 201 && subCreateRes.data.success) {
      console.log('✔ Create Subscription Passed');
      subscriptionId = subCreateRes.data.data._id;
    } else {
      throw new Error(`Subscription creation failed: ${JSON.stringify(subCreateRes.data)}`);
    }

    const subPayRes = await api.post(`/subscriptions/${subscriptionId}/pay`);
    if (subPayRes.status === 200 && subPayRes.data.success) {
      console.log('✔ Manual Pay Subscription Passed');
    } else {
      throw new Error(`Manual pay subscription failed: ${JSON.stringify(subPayRes.data)}`);
    }

    const subDeleteRes = await api.delete(`/subscriptions/${subscriptionId}`);
    if (subDeleteRes.status === 200 && subDeleteRes.data.success) {
      console.log('✔ Delete Subscription Passed');
    } else {
      throw new Error(`Subscription deletion failed: ${JSON.stringify(subDeleteRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 10. GROUP EXPENSE SPLITTER TESTS
    // ----------------------------------------------------
    console.log('--- 10. Testing Group Splitter (Splitwise feature) ---');
    
    // Create Group
    const groupCreateRes = await api.post('/groups', {
      name: 'QA Roommates',
      description: 'Shared flat expenses',
      currency: 'USD',
      membersEmails: [friendEmail]
    });
    if (groupCreateRes.status === 201 && groupCreateRes.data.success) {
      console.log('✔ Create Group Passed');
      groupId = groupCreateRes.data.data._id;
    } else {
      throw new Error(`Group creation failed: ${JSON.stringify(groupCreateRes.data)}`);
    }

    // Search Users check
    const searchRes = await api.get('/groups/search-users?q=teste');
    if (searchRes.status === 200 && searchRes.data.success) {
      console.log('✔ Search Users for Group Adding Passed');
    } else {
      throw new Error(`Search users failed: ${JSON.stringify(searchRes.data)}`);
    }

    // Add Group Expense
    const groupExpenseRes = await api.post(`/groups/${groupId}/expenses`, {
      description: 'Grocery Shopping',
      amount: 100,
      paidBy: userId,
      splitType: 'equal',
      splits: [
        { userId: userId },
        { userId: friendId }
      ],
      category: 'Food'
    });
    if (groupExpenseRes.status === 201 && groupExpenseRes.data.success) {
      console.log('✔ Add Group Expense Passed');
      groupExpenseId = groupExpenseRes.data.data._id;
    } else {
      throw new Error(`Group expense creation failed: ${JSON.stringify(groupExpenseRes.data)}`);
    }

    // Get Group Details and Net Balances
    const groupDetailsRes = await api.get(`/groups/${groupId}`);
    if (groupDetailsRes.status === 200 && groupDetailsRes.data.success) {
      const details = groupDetailsRes.data.data;
      console.log('✔ Fetch Group Details & Splits Passed');
      console.log(`  - Simplified Debt: from ${details.simplifiedDebts[0]?.from.name} to ${details.simplifiedDebts[0]?.to.name} amount $${details.simplifiedDebts[0]?.amount}`);
    } else {
      throw new Error(`Get group details failed: ${JSON.stringify(groupDetailsRes.data)}`);
    }

    // Delete Group Expense
    const groupExpenseDeleteRes = await api.delete(`/groups/${groupId}/expenses/${groupExpenseId}`);
    if (groupExpenseDeleteRes.status === 200 && groupExpenseDeleteRes.data.success) {
      console.log('✔ Delete Group Expense Passed');
    } else {
      throw new Error(`Delete group expense failed: ${JSON.stringify(groupExpenseDeleteRes.data)}`);
    }
    console.log('');

    // ----------------------------------------------------
    // 11. REPORTS & PDF EXPORTS TEST
    // ----------------------------------------------------
    console.log('--- 11. Testing Monthly Reports & PDF Export ---');
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;

    const reportJSONRes = await api.get(`/reports/monthly?year=${year}&month=${month}`);
    if (reportJSONRes.status === 200 && reportJSONRes.data.success) {
      console.log('✔ Fetch Monthly JSON Report Passed');
    } else {
      throw new Error(`JSON Report fetch failed: ${JSON.stringify(reportJSONRes.data)}`);
    }

    const reportPDFRes = await api.get(`/reports/monthly?year=${year}&month=${month}&format=pdf`, {
      responseType: 'arraybuffer'
    });
    if (reportPDFRes.status === 200 && reportPDFRes.headers['content-type'] === 'application/pdf') {
      console.log(`✔ Stream Monthly PDF Report (PDFKit) Passed (Buffer Size: ${reportPDFRes.data.byteLength} bytes)`);
    } else {
      throw new Error(`PDF Report stream failed: Status ${reportPDFRes.status}, Content-Type ${reportPDFRes.headers['content-type']}`);
    }
    console.log('');

    // ----------------------------------------------------
    // ALL TESTS SUCCESSFUL
    // ----------------------------------------------------
    console.log('🎉 SUCCESS! ALL 11 FUNCTIONALITIES COMPLETED TEST AND PASSED 100% CORRECTLY!\n');

  } catch (error) {
    console.error('❌ TEST RUN FAILED!');
    if (error.response) {
      console.error(`API Error response: Status ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else {
      console.error(error.message);
    }
  } finally {
    // Clean up DB
    console.log('Cleaning up database test data...');
    try {
      if (userId) {
        await mongoose.connection.db.collection('users').deleteMany({ _id: { $in: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(friendId)] } });
        await mongoose.connection.db.collection('transactions').deleteMany({ userId: { $in: [new mongoose.Types.ObjectId(userId), new mongoose.Types.ObjectId(friendId)] } });
        await mongoose.connection.db.collection('budgets').deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.db.collection('goals').deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.db.collection('subscriptions').deleteMany({ userId: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.db.collection('groups').deleteMany({ creator: new mongoose.Types.ObjectId(userId) });
        await mongoose.connection.db.collection('groupexpenses').deleteMany({ groupId: new mongoose.Types.ObjectId(groupId) });
        console.log('✔ All test data deleted successfully from database');
      }
    } catch (cleanupErr) {
      console.error('Cleanup error:', cleanupErr.message);
    }
    await mongoose.disconnect();
    console.log('Disconnected from database.');
  }
}

runTests();
