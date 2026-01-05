import { CustomPagination } from '@/components/custom-pagination';
import { PatientForm } from '@/components/patient-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index } from '@/routes/patient';
import { showHealthData } from '@/routes/patient/healthData';
import { Patient, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { HeartPulse, UserRoundSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Patients Data',
        href: index().url,
    },
];

export default function PatientIndex() {
    const { patients }: any = usePage().props;
    const meta = patients.meta;
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
            <Head title="Patients Data">
                <meta name="description" content="Manage patient records, view health history, and register new patients in the Clinic App." />
            </Head>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <UserRoundSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search patients..."
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
                    {Can('patientData.create') && <PatientForm />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>ID</TableHead>
                                <TableHead className='text-center'>Name</TableHead>
                                <TableHead className='text-center'>Age</TableHead>
                                <TableHead className='text-center'>Blood Type</TableHead>
                                <TableHead className='text-center'>Sex</TableHead>
                                <TableHead className='text-center'>Phone</TableHead>
                                <TableHead className='text-center'>Address</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {patients.data.length > 0 ? (
                                patients.data.map((patient: Patient, index: number) => (
                                    <TableRow key={patient.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{patient.patient_number}</TableCell>
                                        <TableCell className="text-center">{patient.patient_name}</TableCell>
                                        <TableCell className="text-center">{patient.age}</TableCell>
                                        <TableCell className="text-center">{patient.blood_type}</TableCell>
                                        <TableCell className="text-center">{patient.sex}</TableCell>
                                        <TableCell className="text-center">{patient.phone_number}</TableCell>
                                        <TableCell className="text-center">{patient.address}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <PatientForm patient={patient} id={patient.id} />
                                            {Can('healthData.view') && <Button asChild variant="destructive" size="icon" className="size-8">
                                                <Link href={showHealthData(patient.id).url}>
                                                    <HeartPulse className='size-4'/>
                                                </Link>
                                            </Button>}
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={9} className="text-center">
                                            No patients found.
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
