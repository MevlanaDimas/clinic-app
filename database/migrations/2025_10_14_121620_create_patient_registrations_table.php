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
        Schema::create('patient_registrations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('patient_id')->constrained('patients')->onDelete('cascade');
            $table->foreignId('patient_number')->constrained('patients')->onDelete('cascade');
            $table->enum('doctor', ['Dr. Smith', 'Dr. Johnson', 'Dr. Lee', 'Dr. Brown', 'Dr. Davis', 'Dr. Wilson', 'Dr. Taylor', 'Dr. Anderson', 'Dr. Thomas', 'Dr. Jackson', 'Dr. White']);
            $table->string('queue_number')->unique();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patient_registrations');
    }
};
