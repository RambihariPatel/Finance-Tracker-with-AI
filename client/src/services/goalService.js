import API from './api';

export const getGoals = () => API.get('/goals');
export const createGoal = (goalData) => API.post('/goals', goalData);
export const updateGoal = (id, goalData) => API.put(`/goals/${id}`, goalData);
export const addFundsToGoal = (id, amount) => API.post(`/goals/${id}/add-funds`, { amount });
export const deleteGoal = (id) => API.delete(`/goals/${id}`);
