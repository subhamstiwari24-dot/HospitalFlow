/**
 * Single source of truth for the patient queue.
 * Both the Doctor flow (QueueContext) and Patient flow (PatientContext)
 * read from and write to this context, so a token booked by a patient
 * immediately appears in the doctor's queue and vice-versa.
 */
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { QueuePatient, ConsultationStatus } from '../types';
import { queuePatients as seedQueuePatients, liveQueueTokens } from '../data/mockData';

// Build the initial unified queue by merging the two seed arrays.
// liveQueueTokens is the ordered list (A-019 … A-028).
// queuePatients provides rich patient data for tokens A-023 … A-028.
const patientByToken = new Map(seedQueuePatients.map((p) => [p.token, p]));

function makeMinimalPatient(token: string, status: ConsultationStatus, name?: string): QueuePatient {
  return {
    id: token,
    token,
    initials: name ? name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : 'PT',
    name: name ?? `Patient ${token}`,
    age: 0,
    gender: '—',
    consultationType: 'OPD Walk-in',
    appointmentTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    priority: 'Normal',
    consultationStatus: status,
    waitTime: 0,
  };
}

const initialQueue: QueuePatient[] = liveQueueTokens.map((t) => {
  const rich = patientByToken.get(t.token);
  if (rich) return { ...rich, consultationStatus: t.status };
  return makeMinimalPatient(t.token, t.status);
});

// ─── Context types ────────────────────────────────────────────────────────────

interface SharedQueueContextValue {
  queue: QueuePatient[];
  /** Add a new patient token to the end of the queue (from Patient booking flow). */
  addPatientToken: (token: string, patientName?: string) => void;
  /** Mark current 'In consultation' as Completed, promote next Waiting. */
  advance: () => void;
  /** Mark current 'In consultation' as Skipped, promote next Waiting. */
  skip: () => void;
  /** Start consultation for a specific patient (by id). */
  startConsultation: (id: string) => void;
  /** Token currently being served (In consultation). */
  currentServing: string;
}

const SharedQueueContext = createContext<SharedQueueContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function SharedQueueProvider({ children }: { children: ReactNode }) {
  const [queue, setQueue] = useState<QueuePatient[]>(initialQueue);

  const currentServing =
    queue.find((p) => p.consultationStatus === 'In consultation')?.token ?? '—';

  const addPatientToken = (token: string, patientName?: string) => {
    setQueue((prev) => {
      // Guard: don't add duplicates
      if (prev.some((p) => p.token === token)) return prev;
      return [...prev, makeMinimalPatient(token, 'Waiting', patientName)];
    });
  };

  const advance = () => {
    setQueue((prev) => {
      const activeIdx = prev.findIndex((p) => p.consultationStatus === 'In consultation');
      const nextIdx = prev.findIndex(
        (p, i) => i > activeIdx && p.consultationStatus === 'Waiting'
      );
      return prev.map((p, i) => {
        if (i === activeIdx) return { ...p, consultationStatus: 'Completed' };
        if (i === nextIdx) return { ...p, consultationStatus: 'In consultation' };
        return p;
      });
    });
  };

  const skip = () => {
    setQueue((prev) => {
      const activeIdx = prev.findIndex((p) => p.consultationStatus === 'In consultation');
      const nextIdx = prev.findIndex(
        (p, i) => i > activeIdx && p.consultationStatus === 'Waiting'
      );
      return prev.map((p, i) => {
        if (i === activeIdx) return { ...p, consultationStatus: 'Skipped' };
        if (i === nextIdx) return { ...p, consultationStatus: 'In consultation' };
        return p;
      });
    });
  };

  const startConsultation = (id: string) => {
    setQueue((prev) => {
      const hasActive = prev.some((p) => p.consultationStatus === 'In consultation');
      if (hasActive) return prev;
      return prev.map((p) =>
        p.id === id ? { ...p, consultationStatus: 'In consultation' } : p
      );
    });
  };

  return (
    <SharedQueueContext.Provider
      value={{ queue, addPatientToken, advance, skip, startConsultation, currentServing }}
    >
      {children}
    </SharedQueueContext.Provider>
  );
}

export function useSharedQueue(): SharedQueueContextValue {
  const ctx = useContext(SharedQueueContext);
  if (!ctx) throw new Error('useSharedQueue must be used inside SharedQueueProvider');
  return ctx;
}
