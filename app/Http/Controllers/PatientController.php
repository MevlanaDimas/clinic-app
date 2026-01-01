<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientData;
use App\Http\Requests\PatientHealthData as RequestsPatientHealthData;
use App\Http\Resources\PatientHealthDataResource;
use App\Http\Resources\PatientResource;
use App\Models\Patient;
use App\Models\PatientHealthData;
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class PatientController extends Controller
{
    public function index(Request $request): Response
    {
        $perPage = $request->query('perPage', 25);
        $search = $request->query('search', '');
        
        $query = Patient::query()
            ->select('id', 'patient_number', 'patient_name', 'sex', 'blood_type', 'birth_date', 'phone_number', 'address')
            ->filter($search)->orderBy('patient_name', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $patients = PatientResource::collection($query->paginate($perPage));

        return Inertia::render('patient/index', [
            'patients' => $patients
        ]);
    }

    public function store(PatientData $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                Patient::create($request->validated());
            });
            return redirect()->back()->with('success', 'Patient data has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add patient data.' . $e->getMessage());
        }
    }

    public function update(PatientData $request, int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                Patient::findOrFail($id)->update($request->validated());
            });
            return redirect()->back()->with('success', 'Patient data has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update patient data.' . $e->getMessage());
        }
    }

    public function destroy(int $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                Patient::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Patient data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete patient data.' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $query = Patient::query()->select('id', 'patient_name', 'patient_number');

        if($search) {
            $query->where('patient_name', 'LIKE', "%{$search}%")
                  ->orWhere('patient_number', 'LIKE', "%{$search}%")
                  ->orWhere('address', 'LIKE', "%{$search}%")
                  ->orWhere('phone_number', 'LIKE', "%{$search}%")
                  ->orWhere('sex', 'LIKE', "%{$search}%")
                  ->orWhere('blood_type', 'LIKE', "%{$search}%");
        }

        $query->orderBy('patient_name', 'ASC');

        $patient = $query->limit(20)
            ->get()
            ->map(function ($patient){
            return [
                'label' => $patient->patient_name . ' (' . $patient->patient_number . ')',
                'value' => $patient->id
            ];
        });

        return response()->json($patient);
    }

    public function showHealthData(int $id): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        $patientModel = Patient::findOrFail($id);
        $query = $patientModel->healthData()->filter($search);
        $patient = new PatientResource($patientModel);

        $query->orderBy('created_at', 'DESC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $healthDatas = PatientHealthDataResource::collection($query->paginate($perPage));

        return Inertia::render('patient/health-data', [
            'healthDatas' => $healthDatas,
            'patient' => $patient
        ]);
    }

    public function storeHealthData(RequestsPatientHealthData $request, int $patient_id): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request, $patient_id) {
                Patient::findOrFail($patient_id)->healthData()->create([
                    'patient_id' => $patient_id,
                    'systolic_bp' => $request->systolic_bp,
                    'diastolic_bp' => $request->diastolic_bp,
                    'heart_rate' => $request->heart_rate,
                    'oxygen_saturation' => $request->oxygen_saturation,
                    'temperature' => $request->temperature,
                    'height' => $request->height,
                    'weight' => $request->weight,
                    'complaints' => $request->complaints
                ]);
            });
            return redirect()->back()->with('success', 'Patient health data has been added successfully.');
        } catch (\Exception $e){
            return redirect()->back()->with('error', 'Failed to add patient health data.' . $e->getMessage());
        }
    }

    public function updateHealthData(RequestsPatientHealthData $request, int $id, int $healthDataId): RedirectResponse
    {
        try{
            DB::transaction(function () use ($request, $id, $healthDataId) {
                PatientHealthData::findOrFail($healthDataId)->update([
                    'patient_id' => $id,
                    'systolic_bp' => $request->systolic_bp,
                    'diastolic_bp' => $request->diastolic_bp,
                    'heart_rate' => $request->heart_rate,
                    'oxygen_saturation' => $request->oxygen_saturation,
                    'temperature' => $request->temperature,
                    'height' => $request->height,
                    'weight' => $request->weight,
                    'complaints' => $request->complaints
                ]);
            });
            return redirect()->back()->with('success', 'Patient health data has been updated successfully.');
        } catch (\Exception $e){
            return redirect()->back()->with('error', 'Failed to update patient health data.' . $e->getMessage());
        }
    }

    public function destroyHealthData(int $patient_id, int $healthDataId): RedirectResponse
    {
        try{
            DB::transaction(function () use ($healthDataId) {
                PatientHealthData::findOrFail($healthDataId)->delete();
            });
            return redirect()->back()->with('success', 'Patient health data has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete patient health data.' . $e->getMessage());
        }
    }
}
