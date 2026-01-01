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
        Schema::table('medicines', function (Blueprint $table) {
            if(Schema::hasColumn('medicines', 'purchase_price')){
                $table->dropColumn('purchase_price');
            }

            $table->decimal('sell_price_per_unit', 8, 2)->after('quantity_in_stock');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('medicines', function (Blueprint $table) {
            $table->dropColumn('sell_price_per_unit');
        });
    }
};
