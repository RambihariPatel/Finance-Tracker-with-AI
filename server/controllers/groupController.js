import mongoose from 'mongoose';
import Group from '../models/Group.js';
import GroupExpense from '../models/GroupExpense.js';
import User from '../models/User.js';

// @desc    Search users by email for adding to group
// @route   GET /api/groups/search-users
// @access  Private
export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) {
      return res.status(200).json({ success: true, data: [] });
    }

    const query = q.trim().toLowerCase();
    const users = await User.find({
      email: { $regex: '^' + query, $options: 'i' },
      _id: { $ne: req.userId } // Exclude current user
    })
      .select('name email')
      .limit(10);

    res.status(200).json({
      success: true,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get all groups for logged in user
// @route   GET /api/groups
// @access  Private
export const getGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.userId })
      .sort({ createdAt: -1 })
      .populate('members', 'name email')
      .populate('creator', 'name email');

    res.status(200).json({
      success: true,
      count: groups.length,
      data: groups
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Create new group
// @route   POST /api/groups
// @access  Private
export const createGroup = async (req, res) => {
  try {
    const { name, description, membersEmails, currency } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a group name'
      });
    }

    const lowercaseEmails = (membersEmails || [])
      .map(e => e.trim().toLowerCase())
      .filter(Boolean);

    // Find users by email
    const foundUsers = await User.find({ email: { $in: lowercaseEmails } });
    const foundEmails = foundUsers.map(u => u.email.toLowerCase());
    const missingEmails = lowercaseEmails.filter(email => !foundEmails.includes(email));

    if (missingEmails.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Registered users not found for: ${missingEmails.join(', ')}`
      });
    }

    const memberIds = foundUsers.map(u => u._id);
    
    // Add current user as member if not present
    if (!memberIds.some(id => id.toString() === req.userId.toString())) {
      memberIds.push(req.userId);
    }

    const group = await Group.create({
      name: name.trim(),
      description: description?.trim() || '',
      members: memberIds,
      creator: req.userId,
      currency: currency || 'INR'
    });

    const populatedGroup = await Group.findById(group._id)
      .populate('members', 'name email')
      .populate('creator', 'name email');

    res.status(201).json({
      success: true,
      data: populatedGroup
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Get group details, expenses, and current balances
// @route   GET /api/groups/:id
// @access  Private
export const getGroupDetails = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email')
      .populate('creator', 'name email');

    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Check if user is a member
    const isMember = group.members.some(m => m._id.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this group'
      });
    }

    // Fetch expenses
    const expenses = await GroupExpense.find({ groupId: req.params.id })
      .sort({ date: -1, createdAt: -1 })
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email');

    // Calculate Net Balances
    const balances = {};
    group.members.forEach(member => {
      balances[member._id.toString()] = {
        user: {
          _id: member._id,
          name: member.name,
          email: member.email
        },
        balance: 0
      };
    });

    expenses.forEach(expense => {
      const payerId = expense.paidBy._id.toString();
      if (balances[payerId]) {
        balances[payerId].balance += expense.amount;
      }

      expense.splits.forEach(split => {
        const splitUserId = split.userId._id.toString();
        if (balances[splitUserId]) {
          balances[splitUserId].balance -= split.amount;
        }
      });
    });

    const netBalances = Object.values(balances);

    // Compute Simplified Debts
    const debtors = [];
    const creditors = [];

    netBalances.forEach(b => {
      if (b.balance > 0.01) {
        creditors.push({ ...b, balance: b.balance });
      } else if (b.balance < -0.01) {
        debtors.push({ ...b, balance: b.balance });
      }
    });

    // Sort: most negative and most positive first
    debtors.sort((a, b) => a.balance - b.balance);
    creditors.sort((a, b) => b.balance - a.balance);

    const simplifiedDebts = [];
    let dIdx = 0;
    let cIdx = 0;

    // Deep copy to prevent mutating the balances array
    const tempDebtors = debtors.map(d => ({ ...d }));
    const tempCreditors = creditors.map(c => ({ ...c }));

    while (dIdx < tempDebtors.length && cIdx < tempCreditors.length) {
      const debtor = tempDebtors[dIdx];
      const creditor = tempCreditors[cIdx];

      const oweAmount = -debtor.balance;
      const creditAmount = creditor.balance;

      const settleAmount = Math.min(oweAmount, creditAmount);

      simplifiedDebts.push({
        from: debtor.user,
        to: creditor.user,
        amount: Number(settleAmount.toFixed(2))
      });

      debtor.balance += settleAmount;
      creditor.balance -= settleAmount;

      if (Math.abs(debtor.balance) < 0.01) dIdx++;
      if (Math.abs(creditor.balance) < 0.01) cIdx++;
    }

    res.status(200).json({
      success: true,
      data: {
        group,
        expenses,
        netBalances,
        simplifiedDebts
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Add a group expense or settlement
// @route   POST /api/groups/:id/expenses
// @access  Private
export const addExpense = async (req, res) => {
  try {
    const { description, amount, paidBy, splitType, splits, category, date, isSettlement } = req.body;
    const groupId = req.params.id;

    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    // Verify logged in user is a member
    const isMember = group.members.some(m => m.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to add expenses to this group'
      });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0'
      });
    }

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a description'
      });
    }

    // Validate splits
    if (!splits || splits.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify members for splitting'
      });
    }

    let finalSplits = [];

    if (splitType === 'equal') {
      const splitAmount = Number((amount / splits.length).toFixed(2));
      let runningTotal = 0;

      finalSplits = splits.map((s, idx) => {
        // Last split gets the remaining amount to avoid rounding errors
        const splitAmt = idx === splits.length - 1 
          ? Number((amount - runningTotal).toFixed(2)) 
          : splitAmount;
        
        runningTotal = Number((runningTotal + splitAmt).toFixed(2));

        return {
          userId: s.userId,
          amount: splitAmt
        };
      });
    } else {
      // Custom splits validation
      let sum = 0;
      finalSplits = splits.map(s => {
        const amt = Number(s.amount);
        sum = Number((sum + amt).toFixed(2));
        return {
          userId: s.userId,
          amount: amt
        };
      });

      if (Math.abs(sum - amount) > 0.05) {
        return res.status(400).json({
          success: false,
          message: `The sum of splits (${sum}) does not equal the total amount (${amount})`
        });
      }
    }

    const expense = await GroupExpense.create({
      groupId,
      paidBy,
      amount,
      description: description.trim(),
      category: category || 'Other',
      splitType,
      splits: finalSplits,
      isSettlement: isSettlement || false,
      date: date || new Date()
    });

    const populatedExpense = await GroupExpense.findById(expense._id)
      .populate('paidBy', 'name email')
      .populate('splits.userId', 'name email');

    res.status(201).json({
      success: true,
      data: populatedExpense
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// @desc    Delete a group expense
// @route   DELETE /api/groups/:id/expenses/:expenseId
// @access  Private
export const deleteExpense = async (req, res) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Group not found'
      });
    }

    const expense = await GroupExpense.findById(req.params.expenseId);
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense not found'
      });
    }

    // Only allow deletion if user is: creator of group OR creator of expense/payer
    const isGroupCreator = group.creator.toString() === req.userId;
    const isPayer = expense.paidBy.toString() === req.userId;

    if (!isGroupCreator && !isPayer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this expense'
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
