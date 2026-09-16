'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import Badge from '@/components/atoms/Badge';
import ErrorState from '@/components/molecules/ErrorState';
import { usersService } from '@/services/users.service';
import { showToast } from '@/utils/toast';
import { useAuth } from '@/context/AuthContext';
import type { User, UserRole } from '@/types';

type RoleFilter = 'all' | 'admin' | 'user';

const FILTER_TABS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'All Accounts' },
  { value: 'admin', label: 'Admins' },
  { value: 'user', label: 'Users' },
];

function formatDate(iso?: string): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const [search, setSearch] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmRoleId, setConfirmRoleId] = useState<string | null>(null);

  // ─── Data Fetching ─────────────────────────────────────────────────────────
  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => usersService.getAll(),
  });

  const users: User[] = useMemo(() => {
    const all = (usersQuery.data?.success && usersQuery.data.data) ? usersQuery.data.data : [];
    const byRole = roleFilter === 'all' ? all : all.filter((u) => u.role === roleFilter);
    if (!search.trim()) return byRole;
    const q = search.toLowerCase();
    return byRole.filter(
      (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }, [usersQuery.data, roleFilter, search]);

  const allUsers: User[] = (usersQuery.data?.success && usersQuery.data.data) ? usersQuery.data.data : [];

  // ─── Mutations ─────────────────────────────────────────────────────────────
  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersService.setRole(id, role),
    onSuccess: (res, { role }) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        showToast('success', `Role updated to ${role} successfully.`);
      }
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Failed to update role.');
    },
    onSettled: () => setConfirmRoleId(null),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => usersService.deleteUser(id),
    onSuccess: (res) => {
      if (res.success) {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        showToast('success', 'User deleted successfully.');
      }
    },
    onError: (err: any) => {
      showToast('error', err.response?.data?.message || 'Failed to delete user.');
    },
    onSettled: () => setConfirmDeleteId(null),
  });

  const handleRoleToggle = (user: User) => {
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    roleMutation.mutate({ id: user.id, role: newRole });
  };

  // ─── Counts ────────────────────────────────────────────────────────────────
  const counts = useMemo(
    () => ({
      all: allUsers.length,
      admin: allUsers.filter((u) => u.role === 'admin').length,
      user: allUsers.filter((u) => u.role === 'user').length,
    }),
    [allUsers]
  );

  return (
    <AdminRoute>
      <AdminLayout>
        <div className="space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Manage Users
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                View, promote, demote, or remove registered accounts.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 font-bold text-slate-500">
                <i className="fa-solid fa-users text-slate-400 text-[12px]" />
                <span>{counts.all} registered account{counts.all !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Search + Filter Row */}
          {!usersQuery.isLoading && !usersQuery.isError && (
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] pointer-events-none" />
                <input
                  id="users-search"
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <i className="fa-solid fa-xmark text-[11px]" />
                  </button>
                )}
              </div>

              {/* Role filter tabs */}
              <div className="flex flex-wrap gap-2">
                {FILTER_TABS.map((tab) => {
                  const count = counts[tab.value];
                  const isActive = roleFilter === tab.value;
                  return (
                    <button
                      key={tab.value}
                      onClick={() => setRoleFilter(tab.value)}
                      className={`px-3.5 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
                        isActive
                          ? 'bg-teal-500 text-white shadow-md shadow-teal-500/15'
                          : 'bg-white text-slate-500 border border-slate-200/80 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/40'
                      }`}
                    >
                      <span>{tab.label}</span>
                      <span
                        className={`min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-400'
                        }`}
                      >
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Content */}
          {usersQuery.isLoading ? (
            <div className="py-20 flex flex-col items-center gap-3">
              <Spinner size="md" />
              <span className="text-xs text-slate-400 font-bold tracking-wide">Loading users…</span>
            </div>
          ) : usersQuery.isError ? (
            <ErrorState
              onRetry={() => usersQuery.refetch()}
              description={(usersQuery.error as any)?.response?.data?.message || 'Failed to load users.'}
            />
          ) : allUsers.length === 0 ? (
            <div className="py-16 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-3xl mb-2">👤</p>
              <p className="text-sm font-bold text-slate-500">No registered accounts yet.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
              <p className="text-2xl mb-2">🔍</p>
              <p className="text-sm font-bold text-slate-500">No accounts match your search.</p>
              <button
                onClick={() => { setSearch(''); setRoleFilter('all'); }}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
              >
                Clear filters →
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/60">
                    <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                      Account
                    </th>
                    <th className="text-left px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-left px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="text-left px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider hidden md:table-cell">
                      Joined
                    </th>
                    <th className="text-right px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((user) => {
                    const isSelf = user.id === currentUser?.id;
                    const isConfirmingDelete = confirmDeleteId === user.id;
                    const isConfirmingRole = confirmRoleId === user.id;
                    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
                    const isDeletingThis = deleteMutation.isPending && confirmDeleteId === user.id;
                    const isUpdatingRole = roleMutation.isPending && confirmRoleId === user.id;

                    return (
                      <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                        {/* Avatar + Name */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center text-xs font-extrabold flex-shrink-0 ${
                                user.role === 'admin'
                                  ? 'bg-teal-100 text-teal-700'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {getInitials(user.name)}
                            </div>
                            <div className="min-w-0">
                              <div className="font-bold text-slate-800 truncate">
                                {user.name}
                                {isSelf && (
                                  <span className="ml-1.5 text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-slate-400 truncate sm:hidden">
                                {user.email}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="px-4 py-4 hidden sm:table-cell">
                          <span className="text-slate-600 font-medium">{user.email}</span>
                        </td>

                        {/* Role Badge */}
                        <td className="px-4 py-4">
                          <Badge variant={user.role === 'admin' ? 'primary' : 'slate'}>
                            {user.role === 'admin' ? (
                              <><i className="fa-solid fa-shield-halved mr-1 text-[9px]" />Admin</>
                            ) : (
                              <><i className="fa-solid fa-user mr-1 text-[9px]" />User</>
                            )}
                          </Badge>
                        </td>

                        {/* Joined Date */}
                        <td className="px-4 py-4 hidden md:table-cell">
                          <span className="text-slate-400 font-medium">{formatDate(user.createdAt)}</span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {/* Role toggle */}
                            {!isSelf && (
                              isConfirmingRole ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-slate-500 font-semibold whitespace-nowrap">
                                    Make {newRole}?
                                  </span>
                                  <button
                                    onClick={() => handleRoleToggle(user)}
                                    disabled={isUpdatingRole}
                                    className="px-2.5 py-1.5 rounded-lg bg-teal-500 text-white text-[10px] font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {isUpdatingRole ? 'Saving…' : 'Confirm'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmRoleId(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmRoleId(user.id)}
                                  title={`Change role to ${newRole}`}
                                  className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-500 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all whitespace-nowrap"
                                >
                                  <i className={`fa-solid ${newRole === 'admin' ? 'fa-shield-halved' : 'fa-user'} mr-1`} />
                                  Make {newRole}
                                </button>
                              )
                            )}

                            {/* Delete */}
                            {!isSelf && (
                              isConfirmingDelete ? (
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[10px] text-rose-500 font-semibold whitespace-nowrap">
                                    Delete?
                                  </span>
                                  <button
                                    onClick={() => deleteMutation.mutate(user.id)}
                                    disabled={isDeletingThis}
                                    className="px-2.5 py-1.5 rounded-lg bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                  >
                                    {isDeletingThis ? 'Deleting…' : 'Yes, delete'}
                                  </button>
                                  <button
                                    onClick={() => setConfirmDeleteId(null)}
                                    className="px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-bold hover:bg-slate-200 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              ) : (
                                <button
                                  onClick={() => setConfirmDeleteId(user.id)}
                                  title="Delete user"
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-all"
                                >
                                  <i className="fa-solid fa-trash text-[12px]" />
                                </button>
                              )
                            )}

                            {isSelf && (
                              <span className="text-[10px] text-slate-400 font-medium italic pr-1">
                                Your account
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
