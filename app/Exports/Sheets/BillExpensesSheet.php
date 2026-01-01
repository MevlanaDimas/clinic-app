<?php

namespace App\Exports\Sheets;

use App\Models\Bills;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class BillExpensesSheet implements FromCollection, WithTitle, WithCustomStartCell, WithEvents
{
    protected $year;

    public function __construct(int $year)
    {
        $this->year = $year;
    }

    public function collection()
    {
        $output = new Collection();

        // --- SECTION 1: Marketing & Medical Waste ---
        $output->push([
            'Date', 'Bill ID', 'Mkt ID', 'Mkt Name', 'Mkt Cost', 
            '', '', // TWO COLUMN SPACER (G & H)
            'Date', 'Bill ID', 'Waste ID', 'Waste Name', 'Waste Cost'
        ]);

        Bills::query()
            ->whereYear('created_at', $this->year)
            ->with(['marketingCosts', 'medicalWasteManagementCosts', 'utilityCosts.utilityCost', 'totalStaffSalaryCost.staffSalaryCosts.staffSalary', 'purchaseRequests.items.supplier'])
            ->chunk(100, function ($bills) use ($output) {
                foreach ($bills as $bill) {
                    $mkt = $bill->marketingCosts;
                    $mwc = $bill->medicalWasteManagementCosts;

                    $output->push([
                        $bill->created_at->format('Y-m-d'),
                        $bill->bill_code,
                        $mkt->pluck('marketing_code')->implode("\n"),
                        $mkt->pluck('name')->implode("\n"),
                        $mkt->pluck('amount')->implode("\n"), // Fixed: likely 'amount' not 'total_cost' based on Model
                        '', '', // Spacer
                        $bill->created_at->format('Y-m-d'),
                        $bill->bill_code,
                        $mwc->pluck('medical_waste_management_code')->implode("\n"),
                        $mwc->pluck('name')->implode("\n"),
                        $mwc->pluck('amount')->implode("\n"), // Fixed: likely 'amount' not 'total_cost' based on Model
                    ]);
                }
            });

        $output->push(['']); // Gap between sections

        // --- SECTION 2: Utility & Staff Salaries ---
        $output->push([
            'Date', 'Bill ID', 'Util ID', 'Util Name', 'Cost', 'Total Util',
            '', '', // TWO COLUMN SPACER
            'Date', 'Bill ID', 'Payroll ID', 'Staff Name', 'Position', 'Salary', 'Total Staff'
        ]);

        // Re-query or reset cursor is not needed with chunk if we processed everything, 
        // but since we need to iterate again for the second section, we run the query again 
        // or we could have built both arrays in one pass. 
        // For memory efficiency with large datasets, two passes is safer than holding everything in memory if we weren't returning a Collection.
        // However, FromCollection requires holding it all. So we can just iterate the same query again.
        
        Bills::query()
            ->whereYear('created_at', $this->year)
            ->with(['utilityCosts.utilityCost', 'totalStaffSalaryCost.staffSalaryCosts.staffSalary'])
            ->chunk(100, function ($bills) use ($output) {
                foreach ($bills as $bill) {
                    // Utility Data
                    $utilIds = [];
                    $utilNames = [];
                    $utilCosts = [];
                    $totalUtil = 0;

                    foreach ($bill->utilityCosts as $totalUtilCost) {
                        $totalUtil += $totalUtilCost->total_amount;
                        foreach ($totalUtilCost->utilityCost as $uc) {
                            $utilIds[] = $uc->id;
                            $utilNames[] = $uc->name;
                            $utilCosts[] = $uc->amount;
                        }
                    }

                    // Staff Data
                    $payrollIds = [];
                    $staffNames = [];
                    $positions = [];
                    $salaries = [];
                    $totalStaff = 0;

                    foreach ($bill->totalStaffSalaryCost as $totalStaffCost) {
                        $totalStaff += $totalStaffCost->total_amount;
                        foreach ($totalStaffCost->staffSalaryCosts as $ssc) {
                            if ($ssc->staffSalary) {
                                $payrollIds[] = $ssc->staffSalary->id;
                                $staffNames[] = $ssc->staffSalary->name;
                                $positions[] = $ssc->staffSalary->position;
                                $salaries[] = $ssc->staffSalary->monthly_salary;
                            }
                        }
                    }

                    $output->push([
                        $bill->created_at->format('Y-m-d'),
                        $bill->bill_code,
                        implode("\n", $utilIds),
                        implode("\n", $utilNames),
                        implode("\n", $utilCosts),
                        $totalUtil,
                        '', '', // Spacer
                        $bill->created_at->format('Y-m-d'),
                        $bill->bill_code,
                        implode("\n", $payrollIds),
                        implode("\n", $staffNames),
                        implode("\n", $positions),
                        implode("\n", $salaries),
                        $totalStaff
                    ]);
                }
            });

        return $output;
    }

    public function title(): string { return 'Operational Expenses'; }

    public function startCell(): string { return 'B4'; }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $sheet = $event->sheet->getDelegate();
                $highestColumn = $sheet->getHighestColumn();
                $highestRow = $sheet->getHighestRow();

                // Style all data with vertical alignment and wrapping
                $sheet->getStyle("B4:{$highestColumn}{$highestRow}")->applyFromArray([
                    'alignment' => [
                        'vertical' => Alignment::VERTICAL_TOP,
                        'wrapText' => true
                    ],
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN]
                    ]
                ]);

                // Auto-size columns for better fit
                foreach (range('B', $highestColumn) as $column) {
                    $sheet->getColumnDimension($column)->setAutoSize(true);
                }
            },
        ];
    }
}