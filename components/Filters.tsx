"use client";

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Search, X } from 'lucide-react';

interface FilterOption {
  name: string;
  placeholder: string;
  type?: string;
}

interface FiltersProps {
  options: FilterOption[];
}

export default function Filters({ options }: FiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleFilterChange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const newParams = new URLSearchParams(searchParams.toString());

    for (const [key, value] of formData.entries()) {
      if (value) {
        newParams.set(key, value as string);
      } else {
        newParams.delete(key);
      }
    }
    router.push(`${pathname}?${newParams.toString()}`);
  };

  const clearFilters = () => {
    router.push(pathname);
  };

  return (
    <form onSubmit={handleFilterChange} className="flex flex-wrap items-end gap-4">
      {options.map(opt => (
        <div key={opt.name} className="flex-grow">
          <label htmlFor={opt.name} className="text-sm font-medium text-muted-foreground">{opt.placeholder}</label>
          <Input
            id={opt.name}
            name={opt.name}
            placeholder={opt.placeholder}
            type={opt.type || 'text'}
            defaultValue={searchParams.get(opt.name) ?? ''}
            className="mt-1"
          />
        </div>
      ))}
      <Button type="submit">
        <Search className="mr-2 h-4 w-4" /> Filtrar
      </Button>
      <Button type="button" variant="ghost" onClick={clearFilters}>
        <X className="mr-2 h-4 w-4" /> Limpar
      </Button>
    </form>
  );
}
