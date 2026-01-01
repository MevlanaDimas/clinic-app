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
        Schema::create('purchase_requests', function (Blueprint $table) {
            $table->id();
            $table->string('purchase_request_id')->unique();
            $table->foreignId('user_id')->constrained(table: 'users', column: 'id', indexName: 'requester_id')->onDelete('cascade');
            $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
            $table->date('required_by_date');
            $table->foreignId('bill_id')->nullable()->constrained(table: 'bills', column: 'id', indexName: 'bill_id_purchase_request')->onDelete('cascade');
            $table->decimal('total_amount', 15, 2)->onDelete('cascade')->default(0);
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('purchase_requests');
    }
};
