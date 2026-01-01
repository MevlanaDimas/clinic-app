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
        Schema::create('patient_prescription_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('total_patient_bill_id')->constrained(table: 'total_patient_bills', column: 'id', indexName: 'total_patient_bill_id_in_prescription');
            $table->string('item_name')->default('');
            $table->foreignId('prescription_id')->constrained(table: 'prescriptions', column: 'id', indexName: 'prescription_id')->onDelete('cascade');
            $table->decimal('amount', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_prescription_bills');
    }
};
