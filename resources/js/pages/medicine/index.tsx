import { CustomPagination } from '@/components/custom-pagination';
import { MedicineForm } from '@/components/medicine-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index} from '@/routes/bills';
import { Medicine, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { TextSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Medicines Data',
        href: index().url,
    },
];

export default function MedicineIndex() {
    const { medicines }: any = usePage().props;
    const meta = medicines.meta;
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
            <Head title="Medicines Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search medicines..."
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
                    {Can('medicineData.create') && <MedicineForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Name</TableHead>
                                <TableHead className='text-center'>Manufacturer</TableHead>
                                <TableHead className='text-center'>Form</TableHead>
                                <TableHead className='text-center'>Delivery System</TableHead>
                                <TableHead className='text-center'>Strength</TableHead>
                                <TableHead className='text-center'>Batch Number</TableHead>
                                <TableHead className='text-center'>Stock Quantity</TableHead>
                                <TableHead className='text-center'>Expiry Date</TableHead>
                                <TableHead className='text-center'>Price/Unit</TableHead>
                                <TableHead className='text-center'>Created At</TableHead>
                                <TableHead className='text-center'>Updated At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {medicines.data.length > 0 ? (
                                medicines.data.map((medicine: Medicine, index: number) => (
                                    <TableRow key={medicine.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{medicine.name}</TableCell>
                                        <TableCell className="text-center">{medicine.manufacturer}</TableCell>
                                        <TableCell className="text-center">{medicine.form}</TableCell>
                                        <TableCell className="text-center">{medicine.delivery_systems}</TableCell>
                                        <TableCell className="text-center">{medicine.strength} {medicine.strength_units}</TableCell>
                                        <TableCell className="text-center">{medicine.batch_number}</TableCell>
                                        <TableCell className="text-center">{medicine.quantity_in_stock}</TableCell>
                                        <TableCell className="text-center">{medicine.expiry_date}</TableCell>
                                        <TableCell className="text-center">{formatCurrency(medicine.sell_price_per_unit)}</TableCell>
                                        <TableCell className="text-center">{medicine.created_at}</TableCell>
                                        <TableCell className="text-center">{medicine.updated_at}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <MedicineForm  medicine={medicine} id={medicine.id} />
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={13} className="text-center">
                                            No medicines found.
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