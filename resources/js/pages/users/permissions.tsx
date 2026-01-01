import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/permission';
import { Role, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { TextSearch, X } from 'lucide-react';
import { useState } from 'react';
import { PermissionForm } from '@/components/permission-form';
import { Can } from '@/lib/can';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Permissions Data',
        href: index().url
    },
];

export default function Permission() {
    const { permissions }: any = usePage().props;
    const meta = permissions.meta;
    const path = meta?.path;
    const [search, setSearch] = useState('');


    const searchData = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(path, { search: search }, { preserveState: true, replace: true });
    }

    const clearSearch = () => {
        setSearch('');
        router.get(path, { search: '' }, { preserveState: true, replace: true });
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Permissions Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search permissions..."
                                onChange={(e) => setSearch(e.target.value)}
                                value={search}
                                className="pl-9"
                            />
                            {search && (
                                <button type="button" onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground hover:text-foreground">
                                    <X size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                    {meta && (
                        <div className='flex flex-row items-center gap-3'>
                            <span className='text-sm'>Row per page:</span>
                            <Select onValueChange={(value) => handlePerPageChange(parseInt(value), path)} defaultValue={String(meta.per_page)}>
                                <SelectTrigger className='w-[80px] cursor-pointer'>
                                    <SelectValue placeholder="Row" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='25' className='cursor-pointer'>25</SelectItem>
                                    <SelectItem value='50' className='cursor-pointer'>50</SelectItem>
                                    <SelectItem value='100' className='cursor-pointer'>100</SelectItem>
                                    <SelectItem value='-1' className='cursor-pointer'>All</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                    {Can('permission.create') && <PermissionForm />}
                </div>
                <Table>
                    <TableHeader className='border-b bg-muted'>
                        <TableRow>
                            <TableHead className="w-10 text-center">No</TableHead>
                            <TableHead className='text-center'>ID</TableHead>
                            <TableHead className='text-center'>Name</TableHead>
                            <TableHead className='text-center'>Created At</TableHead>
                            <TableHead className='text-center'>Updated At</TableHead>
                            <TableHead className='text-center'>Action</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.data.length > 0 ? (
                            permissions.data.map((permission: Role, index: number) => (
                                <TableRow key={permission.id} className="transition-colors hover:bg-muted/50">
                                    <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                    <TableCell className="text-center">{permission.id}</TableCell>
                                    <TableCell className='text-center'>
                                        <span className='items-center whitespace-normal rounded bg-green-500/90 px-2.5 py-0.5 text-center text-xs font-semibold text-black'>
                                            {permission.name}    
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-center">{permission.created_at}</TableCell>
                                    <TableCell className="text-center">{permission.updated_at}</TableCell>
                                    <TableCell className="items-center justify-center text-center">
                                        {Can('permission.edit') && <PermissionForm permission={permission} id={permission.id} />}
                                    </TableCell>
                                </TableRow>
                            ))) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">
                                        No permissions found.
                                    </TableCell>
                                </TableRow>
                        )}
                    </TableBody>
                </Table>
                {meta && (
                    <div>
                        <CustomPagination meta={meta} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
