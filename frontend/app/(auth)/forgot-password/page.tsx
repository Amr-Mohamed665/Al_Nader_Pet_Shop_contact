import { redirect } from 'next/navigation';

// Forgot Password feature has been removed.
export default function ForgotPasswordPage() {
  redirect('/login');
}
