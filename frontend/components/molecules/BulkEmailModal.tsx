'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { usersService } from '@/services/users.service';
import { showToast } from '@/utils/toast';

interface BulkEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedUsers: User[];
}

const TEMPLATES = [
  {
    label: 'Custom Message',
    subject: '',
    message: '',
  },
  {
    label: '🏷️ Special Promotional Offer',
    subject: 'Special Offer Just for You — Al Nader Pet Shop 🐾',
    message: `Hi there!\n\nWe are excited to share an exclusive promotion with our valued community members at Al Nader Pet Shop!\n\nVisit our website today to check out our newest premium pet food, toys, and accessories for your pets.\n\nWarm regards,\nAl Nader Pet Shop Team`,
  },
  {
    label: '📣 New Arrival Announcement',
    subject: 'Exciting New Pets & Accessories Have Arrived! 🐶🐱🦜',
    message: `Hello pet lovers!\n\nWe've just restocked fresh arrivals including premium food, cozy beds, cages, and toys.\n\nBrowse our updated catalog online or drop by our store in Dubai.\n\nBest regards,\nAl Nader Pet Shop`,
  },
  {
    label: '🐾 Customer Appreciation',
    subject: 'Thank You for Being Part of Al Nader Pet Shop',
    message: `Dear Member,\n\nThank you for being a registered member of Al Nader Pet Shop! We appreciate your trust in us for all your pet needs.\n\nFeel free to reach out anytime if you need recommendations for your pets.\n\nWarmly,\nAl Nader Pet Shop Team`,
  },
];

export default function BulkEmailModal({ isOpen, onClose, selectedUsers }: BulkEmailModalProps) {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');
  const [isSending, setIsSending] = useState(false);
  const [selectedTemplateIndex, setSelectedTemplateIndex] = useState(0);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setSubject('');
      setMessage('');
      setSelectedTemplateIndex(0);
      setActiveTab('edit');
    }
  }

  if (!isOpen) return null;

  const handleTemplateChange = (index: number) => {
    setSelectedTemplateIndex(index);
    const tmpl = TEMPLATES[index];
    if (tmpl) {
      if (tmpl.subject) setSubject(tmpl.subject);
      if (tmpl.message) setMessage(tmpl.message);
    }
  };

  const recipientEmails = selectedUsers.map((u) => u.email);

  const handleSend = async () => {
    if (recipientEmails.length === 0) {
      showToast('error', 'No recipients selected.');
      return;
    }
    if (!subject.trim()) {
      showToast('error', 'Please provide an email subject.');
      return;
    }
    if (!message.trim()) {
      showToast('error', 'Please enter email content.');
      return;
    }

    try {
      setIsSending(true);
      const res = await usersService.sendBulkEmail({
        recipients: recipientEmails,
        subject,
        message,
      });

      if (res.success && res.data) {
        showToast(
          'success',
          `Sent email to ${res.data.sentCount} recipient(s)! ${res.data.mock ? '(Logged in dev mode)' : ''}`
        );
        onClose();
      } else {
        showToast('error', res.message || 'Failed to send bulk emails.');
      }
    } catch (err: any) {
      showToast('error', err.response?.data?.message || err.message || 'Error sending bulk email.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center font-extrabold text-base">
              <i className="fa-solid fa-paper-plane text-teal-600" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Send Bulk Email
              </h2>
              <p className="text-xs text-slate-400">
                Targeting <span className="font-extrabold text-teal-600">{selectedUsers.length}</span> registered recipient{selectedUsers.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <i className="fa-solid fa-xmark text-sm" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* Recipients summary chips */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Recipients ({selectedUsers.length})
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-2 bg-slate-50 border border-slate-200/80 rounded-2xl">
              {selectedUsers.slice(0, 15).map((user) => (
                <span
                  key={user.id}
                  className="text-[10px] font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs"
                >
                  <i className="fa-solid fa-envelope text-[9px] text-teal-500" />
                  <span>{user.name}</span>
                  <span className="text-slate-400 font-normal">({user.email})</span>
                </span>
              ))}
              {selectedUsers.length > 15 && (
                <span className="text-[10px] font-extrabold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-full flex items-center">
                  +{selectedUsers.length - 15} more
                </span>
              )}
            </div>
          </div>

          {/* Preset templates selector */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Quick Templates
            </label>
            <select
              value={selectedTemplateIndex}
              onChange={(e) => handleTemplateChange(Number(e.target.value))}
              className="w-full text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 transition-all"
            >
              {TEMPLATES.map((tmpl, idx) => (
                <option key={idx} value={idx}>
                  {tmpl.label}
                </option>
              ))}
            </select>
          </div>

          {/* Tabs: Edit vs Preview */}
          <div className="flex border-b border-slate-200">
            <button
              type="button"
              onClick={() => setActiveTab('edit')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'edit'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-pen-to-square mr-1.5" />
              Compose Message
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`px-4 py-2 text-xs font-bold transition-all border-b-2 ${
                activeTab === 'preview'
                  ? 'border-teal-500 text-teal-600'
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              <i className="fa-solid fa-eye mr-1.5" />
              Preview Email
            </button>
          </div>

          {activeTab === 'edit' ? (
            <div className="space-y-4">
              {/* Subject */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Subject Line <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Special Offer from Al Nader Pet Shop 🐾"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full text-xs font-semibold text-slate-800 bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                />
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Message Content <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={6}
                  placeholder="Write your email body here…"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full text-xs font-medium text-slate-800 bg-white border border-slate-200 rounded-xl p-3.5 focus:outline-none focus:border-teal-500 focus:ring-4 focus:ring-teal-500/10 transition-all placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  💡 Linebreaks will automatically format into clean HTML email paragraphs.
                </p>
              </div>
            </div>
          ) : (
            /* Preview mode */
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-3">
              <div className="text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block text-[10px]">Subject:</span>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">
                  {subject || <span className="text-slate-300 italic">(No subject specified)</span>}
                </p>
              </div>
              <hr className="border-slate-200/70" />
              <div className="bg-white border border-slate-200 rounded-xl p-4 text-xs text-slate-800 leading-relaxed whitespace-pre-wrap min-h-[140px]">
                {message || <span className="text-slate-300 italic">(Empty message body)</span>}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-100 transition-colors"
          >
            <i className="fa-solid fa-xmark mr-1.5" />
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSend}
            disabled={isSending || selectedUsers.length === 0}
            className="px-5 py-2.5 rounded-xl bg-teal-500 text-white text-xs font-extrabold hover:bg-teal-600 shadow-md shadow-teal-500/20 transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {isSending ? (
              <>
                <i className="fa-solid fa-spinner fa-spin text-xs" />
                <span>Sending ({selectedUsers.length})…</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-paper-plane text-xs" />
                <span>Send Bulk Email ({selectedUsers.length})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
