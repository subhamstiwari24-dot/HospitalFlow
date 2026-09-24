import { createContext, useContext, useState, type ReactNode } from 'react';
import { doctors as initialDoctors, departments as initialDepartments } from '../data/mockData';
import type { Doctor, Department, DoctorStatus } from '../types';

interface AdminContextValue {
  // Doctors
  doctors: Doctor[];
  selectedDoctorId: string | null;
  addDoctor: (doc: Omit<Doctor, 'id'>) => Doctor;
  updateDoctor: (id: string, changes: Partial<Doctor>) => void;
  deactivateDoctor: (id: string) => void;
  removeDoctor: (id: string) => void;
  selectDoctor: (id: string | null) => void;

  // Departments
  departments: Department[];
  selectedDepartmentId: string | null;
  addDepartment: (dept: Omit<Department, 'id'>) => Department;
  updateDepartment: (id: string, changes: Partial<Department>) => void;
  removeDepartment: (id: string) => void;
  selectDepartment: (id: string | null) => void;
}

const AdminContext = createContext<AdminContextValue | null>(null);

let doctorCounter = 100;
let departmentCounter = 100;

export function AdminProvider({ children }: { children: ReactNode }) {
  const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
  const [departments, setDepartments] = useState<Department[]>(initialDepartments);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);

  const addDoctor = (doc: Omit<Doctor, 'id'>): Doctor => {
    const newDoc: Doctor = { ...doc, id: `d${++doctorCounter}` };
    setDoctors((prev) => [...prev, newDoc]);
    return newDoc;
  };

  const updateDoctor = (id: string, changes: Partial<Doctor>) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const deactivateDoctor = (id: string) => {
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: 'Offline' as DoctorStatus } : d))
    );
  };

  const removeDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((d) => d.id !== id));
    if (selectedDoctorId === id) setSelectedDoctorId(null);
  };

  const selectDoctor = (id: string | null) => setSelectedDoctorId(id);

  const addDepartment = (dept: Omit<Department, 'id'>): Department => {
    const newDept: Department = { ...dept, id: `dept${++departmentCounter}` };
    setDepartments((prev) => [...prev, newDept]);
    return newDept;
  };

  const updateDepartment = (id: string, changes: Partial<Department>) => {
    setDepartments((prev) => prev.map((d) => (d.id === id ? { ...d, ...changes } : d)));
  };

  const removeDepartment = (id: string) => {
    setDepartments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDepartmentId === id) setSelectedDepartmentId(null);
  };

  const selectDepartment = (id: string | null) => setSelectedDepartmentId(id);

  return (
    <AdminContext.Provider
      value={{
        doctors,
        selectedDoctorId,
        addDoctor,
        updateDoctor,
        deactivateDoctor,
        removeDoctor,
        selectDoctor,
        departments,
        selectedDepartmentId,
        addDepartment,
        updateDepartment,
        removeDepartment,
        selectDepartment,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin(): AdminContextValue {
  const ctx = useContext(AdminContext);
  if (!ctx) throw new Error('useAdmin must be used inside AdminProvider');
  return ctx;
}
