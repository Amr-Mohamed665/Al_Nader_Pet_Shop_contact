'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import api from '@/services/api';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

export default function ContactSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Swal.fire({
        title: 'Missing Fields',
        text: 'Please fill in all required fields.',
        icon: 'warning',
        confirmButtonColor: '#581C87',
      });
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/contact', formData);
      if (response.data.success) {
        Swal.fire({
          title: 'Message Sent!',
          text: 'Thank you for reaching out. We will get back to you shortly.',
          icon: 'success',
          confirmButtonColor: '#581C87',
        });
        setFormData({ name: '', email: '', subject: '', message: '' });
      } else {
        throw new Error(response.data.message || 'Something went wrong.');
      }
    } catch (err: any) {
      Swal.fire({
        title: 'Error',
        text: err.response?.data?.message || err.message || 'Failed to send message. Please try again.',
        icon: 'error',
        confirmButtonColor: '#581C87',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact-us" className="mb-14">
      <div className="bg-white rounded-3xl border border-slate-200/80 overflow-hidden shadow-sm p-8 sm:p-10 lg:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Contact Details Column */}
          <div className="flex flex-col justify-center">
            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-purple-600 uppercase tracking-widest mb-3">
              ✉️ CONTACT US
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mb-5 leading-tight">
              Get in Touch with <span className="text-purple-600">Al Nader</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-8 font-medium">
              Have questions about our puppies, pet accessories, or services? Fill out the form or reach us via our direct contact channels. We're here to help!
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-[18px]"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Our Location</h4>
                  <p className="text-sm font-semibold text-slate-800">Warsan Third - Dubai, UAE</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <i className="fa-solid fa-phone text-[16px]"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Phone Number</h4>
                  <a href="tel:+971506767915" className="text-sm font-bold text-slate-800 hover:text-purple-600 transition-colors">
                    +971 50 676 7915
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 flex-shrink-0">
                  <i className="fa-solid fa-envelope text-[16px]"></i>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email Address</h4>
                  <a href="mailto:alnaderpetshop@gmail.com" className="text-sm font-bold text-slate-800 hover:text-purple-600 transition-colors">
                    alnaderpetshop@gmail.com
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Column */}
          <div className="bg-slate-50/50 rounded-2xl border border-slate-100 p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="contact-name" className="text-xs font-bold text-slate-700 tracking-wide block mb-1">
                  Full Name *
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-150"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-email" className="text-xs font-bold text-slate-700 tracking-wide block mb-1">
                  Email Address *
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email address"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-150"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-subject" className="text-xs font-bold text-slate-700 tracking-wide block mb-1">
                  Subject *
                </label>
                <input
                  id="contact-subject"
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder="What is this regarding?"
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-150"
                  required
                />
              </div>

              <div>
                <label htmlFor="contact-message" className="text-xs font-bold text-slate-700 tracking-wide block mb-1">
                  Message *
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Write your message here..."
                  className="w-full px-4 py-2.5 text-sm bg-white border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all duration-150 resize-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-[#581C87] hover:bg-[#6D28D9] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Send Message 🐾'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
