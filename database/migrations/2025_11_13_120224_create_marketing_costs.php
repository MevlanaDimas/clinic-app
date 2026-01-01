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
        Schema::create('marketing_costs', function (Blueprint $table) {
            $table->id();
            $table->string('marketing_id')->unique();
            $table->string('name');
            $table->decimal('amount', 15, 2);
            $table->text('description')->nullable();
            $table->foreignId('bill_id')->nullable()->constrained(table: 'bills', column: 'id', indexName: 'bill_id_marketing')->onDelete('cascade');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('marketing_costs');
    }
};
