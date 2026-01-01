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
        Schema::create('patient_health_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->timestamps();
            $table->integer('systolic_bp');
            $table->integer('diastolic_bp');
            $table->integer('heart_rate');
            $table->integer('oxygen_saturation');
            $table->integer('temperature');
            $table->integer('height');
            $table->integer('weight');
            $table->text('complaints')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_health_data');
    }
};
