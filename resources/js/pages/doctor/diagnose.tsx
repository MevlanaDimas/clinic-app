import { CustomPagination } from '@/components/custom-pagination';
import { DiagnoseForm } from '@/components/diagnose-form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { handlePerPageChange } from '@/lib/utils';
import { index} from '@/routes/diagnose';
import { Diagnose, type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { TextSearch, X } from 'lucide-react';
import { useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Diagnose Data',
        href: index().url,
    },
];

export default function DiagnoseIndex() {
    const { diagnoses, auth }: any = usePage().props;
    const meta = diagnoses.meta;
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
            <Head title="Diagnose Data" />
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <form onSubmit={searchData} className="w-full md:w-1/3">
                        <div className="relative">
                            <TextSearch className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                type="text"
                                id="search"
                                name="search"
                                placeholder="Search diagnoses..."
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
                    {Can('diagnoseData.create') && <DiagnoseForm auth={auth} />}
                </div>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className='border-b bg-muted'>
                            <TableRow>
                                <TableHead className="w-10 text-center">No</TableHead>
                                <TableHead className='text-center'>Diagnose Code</TableHead>
                                <TableHead className='text-center'>Patient Name</TableHead>
                                <TableHead className='text-center'>Diagnosis</TableHead>
                                <TableHead className='text-center'>Treatment</TableHead>
                                <TableHead className='text-center'>Prescription Code</TableHead>
                                <TableHead className='text-center'>Notes</TableHead>
                                <TableHead className='text-center'>Created At</TableHead>
                                <TableHead className='text-center'>Updated At</TableHead>
                                <TableHead className='text-center'>Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {diagnoses.data.length > 0 ? (
                                diagnoses.data.map((diagnose: Diagnose, index: number) => (
                                    <TableRow key={diagnose.id} className="transition-colors hover:bg-muted/50">
                                        <TableCell className="text-center">{meta ? meta.from + index : index + 1}</TableCell>
                                        <TableCell className="text-center">{diagnose.diagnose_code}</TableCell>
                                        <TableCell className="text-center">{diagnose.patient_name}</TableCell>
                                        <TableCell className="text-center">{diagnose.diagnosis}</TableCell>
                                        <TableCell className="text-center">{diagnose.treatment}</TableCell>
                                        <TableCell className="text-center">
                                            {(() => {
                                                if (!diagnose.prescription || diagnose.prescription.length === 0) {
                                                    return <span>-</span>;
                                                }
                                                const uniqueCodes = [...new Set(diagnose.prescription.map(p => p.prescription_code))];
                                                if (uniqueCodes.length === 1) {
                                                    return <span>{uniqueCodes[0]}</span>;
                                                }
                                                return (
                                                    <div className="flex flex-col items-start gap-1 text-left">
                                                        {uniqueCodes.map((code, i) => <span key={i}>{i + 1}. {code}</span>)}
                                                    </div>
                                                );
                                            })()}
                                        </TableCell>
                                        <TableCell className="text-center">{diagnose.notes}</TableCell>
                                        <TableCell className="text-center">{diagnose.created_at}</TableCell>
                                        <TableCell className="text-center">{diagnose.updated_at}</TableCell>
                                        <TableCell className="flex flex-row items-center justify-center gap-5 text-center">
                                            <DiagnoseForm key={diagnose.id} diagnose={diagnose} id={diagnose.id}/>
                                        </TableCell>
                                    </TableRow>
                                ))) : (
                                    <TableRow>
                                        <TableCell colSpan={10} className="text-center">
                                            No diagnoses found.
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