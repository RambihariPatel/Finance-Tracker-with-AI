import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  getGroups,
  createGroup,
  getGroupDetails,
  addExpense,
  deleteExpense,
  searchUsers
} from '../controllers/groupController.js';

const router = express.Router();

router.get('/search-users', protect, searchUsers);

router
  .route('/')
  .get(protect, getGroups)
  .post(protect, createGroup);

router.route('/:id').get(protect, getGroupDetails);
router.route('/:id/expenses').post(protect, addExpense);
router.route('/:id/expenses/:expenseId').delete(protect, deleteExpense);

export default router;
