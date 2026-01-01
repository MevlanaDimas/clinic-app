import { usePage } from '@inertiajs/react';
import { SharedData } from '@/types';


export function Can(permission: string): boolean {
    const { auth } = usePage<SharedData>().props;

    if (!auth.user || !auth.permissions) return false;

    return auth.permissions.includes(permission);
}