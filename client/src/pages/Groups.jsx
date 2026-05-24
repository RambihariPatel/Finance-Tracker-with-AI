import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import API from '../services/api';
import { getCurrencySymbol } from '../utils/format';

function Groups() {
  const { user } = useSelector(state => state.auth);
  
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Create Group Form State
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState(user?.baseCurrency || 'INR');
  const [memberEmailInput, setMemberEmailInput] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);

  // Fetch groups on load
  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await API.get('/groups');
      if (res.data && res.data.success) {
        setGroups(res.data.data);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch groups');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Search users dynamically as the user types email
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (memberEmailInput.trim().length >= 2) {
        try {
          setSearchingUsers(true);
          const res = await API.get(`/groups/search-users?q=${memberEmailInput}`);
          if (res.data && res.data.success) {
            // Filter out already selected members
            const filtered = res.data.data.filter(
              u => !selectedMembers.some(sm => sm._id === u._id)
            );
            setUserSearchResults(filtered);
          }
        } catch (err) {
          console.error(err);
        } finally {
          setSearchingUsers(false);
        }
      } else {
        setUserSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [memberEmailInput, selectedMembers]);

  const handleAddMember = (userToAdd) => {
    setSelectedMembers([...selectedMembers, userToAdd]);
    setMemberEmailInput('');
    setUserSearchResults([]);
  };

  const handleRemoveMember = (userId) => {
    setSelectedMembers(selectedMembers.filter(m => m._id !== userId));
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim()) {
      return toast.error('Please enter a group name');
    }

    try {
      const membersEmails = selectedMembers.map(m => m.email);
      const res = await API.post('/groups', {
        name: groupName,
        description,
        currency,
        membersEmails
      });

      if (res.data && res.data.success) {
        toast.success('Group created successfully!');
        setGroupName('');
        setDescription('');
        setSelectedMembers([]);
        setShowCreateModal(false);
        fetchGroups();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-6 px-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">
            Group Splitter
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Split bills and share expenses with friends, family, or flatmates
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-2.5 px-5 rounded-xl shadow-md hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all flex items-center gap-2 w-max"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          New Group
        </button>
      </div>

      {/* Main Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="mt-4 text-slate-500 dark:text-slate-400 font-medium">Loading your groups...</span>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl p-12 text-center shadow-sm">
          <div className="text-6xl mb-4">👥</div>
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mb-2">No Expense Groups</h3>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
            Create a group to start tracking shared bills, vacation expenses, or room rents.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-bold py-2.5 px-6 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-950/70 transition"
          >
            Create Your First Group
          </button>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(group => (
            <div
              key={group._id}
              className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800/80 p-6 flex flex-col hover:shadow-md hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-xl text-slate-800 dark:text-slate-100 leading-tight">
                    {group.name}
                  </h3>
                  <span className="inline-block mt-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs px-2.5 py-1 rounded-full font-bold">
                    Base: {group.currency} ({getCurrencySymbol(group.currency)})
                  </span>
                </div>
                <div className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-semibold px-2.5 py-1 rounded-lg">
                  {group.members?.length} members
                </div>
              </div>

              {group.description && (
                <p className="text-slate-500 dark:text-slate-400 text-sm mb-5 line-clamp-2">
                  {group.description}
                </p>
              )}

              <div className="mt-auto space-y-4">
                <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                  <span className="text-xs text-slate-400 block mb-1.5 font-medium">Members:</span>
                  <div className="flex flex-wrap gap-1.5 max-h-16 overflow-y-auto">
                    {group.members?.map(m => (
                      <span
                        key={m._id}
                        className="bg-slate-50 dark:bg-slate-800/60 text-slate-600 dark:text-slate-300 text-xs px-2 py-0.5 rounded-md border border-slate-100 dark:border-slate-850"
                      >
                        {m._id === user?.id ? 'You' : m.name}
                      </span>
                    ))}
                  </div>
                </div>

                <Link
                  to={`/groups/${group._id}`}
                  className="w-full py-2.5 rounded-xl font-bold bg-slate-50 hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 text-slate-700 hover:text-white dark:text-slate-300 transition flex justify-center items-center gap-2 border border-slate-200/60 dark:border-slate-700/60 hover:border-transparent dark:hover:border-transparent shadow-sm"
                >
                  Enter Group
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl w-full max-w-lg shadow-2xl p-6 border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">Create New Group</h2>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setGroupName('');
                  setDescription('');
                  setSelectedMembers([]);
                  setMemberEmailInput('');
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Goa Trip 2026, Flat 402, Birthday Party"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={groupName}
                  onChange={e => setGroupName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Description
                </label>
                <textarea
                  placeholder="What is this group for?"
                  rows={2}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition resize-none"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Base Currency
                </label>
                <select
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition"
                  value={currency}
                  onChange={e => setCurrency(e.target.value)}
                >
                  <option value="INR">INR (₹)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="AUD">AUD ($)</option>
                  <option value="CAD">CAD ($)</option>
                  <option value="JPY">JPY (¥)</option>
                </select>
              </div>

              {/* Members Adding Input */}
              <div className="relative">
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Add Members (by registered email)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type email (at least 2 letters)..."
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-slate-800 dark:text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 outline-none transition"
                    value={memberEmailInput}
                    onChange={e => setMemberEmailInput(e.target.value)}
                  />
                </div>

                {/* Dropdown Results */}
                {searchingUsers && (
                  <div className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-lg mt-1 px-4 py-2.5 text-sm text-slate-500">
                    Searching...
                  </div>
                )}
                {userSearchResults.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                    {userSearchResults.map(u => (
                      <li
                        key={u._id}
                        onClick={() => handleAddMember(u)}
                        className="px-4 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-750 cursor-pointer flex justify-between items-center text-sm transition"
                      >
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{u.name}</p>
                          <p className="text-slate-400 dark:text-slate-400 text-xs">{u.email}</p>
                        </div>
                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold text-xs">Add +</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Selected Members list */}
              {selectedMembers.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-slate-400 dark:text-slate-500 font-semibold uppercase">
                    Members to add:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {selectedMembers.map(m => (
                      <span
                        key={m._id}
                        className="bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 text-xs font-semibold px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex items-center gap-1.5"
                      >
                        {m.name} ({m.email})
                        <button
                          type="button"
                          onClick={() => handleRemoveMember(m._id)}
                          className="hover:text-red-500 transition font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl hover:bg-indigo-500 transition shadow-md hover:shadow-indigo-500/20"
              >
                Create Group
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Groups;
