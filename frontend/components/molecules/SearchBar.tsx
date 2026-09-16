'use client';

import { useState, type ChangeEvent, type FormEvent } from 'react';
import { cn } from '@/utils/cn';

interface SearchBarProps {
  onSearch: (value: string) => void;
  placeholder?: string;
  initialValue?: string;
  className?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = 'Search products...',
  initialValue = '',
  className,
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSearch(value.trim());
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setValue(newVal);
    onSearch(newVal);
  };

  const handleClear = () => {
    setValue('');
    onSearch('');
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn('relative flex items-center w-full max-w-md', className)}
    >
      <div className="absolute left-3.5 text-slate-400 pointer-events-none">
        🔍
      </div>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-2.5 text-sm bg-white border border-slate-300 rounded-full shadow-sm placeholder-slate-400 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all duration-150"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3.5 p-0.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          ✕
        </button>
      )}
    </form>
  );
}
