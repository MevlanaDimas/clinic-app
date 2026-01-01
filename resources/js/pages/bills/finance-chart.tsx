import FinanceChart from '@/components/finance-dynamic-chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AppLayout from '@/layouts/app-layout';
import { Can } from '@/lib/can';
import { downloadReport, index } from '@/routes/financeManagement';
import { type BreadcrumbItem } from '@/types';
import { Head, router, usePage } from '@inertiajs/react';
import { FileDown } from 'lucide-react';
import { toast } from 'sonner';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Finance Chart',
        href: index().url,
    },
];

interface MonthlyData {
    month: string;
    total_cost?: number;
    total_amount?: number;
}

export default function FinanceChartIndex() {
    const { billData, patientBillData, years, selectedYear } = usePage().props as {
        billData: { month: string; total_amount: number }[];
        patientBillData: { month: string; total_cost: number }[];
        years: number[];
        selectedYear: number;
    };

    const handleYearChange = (year: string) => {
        router.get(index().url, { year }, { preserveState: true, replace: true });
    };

    const combinedData = (): MonthlyData[] => {
        const dataMap: { [key: string]: MonthlyData } = {};

        billData.forEach(({ month, total_amount }) => {
            if (!dataMap[month]) dataMap[month] = { month };
            dataMap[month].total_amount = total_amount;
        });

        patientBillData.forEach(({ month, total_cost }) => {
            if (!dataMap[month]) dataMap[month] = { month };
            dataMap[month].total_cost = total_cost;
        });

        return Object.values(dataMap).sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime());
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Finance Chart" />
            <div className="p-6 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header & Controls */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all hover:shadow-md">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 tracking-tight">Monthly Analytics</h3>
                        <p className="text-gray-500 mt-1 text-sm">Track financial performance and trends over time.</p>
                    </div>
                    <div className="flex items-center gap-3 bg-gray-50 p-1.5 rounded-lg border border-gray-100">
                        <span className="text-sm font-medium text-gray-600 pl-2">Year:</span>
                        <Select onValueChange={handleYearChange} defaultValue={String(selectedYear)}>
                            <SelectTrigger className="w-[120px] h-9 text-black bg-white border-gray-200 focus:ring-2 focus:ring-emerald-500/20 transition-all shadow-sm cursor-pointer">
                                <SelectValue placeholder="Select Year" />
                            </SelectTrigger>
                            <SelectContent>
                                {years.map((year) => (
                                    <SelectItem key={year} value={String(year)} className='cursor-pointer hover:bg-emerald-50 text-black'>
                                        {year}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Chart Area */}
                <div className='bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[400px] transition-all hover:shadow-lg hover:shadow-gray-200/50'>
                    <FinanceChart chartData={combinedData()} />
                </div>

                {/* Actions */}
                {Can('financeData.download') && (
                    <div className='flex justify-center pb-10'>
                        <a 
                            href={downloadReport(selectedYear).url} 
                            onClick={() => toast.success('Report is being downloaded...')} 
                            className='group relative flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden'
                        >
                            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
                            <div className="relative p-2 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
                                <FileDown size={24} className="text-white" />
                            </div>
                            <div className="relative flex flex-col text-left">
                                <span className='text-xs font-medium text-emerald-100 uppercase tracking-wider'>Export Data</span>
                                <span className='text-lg font-bold'>Download Excel Report</span>
                            </div>
                        </a>
                    </div>
                )}
            </div>
        </AppLayout>
    );
}