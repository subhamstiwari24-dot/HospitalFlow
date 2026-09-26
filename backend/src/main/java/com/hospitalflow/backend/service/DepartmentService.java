package com.hospitalflow.backend.service;

import com.hospitalflow.backend.entity.Department;
import com.hospitalflow.backend.repository.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public List<Department> getDepartmentsByHospital(Long hospitalId) {
        return departmentRepository.findByHospital_Id(hospitalId);
    }

    public Optional<Department> getDepartmentById(Long id) {
        return departmentRepository.findById(id);
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }

    public Optional<Department> updateDepartment(Long id, Department updatedDepartment) {
        return departmentRepository.findById(id).map(existingDepartment -> {

            existingDepartment.setName(updatedDepartment.getName());
            existingDepartment.setHead(updatedDepartment.getHead());
            existingDepartment.setRooms(updatedDepartment.getRooms());
            existingDepartment.setStatus(updatedDepartment.getStatus());

            if (updatedDepartment.getHospital() != null) {
                existingDepartment.setHospital(updatedDepartment.getHospital());
            }

            return departmentRepository.save(existingDepartment);
        });
    }

    public boolean deleteDepartment(Long id) {
        if (!departmentRepository.existsById(id)) {
            return false;
        }

        departmentRepository.deleteById(id);
        return true;
    }
}