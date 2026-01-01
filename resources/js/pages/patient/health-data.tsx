import { CustomPagination } from '@/components/custom-pagination';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { showHealthData } from '@/routes/patient/healthData';
import { HealthDataForm } from '@/components/health-data-form';
import { PatientHealthData, type BreadcrumbItem } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { MoveLeft, TextSearch, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { index } from '@/routes/patient';


export default function PatientHealthDataIndex() {
    const { healthDatas, patient }: any = usePage().props;
    
    const breadcrumbs: BreadcrumbItem[] = [
        {
            title: 'Patient Helath Data',
            href: showHealthData(patient.data.id).url,
        },
    ];

    const meta = healthDatas.meta;
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
            <Head title="Patient Health Data" />
            <div className="p-5">
                <div className='flex flex-row justify-between items-center mb-4'>
                    <Button asChild variant="outline">
                        <Link href={index().url}>
                            <MoveLeft className="mr-2 size-4" />
                            Back
                        </Link>
                    </Button>
                    {Can('healthData.create') && <HealthDataForm patient_id={patient.data.id}/>}
                </div>
            </div>
            {patient ? (
                <div className='grid grid-cols-2 w-full items-center mx-10'>
                    <div className='flex flex-col gap-1'>
                        <div className='flex flex-row items-center'>
                            <h3>Name :</h3><p className='text-sm'>{patient.data.patient_name}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Patient ID :</h3><p className='text-sm'>{patient.data.patient_number}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Date of Birth :</h3><p className='text-sm'>{patient.data.date_of_birth}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Age :</h3><p className='text-sm'>{patient.data.age}</p>
                        </div>
                    </div>
                    <div className='flex flex-col gap-1'>
                        <div className='flex flex-row items-center'>
                            <h3>Blood Type :</h3><p className='text-sm'>{patient.data.blood_type}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Sex :</h3><p className='text-sm'>{patient.data.sex}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Phone :</h3><p className='text-sm'>{patient.data.phone_number}</p>
                        </div>
                        <div className='flex flex-row items-center'>
                            <h3>Address :</h3><p className='text-sm'>{patient.data.address}</p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className='w-full text-center justify-center items-center'>
                    <h5>Patient Data not Found.</h5>
                </div>
            )}
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl mx-5 mt-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search health data..."
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
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Date</TableHead>
                                <TableHead className='text-center'>Systolic Blood Pressure</TableHead>
                                <TableHead className='text-center'>Diastolic Blood Pressure</TableHead>
                                <TableHead className='text-center'>Heart Rate</TableHead>
                                <TableHead className='text-center'>Temperature</TableHead>
                                <TableHead className='text-center'>Height</TableHead>
                                <TableHead className='text-center'>Weight</TableHead>
                                <TableHead className='text-center'>Complaints</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {healthDatas.data.length > 0 ? (
                                healthDatas.data.map((healthData: PatientHealthData, index: number) => (
                                    <TableRow key={healthData.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{healthData.updated_at}</TableCell>
                                        <TableCell className="text-center">{healthData.systolic_bp}</TableCell>
                                        <TableCell className="text-center">{healthData.diastolic_bp}</TableCell>
                                        <TableCell className="text-center">{healthData.heart_rate}</TableCell>
                                        <TableCell className="text-center">{healthData.temperature}</TableCell>
                                        <TableCell className="text-center">{healthData.height}</TableCell>
                                        <TableCell className="text-center">{healthData.weight}</TableCell>
                                        <TableCell className="text-balance">{healthData.complaints}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <HealthDataForm healthData={healthData} patient_id={patient.data.id} />
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center">
                                            No health data found.
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
