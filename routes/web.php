<?php

use App\Http\Controllers\BillsController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\DiagnoseController;
use App\Http\Controllers\FinanceManagementController;
use App\Http\Controllers\InventoriesController;
use App\Http\Controllers\MarketingController;
use App\Http\Controllers\MedicalWasteController;
use App\Http\Controllers\MedicineContoller;
use App\Http\Controllers\PatientBillsController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\PatientRegistrationController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\PrescriptionController;
use App\Http\Controllers\PurchaseDeliveryStatusController;
use App\Http\Controllers\PurhaseRequestController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\StaffSalaryController;
use App\Http\Controllers\StaffSalaryCostsController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UtilityCostsController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login');

Route::middleware(['auth'])->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'dashboard'])->name('dashboard');

    Route::prefix('permissions')->controller(PermissionController::class)->group(function () {
        Route::get('/', 'index')->middleware(['permission:permission.view'])->name('permission.index');
        Route::post('/', 'store')->middleware(['permission:permission.create'])->name('permission.store');
        Route::patch('/{id}', 'update')->middleware(['permission:permission.edit'])->name('permission.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:permission.delete'])->name('permission.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:permission.view'])->name('permission.getJson');
    });

    Route::prefix("users")->controller(UserController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:user.view'])->name('user.index');
        Route::post('/', 'store')->middleware(['permission:user.create'])->name('user.store');
        Route::patch('/{id}', 'update')->middleware(['permission:user.edit'])->name('user.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:user.delete'])->name('user.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:user.view'])->name('user.getJson');
    });

    Route::prefix('roles')->controller(RoleController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:role.view'])->name('role.index');
        Route::post('/', 'store')->middleware(['permission:role.create'])->name('role.store');
        Route::patch('/{id}', 'update')->middleware(['permission:role.edit'])->name('role.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:role.delete'])->name('role.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:role.view'])->name('role.getJson');
    });

    Route::prefix('finance-management')->controller(FinanceManagementController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:financeData.view'])->name('financeManagement.index');
        Route::get('/download-report/{year}', 'downloadReport')->middleware(['permission:financeData.download'])->name('financeManagement.downloadReport');
    });

    Route::prefix('staff-salary')->controller(StaffSalaryController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:staffSalaryData.view'])->name('staffSalary.index');
        Route::post('/', 'store')->middleware(['permission:staffSalaryData.create'])->name('staffSalary.store');
        Route::patch('/{id}', 'update')->middleware(['permission:staffSalaryData.edit'])->name('staffSalary.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:staffSalaryData.delete'])->name('staffSalary.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:staffSalaryData.view'])->name('staffSalary.getJson');
    });

    Route::prefix('staff-salary-costs')->controller(StaffSalaryCostsController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:staffPaidData.view'])->name('staffSalaryCosts.index');
        Route::post('/', 'store')->middleware(['permission:staffPaidData.create'])->name('staffSalaryCosts.store');
        Route::patch('/{id}', 'update')->middleware(['permission:staffPaidData.edit'])->name('staffSalaryCosts.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:staffPaidData.delete'])->name('staffSalaryCosts.destroy');
    });

    Route::prefix('marketings')->controller(MarketingController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:marketingData.view'])->name('marketings.index');
        Route::post('/', 'store')->middleware(['permission:marketingData.create'])->name('marketings.store');
        Route::patch('/{id}', 'update')->middleware(['permission:marketingData.edit'])->name('marketings.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:marketingData.delete'])->name('marketings.destroy');
    });

    Route::prefix('medical-waste')->controller(MedicalWasteController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:medicalWasteData.view'])->name('medicalWaste.index');
        Route::post('/', 'store')->middleware(['permission:medicalWasteData.create'])->name('medicalWaste.store');
        Route::patch('/{id}', 'update')->middleware(['permission:medicalWasteData.edit'])->name('medicalWaste.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:medicalWasteData.delete'])->name('medicalWaste.destroy');
    });

    Route::prefix('utility-cost')->controller(UtilityCostsController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:utilityCost.view'])->name('utilityCost.index');
        Route::post('/', 'store')->middleware(['permission:utilityCost.create'])->name('utilityCost.store');
        Route::patch('/{id}', 'update')->middleware(['permission:utilityCost.edit'])->name('utilityCost.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:utilityCost.delete'])->name('utilityCost.destroy');

        Route::prefix('/{id}/utilities')->controller(UtilityCostsController::class)->group(function(){
            Route::get('/', 'showUtilityCost')->middleware(['permission:utilitiesData.view'])->name('utilityCost.utilities.showUtilityCost');
            Route::post('/', 'storeUtilityCost')->middleware(['permission:utilitiesData.create'])->name('utilityCost.utilities.storeUtilityCost');
            Route::patch('/{utilityId}', 'updateUtilityCost')->middleware(['permission:utilitiesData.edit'])->name('utilityCost.utilities.updateUtilityCost');
            Route::delete('/{utilityId}', 'destroyUtilityCost')->middleware(['permission:utilitiesData.delete'])->name('utilityCost.utilities.destroyUtilityCost');
        });
    });

    Route::prefix('supplier')->controller(SupplierController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:supplierData.view'])->name('supplier.index');
        Route::post('/', 'store')->middleware(['permission:supplierData.create'])->name('supplier.store');
        Route::patch('/{id}', 'update')->middleware(['permission:supplierData.edit'])->name('supplier.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:supplierData.delete'])->name('supplier.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:supplierData.view'])->name('supplier.getJson');
    });

    Route::prefix('inventory')->controller(InventoriesController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:inventories.view'])->name('inventory.index');
        Route::post('/', 'store')->middleware(['permission:inventories.create'])->name('inventory.store');
        Route::patch('/{id}', 'update')->middleware(['permission:inventories.edit'])->name('inventory.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:inventories.delete'])->name('inventory.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:inventories.view'])->name('inventory.getJson');
    });

    Route::prefix('purchase')->controller(PurhaseRequestController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:purchaseData.view'])->name('purchase.index');
        Route::post('/', 'store')->middleware(['permission:purchaseData.create'])->name('purchase.store');
        Route::patch('/{id}', 'update')->middleware(['permission:purchaseData.edit'])->name('purchase.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:purchaseData.delete'])->name('purchase.destroy'); 
        Route::patch('/{id}/status', 'status')->middleware(['permission:purchaseData.edit'])->name('purchase.status');
        Route::get('/get-json', 'getJsonRequestItem')->middleware(['permission:purchaseData.view'])->name('purchase.requestItems.getJson');

        Route::prefix('/{id}/request-items')->controller(PurhaseRequestController::class)->group(function(){
            Route::get('/', 'showRequestItem')->middleware(['permission:requestItem.view'])->name('purchase.requestItems.showRequestItem');
            Route::post('/', 'storeRequestItem')->middleware(['permission:requestItem.create'])->name('purchase.requestItems.storeRequestItem');
            Route::patch('/{requestItemId}', 'updateRequestItem')->middleware(['permission:requestItem.edit'])->name('purchase.requestItems.updateRequestItem');
            Route::delete('/{requestItemId}', 'destroyRequestItem')->middleware(['permission:requestItem.delete'])->name('purchase.requestItems.destroyRequestItem');
        });
    });

    Route::prefix('purchase-item-delivery')->controller(PurchaseDeliveryStatusController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:purchaseDeliveryStatus.view'])->name('purchaseDeliveryStatus.index');
        Route::patch('/{id}', 'update')->middleware(['permission:purchaseDeliveryStatus.edit'])->name('purchaseDeliveryStatus.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:purchaseDeliveryStatus.delete'])->name('purchaseDeliveryStatus.destroy');
    });

    Route::prefix('bills')->controller(BillsController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:billData.view'])->name('bills.index');
        Route::post('/', 'store')->middleware(['permission:billData.create'])->name('bills.store');
        Route::patch('/{id}', 'update')->middleware(['permission:billData.edit'])->name('bills.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:billData.delete'])->name('bills.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:billData.view'])->name('bills.getJson');
    });

    Route::prefix('medicine')->controller(MedicineContoller::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:medicineData.view'])->name('medicine.index');
        Route::post('/', 'store')->middleware(['permission:medicineData.create'])->name('medicine.store');
        Route::patch('/{id}', 'update')->middleware(['permission:medicineData.edit'])->name('medicine.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:medicineData.delete'])->name('medicine.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:medicineData.view'])->name('medicine.getJson');
    });

    Route::prefix('patient-data')->controller(PatientController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:patientData.view'])->name('patient.index');
        Route::post('/', 'store')->middleware(['permission:patientData.create'])->name('patient.store');
        Route::patch('/{id}', 'update')->middleware(['permission:patientData.edit'])->name('patient.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:patientData.delete'])->name('patient.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:patientData.view'])->name('patient.getJson');

        Route::prefix('/{id}/health-data')->controller(PatientController::class)->group(function(){
            Route::get('/', 'showHealthData')->middleware(['permission:healthData.view'])->name('patient.healthData.showHealthData');
            Route::post('/', 'storeHealthData')->middleware(['permission:healthData.create'])->name('patient.healthData.storeHealthData');
            Route::patch('/{healthDataId}', 'updateHealthData')->middleware(['permission:healthData.edit'])->name('patient.healthData.updateHealthData');
            Route::delete('/{healthDataId}', 'destroyHealthData')->middleware(['permission:healthData.delete'])->name('patient.healthData.destroyHealthData');
        });
    });

    Route::prefix('patient-registration')->controller(PatientRegistrationController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:patientRegist.view'])->name('registration.index');
        Route::post('/', 'store')->middleware(['permission:patientRegist.create'])->name('registration.store');
        Route::patch('/{id}', 'update')->middleware(['permission:patientRegist.edit'])->name('registration.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:patientRegist.delete'])->name('registration.destroy');
        Route::patch('/{id}/status', 'status')->middleware(['permission:patientRegist.edit'])->name('registration.status');
        Route::get('/get-json', 'getJson')->name('registration.getJson');
    });

    Route::prefix('diagnose')->controller(DiagnoseController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:diagnoseData.view'])->name('diagnose.index');
        Route::post('/', 'store')->middleware(['permission:diagnoseData.create'])->name('diagnose.store');
        Route::patch('/{id}', 'update')->middleware(['permission:diagnoseData.edit'])->name('diagnose.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:diagnoseData.delete'])->name('diagnose.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:diagnoseData.view'])->name('diagnose.getJson');
    });

    Route::prefix('prescription')->controller(PrescriptionController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:prescriptionData.view'])->name('prescription.index');
        Route::post('/', 'store')->middleware(['permission:prescriptionData.create'])->name('prescription.store');
        Route::patch('/{id}', 'update')->middleware(['permission:prescriptionData.edit'])->name('prescription.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:prescriptionData.delete'])->name('prescription.destroy');
        Route::get('/get-json', 'getJson')->middleware(['permission:prescriptionData.view'])->name('prescription.getJson');
    });

    Route::prefix('total-patient-bill')->controller(PatientBillsController::class)->group(function(){
        Route::get('/', 'index')->middleware(['permission:patientBillData.view'])->name('totalPatientBill.index');
        Route::post('/', 'store')->middleware(['permission:patientBillData.create'])->name('totalPatientBill.store');
        Route::get('/{id}/print', 'print')->middleware(['permission:patientBillData.view'])->name('totalPatientBill.print');
        Route::patch('/{id}', 'update')->middleware(['permission:patientBillData.edit'])->name('totalPatientBill.update');
        Route::delete('/{id}', 'destroy')->middleware(['permission:patientBillData.delete'])->name('totalPatientBill.destroy');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
