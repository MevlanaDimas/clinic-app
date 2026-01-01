<?php

namespace App\Exports\Sheets;

use App\Models\TotalPatientBills;
use Maatwebsite\Excel\Concerns\FromQuery;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithMapping;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithCustomStartCell;
use Maatwebsite\Excel\Concerns\WithEvents;
use Maatwebsite\Excel\Events\AfterSheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;

class PatientBillsSheet implements FromQuery, WithHeadings, WithMapping, WithTitle, WithCustomStartCell, WithEvents
{
    protected $year;

    public function __construct(int $year)
    {
        $this->year = $year;
    }

    public function query()
    {
        return TotalPatientBills::query()
            ->whereYear('created_at', $this->year)
            ->with([
                'diagnoseBill.diagnose.doctor',
                'prescriptionBill.prescription.medicine.inventory'
            ]);
    }

    public function map($bill): array
    {
        $doctors = $bill->diagnoseBill->map(fn($db) => $db->diagnose?->doctor?->name)->filter()->implode(", \n");
        $diagnoseCosts = $bill->diagnoseBill->map(fn($db) => $db->amount)->filter()->implode(", \n");

        $medicines = $bill->prescriptionBill->map(fn($pb) => $pb->prescription?->medicine?->inventory?->name)->filter()->implode(", \n");
        $qty = $bill->prescriptionBill->map(fn($pb) => $pb->prescription?->quantity)->filter()->implode(", \n");
        $medCosts = $bill->prescriptionBill->map(fn($pb) => $pb->amount)->filter()->implode(", \n");
        
        return [
            $bill->created_at->format('Y-m-d'), // Column B: Date
            $bill->bill_code,                   // Column C: Bill ID
            $bill->administrative_fee,          // Column D: Admin Fee
            $doctors,                           // Column E: Doctors
            $diagnoseCosts,                     // Column F: Costs
            $medicines,                         // Column G: Meds
            $qty,                               // Column H: Qty
            $medCosts,                          // Column I: Med Costs
            $bill->total_cost,                  // Column J: Total
        ];
    }

    public function headings(): array
    {
        return [
            'Date', 'Bill ID', 'Admin Fee', 'Doctors', 'Diagnose Costs', 
            'Medicines', 'Quantity', 'Med Costs', 'Total Patient Bill'
        ];
    }

    public function title(): string { return 'Patient Income'; }

    public function startCell(): string { return 'B4'; }

    public function registerEvents(): array
    {
        return [
            AfterSheet::class => function(AfterSheet $event) {
                $lastRow = $event->sheet->getHighestRow();
                $cellRange = 'B4:J' . $lastRow;

                // Format Header
                $event->sheet->getDelegate()->getStyle('B4:J4')->getFont()->setBold(true);
                $event->sheet->getDelegate()->getStyle('B4:J4')->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);

                // Add Borders and Wrap Text
                $event->sheet->getDelegate()->getStyle($cellRange)->applyFromArray([
                    'borders' => [
                        'allBorders' => ['borderStyle' => Border::BORDER_THIN],
                    ],
                    'alignment' => [
                        'wrapText' => true,
                        'vertical' => Alignment::VERTICAL_TOP,
                    ],
                ]);
            },
        ];
    }
}