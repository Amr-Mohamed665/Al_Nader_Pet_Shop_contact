import { redirect } from 'next/navigation';

export default function AdminProductNewRedirect() {
  redirect('/admin/items/new');
}
