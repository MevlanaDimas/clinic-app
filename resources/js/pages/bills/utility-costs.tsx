import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/utilityCost';
import { UtilityCosts, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ClipboardList, TextSearch, X } from 'lucide-react';
import { useState } from 'react';
import { Can } from '@/lib/can';
import { UtilitiesCostsForm } from '@/components/total-utility-costs-form';
import { showUtilityCost } from '@/routes/utilityCost/utilities';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Utility Costs Data',
        href: index().url
    },
];

export default function UtilityCostsIndex() {
    const { utilityCosts }: any = usePage().props;
    const meta = utilityCosts.meta;
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
            <Head title="Utility Costs Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search utility costs..."
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
                    {Can('utilityCost.create') && <UtilitiesCostsForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Utility ID</TableHead>
                                <TableHead className='text-center'>Bill Number</TableHead>
                                <TableHead className='text-center'>Total Utility Costs</TableHead>
                                <TableHead className='text-center'>Notes</TableHead>
                                <TableHead className='text-center'>Updated At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {utilityCosts.data.length > 0 ? (
                                utilityCosts.data.map((item: UtilityCosts, index: number) => (
                                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{item.utility_id}</TableCell>
                                        <TableCell className="text-center">{item.bill_number}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(item.total_amount)}</TableCell>
                                        <TableCell className="text-center">{item.notes}</TableCell>
                                        <TableCell className="text-center">{item.updated_at}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <UtilitiesCostsForm utilities_cost={item} id={item.id} />
                                            <Link href={showUtilityCost(item.id).url} className='cursor-pointer rounded-md bg-white p-1.5 text-black'>
                                                <ClipboardList className='size-5' />
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">
                                            No utility costs found.
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
