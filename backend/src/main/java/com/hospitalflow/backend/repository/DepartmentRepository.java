package com.hospitalflow.backend.repository;

import com.hospitalflow.backend.entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DepartmentRepository extends JpaRepository<Department, Long> {

    List<Department> findByHospital_Id(Long hospitalId);

}