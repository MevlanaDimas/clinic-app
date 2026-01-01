import { CustomPagination } from '@/components/custom-pagination';
import { PatientBillForm } from '@/components/total-patient-bill-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index, print } from '@/routes/totalPatientBill';
import { PatientBill, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { Check, Clock, Printer, UserRoundSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Total Patients Bill Data',
        href: index().url,
    },
];

export default function TotalPatientBillIndex() {
    const { patientBills }: any = usePage().props;
    const meta = patientBills.meta;
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

    const billStatus = (status: string) => {
        if (status === 'unpaid'){
            return (
                <Clock className='size-5 text-yellow-500 mx-auto' />
            )
        } else if (status === 'paid'){
            return (
                <Check className='size-5 text-green-500 mx-auto' />
            )
        } else if (status === 'cancelled'){
            return (
                <X className='size-5 text-red-500 mx-auto' />
            )
        }
    }

    const formatCurrency = (amount: number, locale = 'id-ID', currency = 'IDR') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Total Patient Bills Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <UserRoundSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search patient bills..."
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
                    {Can('patientBillData.create') && <PatientBillForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Bill Code</TableHead>
                                <TableHead className='text-center'>Name</TableHead>
                                <TableHead className='text-center'>Age</TableHead>
                                <TableHead className='text-center'>Sex</TableHead>
                                <TableHead className='text-center'>Phone</TableHead>
                                <TableHead className='text-center'>Address</TableHead>
                                <TableHead className='text-center'>Admin Fee</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead className='text-center'>Total Amount</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patientBills.data.length > 0 ? (
                                patientBills.data.map((patientBill: PatientBill, index: number) => (
                                    <TableRow key={patientBill.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{patientBill.bill_code}</TableCell>
                                        <TableCell className="text-center">{patientBill.patient_name}</TableCell>
                                        <TableCell className="text-center">{patientBill.patient_age}</TableCell>
                                        <TableCell className="text-center">{patientBill.patient_sex}</TableCell>
                                        <TableCell className="text-center">{patientBill.patient_phone_number}</TableCell>
                                        <TableCell className="text-center">{patientBill.patient_address}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(patientBill.admin_fee)}</TableCell>
                                        <TableCell className="text-center">{billStatus(patientBill.status)}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(patientBill.total_amount)}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <PatientBillForm bill={patientBill} id={patientBill.id} />
                                            {Can('patientBillData.view') && <Button
                                                asChild
                                                variant="default"
                                                size="icon"
                                                className='size-8'
                                            >
                                                <Link href={print(patientBill.id).url}>
                                                    <Printer className='size-4' />
                                                </Link>
                                            </Button>}
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={11} className="text-center">
                                            No patient bills found.
                                        </TableCell>
                                    </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                {meta && (
                    <div>
                        <CustomPagination meta={meta} />
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
