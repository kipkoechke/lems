"use client";

import { useState } from "react";
import { FaListAlt, FaTimes, FaInfoCircle } from "react-icons/fa";
import { SearchableSelect } from "@/components/common/SearchableSelect";
import { usePatients } from "@/features/patients/usePatients";
import { useDebounce } from "@/hooks/useDebounce";
import type { VendorWorklistTestOptions } from "@/services/apiEquipment";

interface WorklistTestModalProps {
  equipmentName?: string;
  isRunning: boolean;
  onRun: (options: VendorWorklistTestOptions) => void;
  onClose: () => void;
}

/**
 * Run an MWL test.
 *
 * The probe carries a freshly generated demo patient by default — synthetic,
 * but built by the same code as a real order, so the modality renders
 * something representative. A real patient is opt-in and never a fallback: a
 * stranger's record must not appear on a modality because somebody pressed a
 * button here.
 */
export default function WorklistTestModal({
  equipmentName,
  isRunning,
  onRun,
  onClose,
}: WorklistTestModalProps) {
  const [useRealPatient, setUseRealPatient] = useState(false);
  const [patientId, setPatientId] = useState("");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 350);

  const { patients, isLoading } = usePatients(
    debouncedSearch ? { search: debouncedSearch } : undefined,
  );

  const options = patients.map((patient) => ({
    value: patient.id,
    label: patient.name,
    description: [patient.identification_no, patient.phone]
      .filter(Boolean)
      .join(" • "),
  }));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">MWL Test</h2>
            <p className="text-sm text-slate-500">
              {equipmentName || "This equipment"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex gap-2 rounded-lg bg-blue-50 border border-blue-100 px-3 py-2.5 text-xs text-blue-800">
            <FaInfoCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <p>
              A probe worklist is pushed to the device under a real accession
              number. When the modality acquires the study and sends it back,
              it attaches here — that round trip is what the test proves.
            </p>
          </div>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 cursor-pointer">
            <input
              type="radio"
              checked={!useRealPatient}
              onChange={() => {
                setUseRealPatient(false);
                setPatientId("");
              }}
              className="mt-0.5 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Demo patient
              </span>
              <span className="block text-xs text-slate-500">
                A new synthetic patient each run, so consecutive tests are
                distinguishable on the worklist.
              </span>
            </span>
          </label>

          <label className="flex items-start gap-3 rounded-lg border border-slate-200 px-3 py-2.5 cursor-pointer">
            <input
              type="radio"
              checked={useRealPatient}
              onChange={() => setUseRealPatient(true)}
              className="mt-0.5 text-blue-600 focus:ring-blue-500"
            />
            <span>
              <span className="block text-sm font-medium text-slate-900">
                A real patient
              </span>
              <span className="block text-xs text-slate-500">
                Their details go to the modality. Use this only to check a
                specific record end to end.
              </span>
            </span>
          </label>

          {useRealPatient && (
            <SearchableSelect
              label="Patient"
              required
              options={options}
              value={patientId}
              onChange={setPatientId}
              onSearchChange={setSearch}
              placeholder={isLoading ? "Loading..." : "Select a patient"}
              searchPlaceholder="Search by name or ID number..."
              isLoading={isLoading}
            />
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isRunning || (useRealPatient && !patientId)}
              onClick={() =>
                onRun(useRealPatient ? { patient_id: patientId } : {})
              }
              className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              <FaListAlt className="w-3.5 h-3.5" />
              {isRunning ? "Sending..." : "Send Test Worklist"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
