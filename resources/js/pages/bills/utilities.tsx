import { CustomPagination } from '@/components/custom-pagination';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UtilityForm } from '@/components/utility-form';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/utilityCost';
import { showUtilityCost } from '@/routes/utilityCost/utilities';
import { Utility, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoveLeft, TextSearch, X } from 'lucide-react';
import { useState } from 'react';


export default function UtilitiesItems() {
    const { utilitiesCosts, totalUtilities }: any = usePage().props;
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Utilities Items',
            href: showUtilityCost(totalUtilities.data.id).url
        },
    ];
    
    const meta = utilitiesCosts.meta;
    const path = meta?.path;
    const [search, setSearch] = useState('');

    const formatCurrency = (amount: number, locale = 'id-ID', currency = 'IDR') => {
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount);
    }

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
            <Head title="Utilities Items" />
            <div className="p-5">
                <div className='flex flex-row items-center justify-between'>
                    <Button asChild variant="outline">
                        <Link href={index().url}>
                            <MoveLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                    {Can('utilitiesData.create') && <UtilityForm totalUtilitiesId={totalUtilities.data.id} />}
                </div>
            </div>
            {totalUtilities ? (
                <div className='w-full grid grid-cols-2 items-center mt-2 mx-8'>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row items-center'>
                            <h3>ID :</h3><p className='text-sm'>{totalUtilities.data.utility_id}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Bill Number :</h3><p className='text-sm'>{totalUtilities.data.bill_number}</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-2'>
                        <div className='flex flex-row items-center'>
                            <h3>Amount :</h3><p className='text-sm'>{formatCurrency(totalUtilities.data.total_amount)}</p>
                        </div>
                        <div className='flex flex-col items-start justify-start text-start'>
                            <h3>Notes :</h3><p className='text-sm'>{totalUtilities.data.notes ? totalUtilities.data.notes : '-'}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full text-center justify-center items-center'>
                    <h5>Total Utilites Data not Found.</h5>
                </div>
            )}
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl">
                <div className="flex flex-col mx-5 mt-5 gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search utilities..."
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
                </div>
                <div className="overflow-x-auto mx-5">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Name</TableHead>
                                <TableHead className='text-center'>Amount</TableHead>
                                <TableHead className='text-center'>Description</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {utilitiesCosts.data.length > 0 ? (
                                utilitiesCosts.data.map((item: Utility, index: number) => (
                                    <TableRow key={item.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{item.name}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(item.amount)}</TableCell>
                                        <TableCell className="text-center">{item.description}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <UtilityForm utilityItem={item} totalUtilitiesId={totalUtilities.data.id} />
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={5} className="text-center">
                                            No utilities data found.
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