<?php

namespace App\Exports;

use App\Exports\Sheets\BillExpensesSheet;
use App\Exports\Sheets\PatientBillsSheet;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;

class FinanceReportExport implements WithMultipleSheets
{
    protected $year;

    public function __construct(int $year)
    {
        $this->year = $year;
    }

    public function sheets(): array
    {
        return [
            new BillExpensesSheet($this->year),
            new PatientBillsSheet($this->year),
        ];
    }
}
