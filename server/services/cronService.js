import cron from 'node-cron';
import Subscription from '../models/Subscription.js';
import Transaction from '../models/Transaction.js';
import { convertAmount } from './currencyService.js';

export const initCronJobs = () => {
  // Run every day at 00:00 (Midnight)
  cron.schedule('0 0 * * *', async () => {
    console.log('Running daily subscription check...');
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Find all active subscriptions where nextDueDate is today or earlier
      const dueSubscriptions = await Subscription.find({
        status: 'active',
        nextDueDate: { $lte: today }
      });

      for (const sub of dueSubscriptions) {
        // 1. Convert amount based on today's live rate
        // We need the user's baseCurrency to calculate baseAmount correctly
        const user = await sub.populate('userId');
        const userBaseCurrency = user.userId.baseCurrency || 'INR';
        const liveBaseAmount = await convertAmount(sub.amount, sub.currency, userBaseCurrency);

        // 2. Create the transaction
        await Transaction.create({
          userId: sub.userId._id,
          type: 'expense',
          title: `[Auto] ${sub.title}`,
          amount: sub.amount,
          currency: sub.currency,
          baseAmount: liveBaseAmount,
          category: sub.category,
          paymentMethod: 'other',
          description: `Automated deduction for ${sub.frequency} subscription.`,
          transactionDate: sub.nextDueDate
        });

        // 3. Calculate next due date
        let nextDate = new Date(sub.nextDueDate);
        if (sub.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else if (sub.frequency === 'monthly') {
          nextDate.setMonth(nextDate.getMonth() + 1);
        } else if (sub.frequency === 'yearly') {
          nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        // If the calculated nextDate is STILL in the past (e.g. server was off for months), 
        // fast forward it to the next future date to prevent spamming transactions.
        while (nextDate <= today) {
          if (sub.frequency === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
          else if (sub.frequency === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
          else if (sub.frequency === 'yearly') nextDate.setFullYear(nextDate.getFullYear() + 1);
        }

        // 4. Update the subscription
        sub.nextDueDate = nextDate;
        // Update the baseAmount in subscription just in case the exchange rate shifted significantly
        sub.baseAmount = liveBaseAmount; 
        sub.lastPaidDate = new Date();
        await sub.save();
        
        console.log(`Processed subscription: ${sub.title} for user ${sub.userId._id}`);
      }
    } catch (error) {
      console.error('Error in daily subscription cron job:', error);
    }
  });
  console.log('Cron jobs initialized.');
};
