'use client';

import ItemForm from './ItemForm';

interface ProductFormValues {
  name: string;
  category: string;
  price: string | number;
  description: string;
  image: string;
  available: boolean;
}

interface ProductFormProps {
  initialValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
  isLoading?: boolean;
}

export default function ProductForm(props: ProductFormProps) {
  return <ItemForm {...props} />;
}
