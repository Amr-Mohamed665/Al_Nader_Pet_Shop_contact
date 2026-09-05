'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '@/lib/validators';
import FormField from '@/components/molecules/FormField';
import Button from '@/components/atoms/Button';
import { useCategoriesQuery } from '@/hooks/useCategories';
import ImageUploader from '@/components/molecules/ImageUploader';
import type { Product } from '@/types';

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

interface SelectOption {
  disabled: boolean;
  name: string;
  slug: string;
  depth: number;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: ProductFormProps) {
  const { data: categories = [] } = useCategoriesQuery();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(productSchema) as any,
    shouldFocusError: false,
    defaultValues: initialValues || {
      name: '',
      category: '',
      price: '',
      description: '',
      image: '',
      available: true,
    },
  });

  const available = watch('available');

  const onFormSubmit = (data: any) => {
    onSubmit(data);
  };

  const onFormError = () => {
    setTimeout(() => {
      const errorSelectors = [
        'p.text-red-500',
        'p.text-rose-500',
        'span.text-red-500',
        'span.text-rose-500',
        '[role="alert"]',
        '.field-error',
      ];
      const form = document.querySelector('form');
      if (!form) return;
      const errorEls = form.querySelectorAll(errorSelectors.join(','));
      for (let i = 0; i < errorEls.length; i++) {
        const el = errorEls[i] as HTMLElement;
        if (el.closest('.fixed')) continue;
        const text = (el.innerText || el.textContent || '').trim();
        if (text.length > 0) {
          const container = el.closest('.flex-col') || el.parentElement || el;
          container.scrollIntoView({ behavior: 'smooth', block: 'center' });
          break;
        }
      }
    }, 50);
  };

  const buildOptions = (): SelectOption[] => {
    const animalCats = categories.filter((c) => !c.isAccessory);
    const accessoryCats = categories.filter((c) => c.isAccessory);

    const options: SelectOption[] = [];

    // Add Animal categories group
    if (animalCats.length > 0) {
      options.push({
        disabled: true,
        name: "Pets / Animals",
        slug: "section-animals",
        depth: 0,
      });
      for (const cat of animalCats) {
        options.push({
          disabled: false,
          slug: cat.slug,
          name: cat.name,
          depth: 1,
        });
      }
    }

    // Add Accessory categories group
    if (accessoryCats.length > 0) {
      options.push({
        disabled: true,
        name: "Accessories",
        slug: "section-accessories",
        depth: 0,
      });
      for (const cat of accessoryCats) {
        options.push({
          disabled: false,
          slug: cat.slug,
          name: cat.name,
          depth: 1,
        });
      }
    }

    return options;
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit, onFormError)} className="space-y-5 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm max-w-xl">
      <FormField
        id="name"
        label="Product Name"
        register={register as any}
        error={errors.name?.message ? String(errors.name.message) : undefined}
        placeholder="Enter product name (e.g. Premium Dog Kibbles)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Category Select */}
        <div className="flex flex-col gap-1 w-full">
          <label htmlFor="category" className="text-xs font-bold text-slate-700 tracking-wide">
            Category
          </label>
          <select
            id="category"
            className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150 font-semibold text-slate-700"
            {...register('category')}
          >
            <option value="">Select Category</option>
            {buildOptions().map((opt) => {
              const prefix = opt.depth === 1 ? '\u00A0\u00A0' : '';
              return (
                <option
                  key={opt.slug}
                  value={opt.slug}
                  disabled={opt.disabled}
                  className={opt.disabled ? 'font-extrabold text-slate-400 bg-slate-100/50 py-1' : 'capitalize'}
                >
                  {prefix}{opt.name}
                </option>
              );
            })}
          </select>
          {errors.category?.message && (
            <span className="text-xs text-red-500 font-medium mt-0.5">
              {String(errors.category.message)}
            </span>
          )}
        </div>

        <FormField
          id="price"
          label="Price (AED)"
          type="number"
          step="0.01"
          register={register as any}
          error={errors.price?.message ? String(errors.price.message) : undefined}
          placeholder="e.g. 149"
        />
      </div>

      <FormField
        id="description"
        label="Product Description"
        type="textarea"
        register={register as any}
        error={errors.description?.message ? String(errors.description.message) : undefined}
        placeholder="Provide details about product ingredients, sizing, care, or instructions."
      />

      <Controller
        name="image"
        control={control}
        render={({ field: { value, onChange } }) => (
          <ImageUploader
            value={value}
            onChange={onChange}
            error={errors.image?.message ? String(errors.image.message) : undefined}
            label="Product Image"
          />
        )}
      />

      <div className="pt-3 flex justify-end gap-3 border-t border-slate-100">
        <Button
          type="submit"
          isLoading={isLoading}
          className="px-6 py-3 font-extrabold shadow-md shadow-teal-500/10 text-xs uppercase tracking-wider"
        >
          Save Product Details
        </Button>
      </div>
    </form>
  );
}
