import { router } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const handlePerPageChange = (page: number, path: string) => {
        router.get(path, { perPage: page }, { preserveState: true, replace: true });
    };