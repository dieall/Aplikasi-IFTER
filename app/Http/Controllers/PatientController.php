<?php

namespace App\Http\Controllers;

use App\Models\Patient;
use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\Rule;

class PatientController extends Controller
{
    public function index()
    {
        $patients = Patient::latest()->paginate(10);

        return view('patients.index', compact('patients'));
    }

    public function create()
    {
        return view('patients.create');
    }

    public function store(Request $request)
    {
        $data = $this->validateData($request);
        $data['created_by'] = Auth::id();

        $patient = Patient::create($data);
        $this->audit('patient.created', $patient, 'Pasien dibuat');

        return redirect()->route('patients.index')->with('status', 'Pasien berhasil disimpan');
    }

    public function edit(Patient $patient)
    {
        return view('patients.edit', compact('patient'));
    }

    public function update(Request $request, Patient $patient)
    {
        $patient->update($this->validateData($request, $patient->id));
        $this->audit('patient.updated', $patient, 'Pasien diperbarui');

        return redirect()->route('patients.index')->with('status', 'Pasien berhasil diperbarui');
    }

    public function destroy(Patient $patient)
    {
        $patient->delete();
        $this->audit('patient.deleted', $patient, 'Pasien dihapus');

        return redirect()->route('patients.index')->with('status', 'Pasien dihapus');
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

    private function audit(string $action, Patient $patient, string $description): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action' => $action,
            'entity_type' => Patient::class,
            'entity_id' => $patient->id,
            'description' => $description,
            'ip' => request()->ip(),
            'user_agent' => request()->userAgent(),
            'metadata' => [
                'mrn' => $patient->mrn,
                'name' => $patient->name,
            ],
        ]);
    }
}
