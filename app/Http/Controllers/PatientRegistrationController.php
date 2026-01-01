<?php

namespace App\Http\Controllers;

use App\Http\Requests\PatientRegistration as RequestsPatientRegistration;
use App\Http\Requests\PatientRegistrationStatus;
use App\Http\Resources\PatientRegistrationResource;
use App\Models\Patient;
use App\Models\PatientRegistration;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\JsonResponse;
use Inertia\Inertia;
use Inertia\Response;
use App\Models\User;

class PatientRegistrationController extends Controller
{
    public function index(): Response
    {
        $perPage = request()->query('perPage', 25);
        $search = request()->query('search', '');
        // Query PatientRegistration directly and eager load relationships
        $query = PatientRegistration::query()
            ->with(['patient:id,patient_name,patient_number', 'doctor:id,name', 'patientHealthData'])
            ->filter($search);

        $query->orderBy('queue_number', 'ASC');

        if ($perPage == -1 || $perPage > 100) {
            $perPage = 100;
        }
        $registrations = PatientRegistrationResource::collection($query->paginate($perPage));

        return Inertia::render('patient/registration', [
            'registrations' => $registrations,
        ]);
    }

    public function store(RequestsPatientRegistration $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $this->createRegistrationWithHealthData($request->validated());
            });

            return redirect()->back()->with('success', 'Patient registration has been added successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to add patient registration. ' . $e->getMessage());
        }
    }

    public function update(RequestsPatientRegistration $request): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request) {
                $this->updateRegistrationWithHealthData($request->validated());
            });

            return redirect()->back()->with('success', 'Patient registration has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update patient registration. ' . $e->getMessage());
        }
    }

    public function status(PatientRegistrationStatus $request, $id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($request, $id) {
                PatientRegistration::findOrFail($id)->update(['status' => $request->status]);
            });

            return redirect()->back()->with('success', 'Patient registration status has been updated successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to update patient registration status. ' . $e->getMessage());
        }
    }

    public function destroy($id): RedirectResponse
    {
        try {
            DB::transaction(function () use ($id) {
                PatientRegistration::findOrFail($id)->delete();
            });
            return redirect()->back()->with('success', 'Patient registration has been deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->back()->with('error', 'Failed to delete patient registration. ' . $e->getMessage());
        }
    }

    public function getJson(Request $request): JsonResponse
    {
        $search = $request->query('search', '');
        $doctor = $request->user()->id;
        
        $query = PatientRegistration::query()
            ->where('status', 'on_process')
            ->with(['patient:id,patient_name,patient_number', 'doctor:id,name'])
            ->where('doctor_id', $doctor)
            ->select('id', 'patient_id', 'doctor_id', 'queue_number');

        $query->when($search, function ($q) use ($search) {
            $q->where(function ($subQ) use ($search) {
                $subQ->whereHas('patient', function ($patientQuery) use ($search) {
                    $patientQuery->where('patient_name', 'LIKE', "%{$search}%")
                                 ->orWhere('patient_number', 'LIKE', "%{$search}%");
                })->orWhere('queue_number', 'LIKE', "%{$search}%");
            });
        });

        $query->orderBy('queue_number', 'DESC');

        $registrations = $query->limit(20)
            ->get()
            ->map(function ($registration){
            return [
                'label' => '(' . $registration->queue_number . ')' . ' ' . ' ' . '-' . ' ' . $registration->patient->patient_name,
                'value' => $registration->patient_id
            ];
        });

        return response()->json($registrations);
    }

    private function createRegistrationWithHealthData(array $data): void
    {
        $patient = Patient::findOrFail($data['patient_id']);
        $doctor = User::findOrFail($data['doctor_id']);

        $registration = $patient->registration()->create([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $data['doctor_id'],
            'queue_number' => 'TEMP-' . uniqid()
        ]);

        // Update with actual ID-based queue number
        $registration->update([
            'queue_number' => PatientRegistration::generateQueueNumber($doctor->name, $registration->id)
        ]);

        $patient->healthData()->create([
            'patient_id' => $data['patient_id'],
            'systolic_bp' => $data['systolic_bp'],
            'diastolic_bp' => $data['diastolic_bp'],
            'heart_rate' => $data['heart_rate'],
            'oxygen_saturation' => $data['oxygen_saturation'],
            'temperature' => $data['temperature'],
            'height' => $data['height'],
            'weight' => $data['weight'],
            'complaints' => $data['complaints']
        ]);
    }

    private function updateRegistrationWithHealthData(array $data): void
    {
        $patient = Patient::findOrFail($data['patient_id']);
        $patient->registration()->update([
            'patient_id' => $data['patient_id'],
            'doctor_id' => $data['doctor_id'],
        ]);

        // Update the latest health data record
        $latestHealthData = $patient->healthData()->latest()->first();
        if ($latestHealthData) {
            $latestHealthData->update([
                'systolic_bp' => $data['systolic_bp'],
                'diastolic_bp' => $data['diastolic_bp'],
                'heart_rate' => $data['heart_rate'],
                'oxygen_saturation' => $data['oxygen_saturation'],
                'temperature' => $data['temperature'],
                'height' => $data['height'],
                'weight' => $data['weight'],
                'complaints' => $data['complaints']
            ]);
        }
    }
}
