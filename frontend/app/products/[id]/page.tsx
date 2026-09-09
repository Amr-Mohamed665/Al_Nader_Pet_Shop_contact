import { redirect } from 'next/navigation';

interface Props {
  params: { id: string };
}

export default function ProductDetailRedirect({ params }: Props) {
  redirect(`/items/${params.id}`);
}
