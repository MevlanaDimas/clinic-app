<?php

namespace App\Http\Controllers;

use App\Exports\FinanceReportExport;
use App\Models\Bills;
use App\Models\TotalPatientBills;
use Inertia\Inertia;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\BinaryFileResponse;
use Illuminate\Http\RedirectResponse;
use Inertia\Response;

class FinanceManagementController extends Controller
{
    public function index(Request $request): Response
    {
        // Get all distinct years from both tables to populate the filter
        $billYears = Bills::query()->selectRaw('YEAR(created_at) as year')->distinct()->pluck('year');
        $patientBillYears = TotalPatientBills::query()->selectRaw('YEAR(created_at) as year')->distinct()->pluck('year');

        // Merge, get unique years, sort them descending, and reset keys
        $years = $billYears->concat($patientBillYears)->unique()->sortDesc()->values();

        // Get the selected year from the request, or default to the most recent year with data
        $selectedYear = $request->input('year', $years->first() ?? date('Y'));
        
        $startDate = Carbon::createFromDate($selectedYear, 1, 1)->startOfDay();
        $endDate = Carbon::createFromDate($selectedYear, 12, 31)->endOfDay();

        $billData = Bills::select(
            DB::raw('SUM(total_amount) as total_amount'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month")
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('month')
        ->get();

        $patientBillData = TotalPatientBills::select(
            DB::raw('SUM(total_cost) as total_cost'),
            DB::raw("DATE_FORMAT(created_at, '%Y-%m') as month")
        )
        ->whereBetween('created_at', [$startDate, $endDate])
        ->groupBy('month')
        ->get();

        return Inertia::render('bills/finance-chart', [
            'billData' => $billData,
            'patientBillData' => $patientBillData,
            'years' => $years,
            'selectedYear' => (int)$selectedYear,
        ]);
    }

    public function downloadReport(int $year): BinaryFileResponse|RedirectResponse
    {
        try {
            return Excel::download(new FinanceReportExport((int)$year), "finance_report_{$year}.xlsx");
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to download report. ' . $e->getMessage());
        }
    }
}
