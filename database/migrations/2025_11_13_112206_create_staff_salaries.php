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
        Schema::create('staff_salaries', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('position', ['director', 'manager', 'head of medical staff', 'doctor', 'nurse', 'pharmacist', 'medical record staff', 'head of administration and support staff', 'admin', 'cleaning staff', 'security staff']);
            $table->foreignId('staff_id')->nullable()->constrained(table: 'users', column: 'id', indexName: 'staff_id')->onDelete('set null');
            $table->decimal('monthly_salary', 15, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('staff_salaries');
    }
};
