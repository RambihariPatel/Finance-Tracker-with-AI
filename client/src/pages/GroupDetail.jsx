import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import API from '../services/api';
import { getCurrencySymbol, formatDate } from '../utils/format';

const CATEGORIES = ['Food', 'Rent', 'Transport', 'Shopping', 'Entertainment', 'Bills', 'Healthcare', 'Education', 'Other'];

function GroupDetail() {
  const { id } = useParams();
  const { user } = useSelector(state => state.auth);

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [netBalances, setNetBalances] = useState([]);
  const [simplifiedDebts, setSimplifiedDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);

  // Add Expense Form State
  const [expenseForm, setExpenseForm] = useState({
    description: '',
    amount: '',
    paidBy: '',
    splitType: 'equal',
    category: 'Food',
    date: new Date().toISOString().slice(0, 10),
  });

  // Custom splits and checkbox states for splits
  const [memberSplits, setMemberSplits] = useState({}); // userId -> amount
  const [splitCheckboxState, setSplitCheckboxState] = useState({}); // userId -> boolean

  // Settle Up Form State
  const [settleForm, setSettleForm] = useState({
    fromUserId: '',
    toUserId: '',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
  });

  // Fetch all group details
  const fetchGroupDetails = async () => {
    try {
      setLoading(true);
      const res = await API.get(`/groups/${id}`);
      if (res.data && res.data.success) {
        const { group, expenses, netBalances, simplifiedDebts } = res.data.data;
        setGroup(group);
        setExpenses(expenses);
        setNetBalances(netBalances);
        setSimplifiedDebts(simplifiedDebts);

        // Pre-fill defaults
        setExpenseForm(prev => ({
          ...prev,
          paidBy: user?.id || group.members[0]?._id,
        }));
        
        // Pre-populate split lists (everyone active by default)
        const initialChecks = {};
        const initialSplits = {};
        group.members.forEach(m => {
          initialChecks[m._id] = true;
          initialSplits[m._id] = '';
        });
        setSplitCheckboxState(initialChecks);
        setMemberSplits(initialSplits);

        setSettleForm(prev => ({
          ...prev,
          fromUserId: user?.id || group.members[0]?._id,
          toUserId: group.members.find(m => m._id !== user?.id)?._id || '',
        }));
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroupDetails();
  }, [id]);

  // Handles adding an expense
  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const { description, amount, paidBy, splitType, category, date } = expenseForm;

    if (!description.trim()) return toast.error('Please enter a description');
    if (!amount || Number(amount) <= 0) return toast.error('Please enter a valid amount');
    if (!paidBy) return toast.error('Please select who paid');

    let formattedSplits = [];
    const numAmount = Number(amount);

    if (splitType === 'equal') {
      const activeMembers = Object.keys(splitCheckboxState).filter(mId => splitCheckboxState[mId]);
      if (activeMembers.length === 0) {
        return toast.error('Please select at least one member to split the expense');
      }
      formattedSplits = activeMembers.map(mId => ({ userId: mId }));
    } else {
      // Custom splits calculation & verification
      let customSum = 0;
      const parsedSplits = [];
      
      for (const mId of Object.keys(memberSplits)) {
        const val = Number(memberSplits[mId] || 0);
        if (val < 0) return toast.error('Split amounts cannot be negative');
        if (val > 0) {
          customSum += val;
          parsedSplits.push({ userId: mId, amount: val });
        }
      }

      if (parsedSplits.length === 0) {
        return toast.error('Please assign split amounts to members');
      }

      if (Math.abs(customSum - numAmount) > 0.05) {
        return toast.error(`Sum of split amounts (${customSum.toFixed(2)}) must equal total amount (${numAmount.toFixed(2)})`);
      }
      formattedSplits = parsedSplits;
    }

    try {
      const res = await API.post(`/groups/${id}/expenses`, {
        description,
        amount: numAmount,
        paidBy,
        splitType,
        splits: formattedSplits,
        category,
        date,
        isSettlement: false
      });

      if (res.data && res.data.success) {
        toast.success('Expense added successfully!');
        setShowExpenseModal(false);
        // Reset form except fields like paidBy and date
        setExpenseForm(prev => ({
          ...prev,
          description: '',
          amount: '',
          splitType: 'equal',
        }));
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    }
  };

  // Handles adding a settlement transaction
  const handleSettleSubmit = async (e) => {
    e.preventDefault();
    const { fromUserId, toUserId, amount, date } = settleForm;

    if (!fromUserId || !toUserId) return toast.error('Please select sender and receiver');
    if (fromUserId === toUserId) return toast.error('Sender and receiver cannot be the same person');
    if (!amount || Number(amount) <= 0) return toast.error('Please enter a valid amount');

    const numAmount = Number(amount);

    try {
      const fromName = group.members.find(m => m._id === fromUserId)?.name || 'Member';
      const toName = group.members.find(m => m._id === toUserId)?.name || 'Member';

      const res = await API.post(`/groups/${id}/expenses`, {
        description: `Settlement: ${fromName} paid ${toName}`,
        amount: numAmount,
        paidBy: fromUserId,
        splitType: 'custom',
        splits: [{ userId: toUserId, amount: numAmount }],
        category: 'Other',
        date,
        isSettlement: true
      });

      if (res.data && res.data.success) {
        toast.success('Debt settled successfully!');
        setShowSettleModal(false);
        setSettleForm(prev => ({
          ...prev,
          amount: '',
        }));
        fetchGroupDetails();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle debt');
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        const res = await API.delete(`/groups/${id}/expenses/${expenseId}`);
        if (res.data && res.data.success) {
          toast.success('Expense deleted');
          fetchGroupDetails();
        }
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to delete expense');
      }
    }
  };

  const triggerSettleUpFromDebt = (debt) => {
    setSettleForm({
      fromUserId: debt.from._id,
      toUserId: debt.to._id,
      amount: debt.amount,
      date: new Date().toISOString().slice(0, 10)
    });
    setShowSettleModal(true);
  };

  if (loading && !group) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <span className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading group details...</span>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="text-center py-20 text-slate-500">
        <p>Group not found or access denied.</p>
        <Link to="/groups" className="text-indigo-500 font-bold mt-4 inline-block hover:underline">
          Back to Groups
        </Link>
      </div>
    );
  }

  const currencySymbol = getCurrencySymbol(group.currency);

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      {/* Back & Title */}
      <div className="space-y-2">
        <Link
          to="/groups"
          className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Groups
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
              {group.name}
            </h1>
            {group.description && (
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 max-w-xl">
                {group.description}
              </p>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowSettleModal(true)}
              className="px-5 py-2.5 rounded-xl font-bold border border-emerald-500/20 bg-emerald-50 dark:bg-emerald-950/20 hover:bg-emerald-100 dark:hover:bg-emerald-950/40 text-emerald-600 dark:text-emerald-455 transition shadow-sm"
            >
              💸 Settle Up
            </button>
            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-5 py-2.5 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Add Expense
            </button>
          </div>
        </div>
      </div>

      {/* Grid: 2 columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left Column: Expenses list */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-2">
              📝 Group Transactions
              <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold px-2 py-0.5 rounded-md">
                {expenses.length}
              </span>
            </h2>

            {expenses.length === 0 ? (
              <div className="text-center py-16 text-slate-400 dark:text-slate-500">
                <div className="text-4xl mb-2">💸</div>
                <p>No expenses added yet.</p>
                <button
                  onClick={() => setShowExpenseModal(true)}
                  className="mt-3 text-indigo-500 hover:underline font-semibold text-sm"
                >
                  Add the first expense
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/60 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                {expenses.map(expense => {
                  const isUserPaid = expense.paidBy._id === user?.id;
                  const isSettlement = expense.isSettlement;

                  return (
                    <div
                      key={expense._id}
                      className={`py-4 flex items-center justify-between gap-4 transition group ${
                        isSettlement ? 'bg-emerald-50/10 dark:bg-emerald-950/5 border-l-2 border-emerald-500 px-3 rounded-r-lg my-1' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg ${
                          isSettlement 
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400' 
                            : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400'
                        }`}>
                          {isSettlement ? '🤝' : '🛍️'}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-100 leading-tight">
                            {expense.description}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-slate-400 dark:text-slate-500 font-medium">
                            <span>Paid by: {isUserPaid ? 'You' : expense.paidBy.name}</span>
                            <span>•</span>
                            <span>{formatDate(expense.date)}</span>
                            {!isSettlement && (
                              <>
                                <span>•</span>
                                <span className="bg-slate-150 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">
                                  {expense.category}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className={`font-black text-lg ${
                            isSettlement ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100'
                          }`}>
                            {currencySymbol}{expense.amount.toFixed(2)}
                          </p>
                          {!isSettlement && (
                            <span className="text-[10px] text-slate-400 font-medium block">
                              Split: {expense.splitType}
                            </span>
                          )}
                        </div>
                        
                        {/* Delete option */}
                        {(group.creator._id === user?.id || expense.paidBy._id === user?.id) && (
                          <button
                            onClick={() => handleDeleteExpense(expense._id)}
                            className="text-slate-350 hover:text-red-500 dark:hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                            title="Delete Transaction"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Balances and Debts */}
        <div className="space-y-6">
          {/* Section: Balances */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">👥 Member Balances</h2>
            <div className="space-y-3">
              {netBalances.map(b => {
                const isMe = b.user._id === user?.id;
                const bal = b.balance;
                
                return (
                  <div
                    key={b.user._id}
                    className={`flex items-center justify-between p-3 rounded-xl border border-transparent transition-all ${
                      isMe 
                        ? 'bg-indigo-50/30 dark:bg-indigo-950/10 border-indigo-500/20 shadow-sm' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div>
                      <p className={`font-bold text-sm ${isMe ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-700 dark:text-slate-200'}`}>
                        {b.user.name} {isMe && '(You)'}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500 font-medium">
                        {b.user.email}
                      </p>
                    </div>
                    <div className="text-right">
                      {bal > 0.01 ? (
                        <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                          Owed: {currencySymbol}{bal.toFixed(2)}
                        </span>
                      ) : bal < -0.01 ? (
                        <span className="text-sm font-extrabold text-red-500 dark:text-red-400 font-mono">
                          Owes: {currencySymbol}{Math.abs(bal).toFixed(2)}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                          Settled Up
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section: Simplified Debts */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6">
            <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 flex items-center gap-1.5">
              🤝 Simplified Debts
            </h2>

            {simplifiedDebts.length === 0 ? (
              <p className="text-center py-8 text-slate-400 dark:text-slate-500 text-sm font-medium">
                Everything is settled up! 🎉
              </p>
            ) : (
              <div className="space-y-4">
                {simplifiedDebts.map((debt, index) => {
                  const isIowe = debt.from._id === user?.id;

                  return (
                    <div
                      key={index}
                      className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-4 transition hover:shadow-sm"
                    >
                      <div className="text-sm text-slate-650 dark:text-slate-300 leading-relaxed font-medium">
                        <span className="font-extrabold text-slate-800 dark:text-white">
                          {debt.from.name}
                        </span>{' '}
                        owes{' '}
                        <span className="font-extrabold text-slate-800 dark:text-white">
                          {debt.to.name}
                        </span>
                        <p className="text-base font-black text-indigo-600 dark:text-indigo-400 mt-1">
                          {currencySymbol}{debt.amount.toFixed(2)}
                        </p>
                      </div>
                      
                      {isIowe && (
                        <button
                          onClick={() => triggerSettleUpFromDebt(debt)}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs py-2 px-3 rounded-lg shadow-sm hover:shadow-indigo-500/10 transition"
                        >
                          Settle Debt
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Add Expense */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Add Group Expense</h2>
              <button
                onClick={() => setShowExpenseModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleExpenseSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition font-bold"
                    value={expenseForm.amount}
                    onChange={e => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                    value={expenseForm.category}
                    onChange={e => setExpenseForm({ ...expenseForm, category: e.target.value })}
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dinner, Rent, Grocery shopping"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={expenseForm.description}
                  onChange={e => setExpenseForm({ ...expenseForm, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Paid By *
                  </label>
                  <select
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                    value={expenseForm.paidBy}
                    onChange={e => setExpenseForm({ ...expenseForm, paidBy: e.target.value })}
                  >
                    {group.members.map(m => (
                      <option key={m._id} value={m._id}>{m._id === user?.id ? 'You' : m.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={expenseForm.date}
                    onChange={e => setExpenseForm({ ...expenseForm, date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Split Type
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium mb-3"
                  value={expenseForm.splitType}
                  onChange={e => setExpenseForm({ ...expenseForm, splitType: e.target.value })}
                >
                  <option value="equal">Split Equally</option>
                  <option value="custom">Custom Split</option>
                </select>
              </div>

              {/* Splits Member Fields */}
              <div className="border border-slate-100 dark:border-slate-800 rounded-xl p-3.5 bg-slate-50/50 dark:bg-slate-900/30 max-h-48 overflow-y-auto custom-scrollbar">
                <span className="text-xs text-slate-400 dark:text-slate-550 uppercase font-semibold block mb-2">
                  Split Between:
                </span>
                
                {expenseForm.splitType === 'equal' ? (
                  <div className="space-y-2.5">
                    {group.members.map(m => (
                      <label key={m._id} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700 dark:text-slate-300 font-medium">
                        <input
                          type="checkbox"
                          className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4"
                          checked={splitCheckboxState[m._id] || false}
                          onChange={e => setSplitCheckboxState({ ...splitCheckboxState, [m._id]: e.target.checked })}
                        />
                        {m._id === user?.id ? 'You' : m.name}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {group.members.map(m => (
                      <div key={m._id} className="flex items-center justify-between gap-3 text-sm">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {m._id === user?.id ? 'You' : m.name}
                        </span>
                        <div className="relative w-32 flex-shrink-0">
                          <span className="absolute left-2.5 top-2 text-xs text-slate-400 font-semibold">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            className="w-full pl-6 pr-2 py-1 text-sm bg-white dark:bg-slate-850 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-white font-bold outline-none focus:ring-1 focus:ring-indigo-500 text-right"
                            value={memberSplits[m._id] || ''}
                            onChange={e => setMemberSplits({ ...memberSplits, [m._id]: e.target.value })}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition shadow-md hover:shadow-indigo-500/20"
              >
                Save Expense
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Settle Up */}
      {showSettleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-md shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Record a Payment</h2>
              <button
                onClick={() => setShowSettleModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSettleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Who is paying? *
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  value={settleForm.fromUserId}
                  onChange={e => setSettleForm({ ...settleForm, fromUserId: e.target.value })}
                >
                  {group.members.map(m => (
                    <option key={m._id} value={m._id}>{m._id === user?.id ? 'You' : m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Who is receiving? *
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition font-medium"
                  value={settleForm.toUserId}
                  onChange={e => setSettleForm({ ...settleForm, toUserId: e.target.value })}
                >
                  {group.members.map(m => (
                    <option key={m._id} value={m._id}>{m._id === user?.id ? 'You' : m.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Amount ({currencySymbol}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="0.00"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition font-black"
                    value={settleForm.amount}
                    onChange={e => setSettleForm({ ...settleForm, amount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={settleForm.date}
                    onChange={e => setSettleForm({ ...settleForm, date: e.target.value })}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition shadow-md hover:shadow-emerald-500/20"
              >
                Record Settlement
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupDetail;
