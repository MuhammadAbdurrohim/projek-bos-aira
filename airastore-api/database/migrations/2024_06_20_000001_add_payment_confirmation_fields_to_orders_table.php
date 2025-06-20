<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AddPaymentConfirmationFieldsToOrdersTable extends Migration
{
    public function up()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('payment_proof')->nullable()->after('payment_method');
            $table->text('admin_notes')->nullable()->after('payment_proof');
            $table->enum('verification_status', ['pending', 'approved', 'rejected'])->default('pending')->after('admin_notes');
        });
    }

    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['payment_proof', 'admin_notes', 'verification_status']);
        });
    }
}
