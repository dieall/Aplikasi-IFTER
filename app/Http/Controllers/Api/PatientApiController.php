<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Patient;
use App\Models\AuditLog;
use Illuminate\Validation\Rule;
use Illuminate\Http\Request;

class PatientApiController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $patients = Patient::latest()->paginate(20);
        return response()->json($patients);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['created_by'] = $request->user()->id;
        $patient = Patient::create($data);
        $this->audit('api.patient.created', $patient, $request);

        return response()->json($patient, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        $patient = Patient::findOrFail($id);
        return response()->json($patient);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        $patient = Patient::findOrFail($id);
        $patient->update($this->validateData($request, $patient->id));
        $this->audit('api.patient.updated', $patient, $request);

        return response()->json($patient);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        $patient = Patient::findOrFail($id);
        $patient->delete();
        $this->audit('api.patient.deleted', $patient, request());

        return response()->json(['message' => 'Deleted']);
    }

    private function validateData(Request $request, ?int $ignoreId = null): array
    {
        return $request->validate([
            'mrn' => ['required', 'string', 'max:50', Rule::unique('patients', 'mrn')->ignore($ignoreId)],
            'name' => ['required', 'string', 'max:255'],
            'dob' => ['nullable', 'date'],
            'phone' => ['nullable', 'string', 'max:50'],
            'insurance_number' => ['nullable', 'string', 'max:100'],
            'address' => ['nullable', 'string'],
            'notes' => ['nullable', 'string'],
        ]);
    }

    private function audit(string $action, Patient $patient, Request $request): void
    {
        AuditLog::create([
            'user_id' => $request->user()->id ?? null,
            'action' => $action,
            'entity_type' => Patient::class,
            'entity_id' => $patient->id,
            'description' => 'Audit via API',
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'metadata' => [
                'mrn' => $patient->mrn,
                'name' => $patient->name,
                'channel' => 'api',
            ],
        ]);
    }
}
