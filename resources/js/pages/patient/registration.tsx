import { CustomPagination } from '@/components/custom-pagination';
import { RegistrationForm } from '@/components/registration-form';
import { StatusForm } from '@/components/registration-status-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/registration';
import { Registration, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Clock, UserRoundSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patient Registration',
        href: index().url,
    },
];

export default function RegistrationIndex() {
    const { registrations }: any = usePage().props;
    const meta = registrations.meta;
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

    const registrationStatus = (status: string) => {
        if (status === 'on_process'){
            return (
                <Clock className='size-5 text-yellow-500 mx-auto' />
            )
        } else if (status === 'done'){
            return (
                <Check className='size-5 text-green-500 mx-auto' />
            )
        } else if (status === 'cancelled'){
            return (
                <X className='size-5 text-red-500 mx-auto' />
            )
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Patient Registration" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <UserRoundSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search registrations..."
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
                    {Can('patientRegist.create') && <RegistrationForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>ID</TableHead>
                                <TableHead className='text-center'>Name</TableHead>
                                <TableHead className='text-center'>Doctor</TableHead>
                                <TableHead className='text-center'>Queue Number</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {registrations.data.length > 0 ? (
                                registrations.data.map((registration: Registration, index: number) => (
                                    <TableRow key={registration.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">
                                            {meta.from + index}
                                        </TableCell>
                                        <TableCell className="text-center">{registration.patient_number ?? 'N/A'}</TableCell>
                                        <TableCell className="text-center">{registration.patient_name}</TableCell>
                                        <TableCell className="text-center">{registration.doctor}</TableCell>
                                        <TableCell className="text-center">{registration.queue_number}</TableCell>
                                        <TableCell className="text-center">{registrationStatus(registration.status)}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <StatusForm status={registration.status} id={registration.id} />
                                            <RegistrationForm registration={registration} id={registration.id}/>
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No patient registrations found.
                                        </TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div>
                    <CustomPagination meta={meta} />
                </div>
            </div>
        </AppLayout>
    );
}
