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
        Schema::create('request_items', function (Blueprint $table) {
            $table->id();
            $table->string('request_number')->unique();
            $table->foreignId('purchase_request_id')->constrained(table: 'purchase_requests', column: 'id', indexName: 'purchase_request_id')->onDelete('cascade');
            $table->string('item_name');
            $table->foreignId('supplier_id')->constrained(table: 'suppliers', column: 'id', indexName: 'purchase_supplier_id')->onDelete('cascade');
            $table->enum('type', ['medicine', 'equipment']);
            $table->text('reason');
            $table->unsignedInteger('quantity');
            $table->decimal('price_per_unit', 12, 2)->default(0);
            $table->decimal('total_price', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_items');
    }
};
