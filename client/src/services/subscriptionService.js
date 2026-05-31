import API from './api';

export const getSubscriptions = () => API.get('/subscriptions');
export const createSubscription = (subData) => API.post('/subscriptions', subData);
export const updateSubscription = (id, subData) => API.put(`/subscriptions/${id}`, subData);
export const deleteSubscription = (id) => API.delete(`/subscriptions/${id}`);
export const paySubscription = (id) => API.post(`/subscriptions/${id}/pay`, {});
