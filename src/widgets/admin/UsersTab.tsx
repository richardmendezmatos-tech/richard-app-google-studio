'use client';

import { useState, useEffect, useCallback } from 'react';
import { Shield, ShieldCheck, ShieldAlert, Trash2, Search, Mail, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  email_verified: boolean;
  is_blocked: boolean;
  created_at: string;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
}

const roleColors: Record<string, string> = {
  admin: 'text-rose-400 bg-rose-500/10 border-rose-500/30',
  editor: 'text-amber-400 bg-amber-500/10 border-amber-500/30',
  agent: 'text-purple-400 bg-purple-500/10 border-purple-500/30',
  user: 'text-slate-400 bg-slate-500/10 border-slate-500/30',
};

export default function UsersTab() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/users');
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setUsers(data.users || []);
    } catch {
      console.error('Error fetching users');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const updateUser = async (id: string, updates: Partial<Profile>) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, ...updates }),
    });

    if (res.ok) {
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, ...updates } : u)),
      );
    }
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setConfirmDelete(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">
            User Management
          </h2>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mt-1">
            {users.length} registered users
          </p>
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search users..."
            className="pl-9 pr-4 py-2 bg-black/20 border border-white/10 rounded-lg text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-primary/50 w-64"
          />
        </div>
      </div>

      <div className="bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="text-left p-4 pl-6">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Verified</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-right p-4 pr-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center">
                    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-500 text-xs font-medium">
                    No users found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr
                    key={user.id}
                    className="border-b border-white/5 last:border-0 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                          {user.avatar_url ? (
                            <img
                              src={user.avatar_url}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <UserIcon size={14} className="text-slate-400" />
                          )}
                        </div>
                        <span className="text-white font-medium text-xs">
                          {user.full_name || 'Unnamed'}
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <Mail size={12} className="text-slate-500" />
                        <span className="text-slate-300 text-xs">{user.email || '—'}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={user.role}
                        onChange={(e) => updateUser(user.id, { role: e.target.value })}
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${roleColors[user.role] || roleColors['user']} bg-transparent cursor-pointer focus:outline-none`}
                      >
                        <option value="user">User</option>
                        <option value="editor">Editor</option>
                        <option value="agent">Agent</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      {user.email_verified ? (
                        <span className="flex items-center gap-1.5 text-emerald-400 text-[10px] font-bold">
                          <ShieldCheck size={12} />
                          Verified
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-amber-400 text-[10px] font-bold">
                          <ShieldAlert size={12} />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="p-4">
                      {user.is_blocked ? (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 px-2 py-1 rounded-full">
                          Blocked
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500 text-[10px] font-medium">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() =>
                            updateUser(user.id, { is_blocked: !user.is_blocked })
                          }
                          className={`p-2 rounded-lg transition-all ${
                            user.is_blocked
                              ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20'
                          }`}
                          title={user.is_blocked ? 'Unblock' : 'Block'}
                        >
                          <Shield size={14} />
                        </button>
                        <AnimatePresence>
                          {confirmDelete === user.id ? (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="flex gap-1"
                            >
                              <button
                                onClick={() => deleteUser(user.id)}
                                className="px-2 py-1.5 bg-rose-500/20 text-rose-400 rounded-lg text-[10px] font-bold hover:bg-rose-500/30 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-2 py-1.5 bg-white/5 text-slate-400 rounded-lg text-[10px] font-bold hover:bg-white/10 transition-colors"
                              >
                                Cancel
                              </button>
                            </motion.div>
                          ) : (
                            <button
                              onClick={() => setConfirmDelete(user.id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 transition-all"
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
