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
        Schema::create('total_patient_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained(table: 'patients', column: 'id', indexName: 'patient_id')->onDelete('cascade');
            $table->decimal('administrative_fee', 12, 2)->default(0);
            $table->decimal('total_cost', 12, 2)->default(0); 
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('total_patient_bills');
    }
};
