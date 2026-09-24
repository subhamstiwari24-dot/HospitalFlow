import { createContext, useContext, useState, type ReactNode } from 'react';
import type { QueuePatient } from '../types';
import { useSharedQueue } from './SharedQueueContext';

interface QueueContextValue {
  queue: QueuePatient[];
  currentIndex: number;
  completedCount: number;
  selectedPatientId: string | null;
  currentPatient: QueuePatient | null;
  waitingPatients: QueuePatient[];
  callNextPatient: () => void;
  completeConsultation: () => void;
  skipPatient: () => void;
  selectPatient: (id: string) => void;
  startConsultation: (id: string) => void;
}

const QueueContext = createContext<QueueContextValue | null>(null);

export function QueueProvider({ children }: { children: ReactNode }) {
  const shared = useSharedQueue();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const { queue } = shared;

  const activePatients = queue.filter(
    (p) => p.consultationStatus !== 'Completed' && p.consultationStatus !== 'Skipped'
  );
  const currentPatient = activePatients[0] ?? null;
  const waitingPatients = activePatients.slice(1);

  const callNextPatient = () => {
    shared.advance();
    setCompletedCount((c) => c + 1);
    setCurrentIndex((i) => i + 1);
  };

  const completeConsultation = () => {
    callNextPatient();
  };

  const skipPatient = () => {
    shared.skip();
    setCurrentIndex((i) => i + 1);
  };

  const selectPatient = (id: string) => {
    setSelectedPatientId(id);
  };

  const startConsultation = (id: string) => {
    shared.startConsultation(id);
  };

  return (
    <QueueContext.Provider
      value={{
        queue,
        currentIndex,
        completedCount,
        selectedPatientId,
        currentPatient,
        waitingPatients,
        callNextPatient,
        completeConsultation,
        skipPatient,
        selectPatient,
        startConsultation,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}

export function useQueue(): QueueContextValue {
  const ctx = useContext(QueueContext);
  if (!ctx) throw new Error('useQueue must be used inside QueueProvider');
  return ctx;
}
