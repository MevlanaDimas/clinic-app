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
        Schema::create('staff_salary_costs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('staff_salary_id')->constrained(table: 'staff_salaries', column: 'id', indexName: 'staff_salary_id')->onDelete('cascade');
            $table->foreignId('total_salary_cost_id')->constrained(table: 'total_staff_salary_costs', column: 'id', indexName: 'total_salary_cost_id')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_salary_costs');
    }
};
