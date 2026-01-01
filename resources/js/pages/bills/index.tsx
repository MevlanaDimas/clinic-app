import { BillForm } from '@/components/bill-form';
import { Button } from '@/components/ui/button';
import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index, store } from '@/routes/bills';
import { Bill, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, TextSearch, UserRoundPlus, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Bills Data',
        href: index().url,
    },
];

export default function BillsIndex() {
    const { bills }: any = usePage().props;
    const meta = bills.meta;
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

    const handleAddNewBill = () => {
        router.post(store().url);
    }

    const formatCurrency = (amount: number, locale = 'id-ID', currency = 'IDR') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

    const paidStatus = (status: string) => {
        if (status === 'paid') {
            return <Check className='size-5 text-green-500 mx-auto' />
        } else {
            return <X className='size-5 text-red-500 mx-auto' />
        }
    }

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Bills Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search bills..."
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
                    {Can('billData.create') && <Button onClick={handleAddNewBill} variant="outline" className='cursor-pointer'>
                        <UserRoundPlus className="mr-2 size-4" />
                        Add New Bill
                    </Button>}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Bill Number</TableHead>
                                <TableHead className='text-center'>Total Amount</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead className='text-center'>Notes</TableHead>
                                <TableHead className='text-center'>Created At</TableHead>
                                <TableHead className='text-center'>Updated At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {bills.data.length > 0 ? (
                                bills.data.map((bill: Bill, index: number) => (
                                    <TableRow key={bill.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{bill.bill_number}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(bill.total_amount)}</TableCell>
                                        <TableCell className="text-center">{paidStatus(bill.status)}</TableCell>
                                        <TableCell className="text-center">{bill.notes}</TableCell>
                                        <TableCell className="text-center">{bill.created_at}</TableCell>
                                        <TableCell className="text-center">{bill.updated_at}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <BillForm bill={bill} id={bill.id} />
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={8} className="text-center">
                                            No bills found.
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