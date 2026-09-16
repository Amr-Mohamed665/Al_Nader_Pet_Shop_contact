'use client';

import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/templates/AdminLayout';
import AdminRoute from '@/components/guards/AdminRoute';
import Spinner from '@/components/atoms/Spinner';
import Badge from '@/components/atoms/Badge';
import ErrorState from '@/components/molecules/ErrorState';
import BulkEmailModal from '@/components/molecules/BulkEmailModal';
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

  // ─── Selection & Bulk Email State ──────────────────────────────────────────
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [customCount, setCustomCount] = useState<string>('5');
  const [isBulkEmailOpen, setIsBulkEmailOpen] = useState(false);

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

  // Selected User Objects
  const selectedUsers: User[] = useMemo(() => {
    return allUsers.filter((u) => selectedUserIds.includes(u.id));
  }, [allUsers, selectedUserIds]);

  // Selection Handlers
  const handleToggleUser = (id: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const isAllVisibleSelected = useMemo(() => {
    if (users.length === 0) return false;
    return users.every((u) => selectedUserIds.includes(u.id));
  }, [users, selectedUserIds]);

  const handleSelectAllVisible = () => {
    const visibleIds = users.map((u) => u.id);
    if (isAllVisibleSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleSelectCount = (count: number) => {
    if (count <= 0) return;
    const subset = users.slice(0, count).map((u) => u.id);
    setSelectedUserIds(subset);
    showToast('info', `Selected top ${subset.length} account(s).`);
  };

  const handleCopyEmails = () => {
    if (selectedUsers.length === 0) return;
    const emailList = selectedUsers.map((u) => u.email).join(', ');
    navigator.clipboard.writeText(emailList);
    showToast('success', `Copied ${selectedUsers.length} email address(es) to clipboard!`);
  };

  const handleExportCSV = () => {
    if (selectedUsers.length === 0) return;
    const headers = ['ID', 'Name', 'Email', 'Role', 'Joined Date'];
    const rows = selectedUsers.map((u) => [
      u.id,
      `"${u.name.replace(/"/g, '""')}"`,
      u.email,
      u.role,
      formatDate(u.createdAt),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `al_nader_registered_emails_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', `Exported ${selectedUsers.length} user(s) to CSV!`);
  };

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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Manage Users</span>
                <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-0.5 rounded-full">
                  Email Collector Active
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                View, filter, select, export registered emails, or send bulk email campaigns.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs self-start sm:self-auto flex-shrink-0">
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-2 font-bold text-slate-500">
                <i className="fa-solid fa-users text-slate-400 text-[12px]" />
                <span>{counts.all} registered account{counts.all !== 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          {/* Email Collection & Quick Selection Toolbar */}
          {!usersQuery.isLoading && !usersQuery.isError && allUsers.length > 0 && (
            <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-xs">
                    <i className="fa-solid fa-envelope-open-text" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Registered Email Collector</h3>
                    <p className="text-[10px] text-slate-400">Select users by count or checkboxes to perform bulk email actions</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="text-xs font-bold text-teal-400 bg-slate-800 px-3 py-1 rounded-xl border border-slate-700">
                    {selectedUserIds.length} of {allUsers.length} selected
                  </span>
                  {selectedUserIds.length > 0 && (
                    <button
                      onClick={() => setSelectedUserIds([])}
                      className="text-[10px] font-bold text-rose-400 hover:text-rose-300 underline"
                    >
                      Clear selection
                    </button>
                  )}
                </div>
              </div>

              {/* Selection Controls */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                  Quick Select:
                </span>
                <button
                  onClick={handleSelectAllVisible}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  {isAllVisibleSelected ? 'Deselect Visible' : 'Select All Visible'}
                </button>
                <button
                  onClick={() => handleSelectCount(5)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  First 5
                </button>
                <button
                  onClick={() => handleSelectCount(10)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  First 10
                </button>
                <button
                  onClick={() => handleSelectCount(25)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold border border-slate-700 transition-colors"
                >
                  First 25
                </button>

                {/* Custom count picker */}
                <div className="flex items-center gap-1.5 bg-slate-800 border border-slate-700 rounded-lg px-2 py-1">
                  <span className="text-[10px] text-slate-400 font-bold">Custom:</span>
                  <input
                    type="number"
                    min="1"
                    max={allUsers.length}
                    value={customCount}
                    onChange={(e) => setCustomCount(e.target.value)}
                    className="w-10 bg-slate-900 text-teal-300 font-bold text-xs text-center border border-slate-700 rounded focus:outline-none"
                  />
                  <button
                    onClick={() => handleSelectCount(Number(customCount) || 1)}
                    className="text-[10px] font-extrabold text-teal-400 hover:text-teal-300 uppercase"
                  >
                    Apply
                  </button>
                </div>
              </div>

              {/* Actions for Selected Emails */}
              {selectedUserIds.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2 animate-fade-in">
                  <button
                    onClick={handleCopyEmails}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <i className="fa-solid fa-copy text-teal-400 text-[11px]" />
                    <span>Copy Emails ({selectedUserIds.length})</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 flex items-center gap-1.5 transition-colors"
                  >
                    <i className="fa-solid fa-file-csv text-emerald-400 text-[11px]" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => setIsBulkEmailOpen(true)}
                    className="px-4 py-1.5 rounded-xl bg-teal-500 hover:bg-teal-600 text-white text-xs font-extrabold shadow-md shadow-teal-500/20 flex items-center gap-1.5 transition-all"
                  >
                    <i className="fa-solid fa-paper-plane text-[11px]" />
                    <span>Send Bulk Email to ({selectedUserIds.length})</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Search + Filter Row */}
          {!usersQuery.isLoading && !usersQuery.isError && (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Search */}
              <div className="relative flex-1 w-full sm:max-w-xs">
                <i className="fa-solid fa-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[12px] pointer-events-none" />
                <input
                  id="users-search"
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-200/80 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-1"
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
                      className={`px-3 py-2 rounded-xl text-[11px] font-bold transition-all duration-150 flex items-center gap-1.5 ${
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
            <>
              {/* Mobile Cards View (hidden on sm+) */}
              <div className="block sm:hidden space-y-3">
                {users.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  const isSelected = selectedUserIds.includes(user.id);
                  const isConfirmingDelete = confirmDeleteId === user.id;
                  const isConfirmingRole = confirmRoleId === user.id;
                  const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
                  const isDeletingThis = deleteMutation.isPending && confirmDeleteId === user.id;
                  const isUpdatingRole = roleMutation.isPending && confirmRoleId === user.id;

                  return (
                    <div
                      key={user.id}
                      className={`bg-white border rounded-2xl p-4 shadow-sm space-y-3 transition-all ${
                        isSelected ? 'border-teal-500 ring-2 ring-teal-500/10 bg-teal-50/10' : 'border-slate-200/80'
                      }`}
                    >
                      {/* Top row: Checkbox, Avatar, Name & Role Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Checkbox */}
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleUser(user.id)}
                            className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500/20 border-slate-300 cursor-pointer flex-shrink-0"
                          />

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
                            <div className="font-bold text-slate-800 text-sm truncate flex items-center gap-1.5 flex-wrap">
                              <span>{user.name}</span>
                              {isSelf && (
                                <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-1.5 py-0.5 rounded-full flex-shrink-0">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500 font-medium truncate flex items-center gap-1.5 mt-0.5">
                              <i className="fa-solid fa-envelope text-[10px] text-slate-400 flex-shrink-0" />
                              <span className="truncate">{user.email}</span>
                            </div>
                          </div>
                        </div>

                        <Badge variant={user.role === 'admin' ? 'primary' : 'slate'}>
                          {user.role === 'admin' ? (
                            <><i className="fa-solid fa-shield-halved mr-1 text-[9px]" />Admin</>
                          ) : (
                            <><i className="fa-solid fa-user mr-1 text-[9px]" />User</>
                          )}
                        </Badge>
                      </div>

                      {/* Info row: Joined Date */}
                      <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-100">
                        <span className="flex items-center gap-1.5 font-medium">
                          <i className="fa-solid fa-calendar-days text-[11px]" />
                          Joined {formatDate(user.createdAt)}
                        </span>
                      </div>

                      {/* Action section */}
                      {!isSelf && (
                        <div className="pt-2 border-t border-slate-100">
                          {isConfirmingRole ? (
                            <div className="bg-teal-50/70 border border-teal-200/80 rounded-xl p-3 space-y-2">
                              <p className="text-xs font-bold text-teal-900">
                                Change role of <span className="font-extrabold">{user.name}</span> to <span className="uppercase text-teal-700">{newRole}</span>?
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleRoleToggle(user)}
                                  disabled={isUpdatingRole}
                                  className="flex-1 py-2 rounded-lg bg-teal-500 text-white text-xs font-bold hover:bg-teal-600 transition-colors disabled:opacity-50"
                                >
                                  {isUpdatingRole ? 'Saving…' : 'Confirm'}
                                </button>
                                <button
                                  onClick={() => setConfirmRoleId(null)}
                                  className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : isConfirmingDelete ? (
                            <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 space-y-2">
                              <p className="text-xs font-bold text-rose-900">
                                Delete account for <span className="font-extrabold">{user.name}</span>?
                              </p>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => deleteMutation.mutate(user.id)}
                                  disabled={isDeletingThis}
                                  className="flex-1 py-2 rounded-lg bg-rose-500 text-white text-xs font-bold hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                  {isDeletingThis ? 'Deleting…' : 'Yes, Delete'}
                                </button>
                                <button
                                  onClick={() => setConfirmDeleteId(null)}
                                  className="flex-1 py-2 rounded-lg bg-white border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50 transition-colors"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  setConfirmDeleteId(null);
                                  setConfirmRoleId(user.id);
                                }}
                                className="flex-1 px-3 py-2 rounded-xl text-xs font-bold border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all flex items-center justify-center gap-1.5"
                              >
                                <i className={`fa-solid ${newRole === 'admin' ? 'fa-shield-halved' : 'fa-user'} text-[11px]`} />
                                Make {newRole}
                              </button>
                              <button
                                onClick={() => {
                                  setConfirmRoleId(null);
                                  setConfirmDeleteId(user.id);
                                }}
                                className="px-3.5 py-2 rounded-xl text-xs font-bold border border-slate-200 text-rose-500 hover:border-rose-200 hover:bg-rose-50 transition-all flex items-center justify-center gap-1.5"
                                title="Delete user"
                              >
                                <i className="fa-solid fa-trash text-[11px]" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      {isSelf && (
                        <div className="pt-2 border-t border-slate-100 text-center">
                          <span className="text-xs text-slate-400 font-medium italic">
                            Logged in as your account
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Desktop & Tablet Table View (hidden on sm-) */}
              <div className="hidden sm:block overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      <th className="text-center px-4 py-3.5 w-10">
                        <input
                          type="checkbox"
                          checked={isAllVisibleSelected}
                          onChange={handleSelectAllVisible}
                          className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500/20 border-slate-300 cursor-pointer"
                          title="Select all visible users"
                        />
                      </th>
                      <th className="text-left px-5 py-3.5 font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap">
                        Account
                      </th>
                      <th className="text-left px-4 py-3.5 font-bold text-slate-500 uppercase tracking-wider">
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
                      const isSelected = selectedUserIds.includes(user.id);
                      const isConfirmingDelete = confirmDeleteId === user.id;
                      const isConfirmingRole = confirmRoleId === user.id;
                      const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
                      const isDeletingThis = deleteMutation.isPending && confirmDeleteId === user.id;
                      const isUpdatingRole = roleMutation.isPending && confirmRoleId === user.id;

                      return (
                        <tr
                          key={user.id}
                          className={`transition-colors group ${
                            isSelected ? 'bg-teal-50/30' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          {/* Selection Checkbox */}
                          <td className="px-4 py-4 text-center">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleToggleUser(user.id)}
                              className="w-4 h-4 rounded text-teal-500 focus:ring-teal-500/20 border-slate-300 cursor-pointer"
                            />
                          </td>

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
                              </div>
                            </div>
                          </td>

                          {/* Email */}
                          <td className="px-4 py-4">
                            <span className="text-slate-600 font-medium truncate block max-w-[200px] lg:max-w-none">{user.email}</span>
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
                                  <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 p-1.5 rounded-xl">
                                    <span className="text-[10px] text-slate-600 font-bold whitespace-nowrap px-1">
                                      Make {newRole}?
                                    </span>
                                    <button
                                      onClick={() => handleRoleToggle(user)}
                                      disabled={isUpdatingRole}
                                      className="px-2.5 py-1 rounded-lg bg-teal-500 text-white text-[10px] font-bold hover:bg-teal-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                      {isUpdatingRole ? 'Saving…' : 'Confirm'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmRoleId(null)}
                                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-100 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setConfirmDeleteId(null);
                                      setConfirmRoleId(user.id);
                                    }}
                                    title={`Change role to ${newRole}`}
                                    className="px-3 py-1.5 rounded-lg text-[10px] font-bold border border-slate-200 text-slate-600 hover:border-teal-300 hover:text-teal-600 hover:bg-teal-50/50 transition-all whitespace-nowrap"
                                  >
                                    <i className={`fa-solid ${newRole === 'admin' ? 'fa-shield-halved' : 'fa-user'} mr-1`} />
                                    Make {newRole}
                                  </button>
                                )
                              )}

                              {/* Delete */}
                              {!isSelf && (
                                isConfirmingDelete ? (
                                  <div className="flex items-center gap-1.5 bg-rose-50 border border-rose-200/80 p-1.5 rounded-xl">
                                    <span className="text-[10px] text-rose-600 font-bold whitespace-nowrap px-1">
                                      Delete?
                                    </span>
                                    <button
                                      onClick={() => deleteMutation.mutate(user.id)}
                                      disabled={isDeletingThis}
                                      className="px-2.5 py-1 rounded-lg bg-rose-500 text-white text-[10px] font-bold hover:bg-rose-600 transition-colors disabled:opacity-50 whitespace-nowrap"
                                    >
                                      {isDeletingThis ? 'Deleting…' : 'Yes'}
                                    </button>
                                    <button
                                      onClick={() => setConfirmDeleteId(null)}
                                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-slate-600 text-[10px] font-bold hover:bg-slate-100 transition-colors"
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => {
                                      setConfirmRoleId(null);
                                      setConfirmDeleteId(user.id);
                                    }}
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
            </>
          )}

          {/* Bulk Email Modal */}
          <BulkEmailModal
            isOpen={isBulkEmailOpen}
            onClose={() => setIsBulkEmailOpen(false)}
            selectedUsers={selectedUsers}
          />
        </div>
      </AdminLayout>
    </AdminRoute>
  );
}
