import { redirect } from 'next/navigation';

// Reset Password feature has been removed.
export default function ResetPasswordPage() {
  redirect('/login');
}
