<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('total_staff_salary_costs', function (Blueprint $table) {
            $table->id();
            $table->string('employee_payroll_id')->unique();
            $table->decimal('total_amount', 15, 2)->default(0);
            $table->foreignId('bill_id')->nullable()->constrained(table: 'bills', column: 'id', indexName: 'bill_id_staff_salary')->onDelete('cascade');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('total_staff_salary_costs');
    }
};
