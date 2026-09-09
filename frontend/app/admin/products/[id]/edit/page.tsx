import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function AdminProductEditRedirect({ params }: Props) {
  redirect(`/admin/items/${params.id}/edit`);
}
