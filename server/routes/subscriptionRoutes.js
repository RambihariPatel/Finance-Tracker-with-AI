import express from 'express';
import {
  getSubscriptions,
  createSubscription,
  updateSubscription,
  deleteSubscription,
  paySubscription
} from '../controllers/subscriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription);

router.route('/:id')
  .put(updateSubscription)
  .delete(deleteSubscription);

router.post('/:id/pay', paySubscription);

export default router;
