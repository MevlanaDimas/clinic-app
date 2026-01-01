import { CustomPagination } from '@/components/custom-pagination';
import { PrescriptionForm } from '@/components/prescription-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index} from '@/routes/prescription';
import { Prescription, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { Check, Clock, TextSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Prescriptions Data',
        href: index().url,
    },
];

export default function PrescriptionIndex() {
    const { prescriptions }: any = usePage().props;
    const meta = prescriptions.meta;
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

    const prescriptionStatus = (status: string) => {
        if (status === 'on_process'){
            return (
                <Clock className='size-5 text-yellow-500 mx-auto' />
            )
        } else if (status === 'done'){
            return (
                <Check className='size-5 text-green-500 mx-auto' />
            )
        } else if (status === 'recalled'){
            return (
                <X className='size-5 text-red-500 mx-auto' />
            )
        }
    }

    const paidStatus = (status: string) => {
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Prescriptions Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search prescriptions..."
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
                    {Can('prescriptionData.create') && <PrescriptionForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Prescription Code</TableHead>
                                <TableHead className='text-center'>Paid Status</TableHead>
                                <TableHead className='text-center'>Doctor Name</TableHead>
                                <TableHead className='text-center'>Patient Name</TableHead>
                                <TableHead className='text-center'>Medicine</TableHead>
                                <TableHead className='text-center'>Dosage</TableHead>
                                <TableHead className='text-center'>Quantity</TableHead>
                                <TableHead className='text-center'>Status</TableHead>
                                <TableHead className='text-center'>Instruction</TableHead>
                                <TableHead className='text-center'>Created At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {prescriptions.data.length > 0 ? (
                                prescriptions.data.map((prescription: Prescription, index: number) => (
                                    <TableRow key={prescription.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{prescription.prescription_code}</TableCell>
                                        <TableCell className=''>{paidStatus(prescription.paid_status)}</TableCell>
                                        <TableCell className="text-center">{prescription.doctor_name}</TableCell>
                                        <TableCell className="text-center">{prescription.patient_name}</TableCell>
                                        <TableCell className="text-sm text-start">
                                            <div className="flex flex-col space-y-1">
                                                <p><span className="font-semibold">Name:</span> {prescription.medicine}</p>
                                                <p><span className="font-semibold">Form:</span> {prescription.medicine_form}</p>
                                                <p><span className="font-semibold">Strength:</span> {prescription.medicine_strength}{prescription.medicine_strength_unit}</p>
                                                <p><span className="font-semibold">Manufacturer:</span> {prescription.medicine_manufacturer}</p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">{prescription.dosage}</TableCell>
                                        <TableCell className="text-center">{prescription.quantity}</TableCell>
                                        <TableCell className="text-center">{prescriptionStatus(prescription.status)}</TableCell>
                                        <TableCell className="text-center">{prescription.instructions}</TableCell>
                                        <TableCell className="text-center">{prescription.created_at}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                <PrescriptionForm prescription={prescription} id={prescription.id} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={12} className="text-center">
                                            No prescriptions found.
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