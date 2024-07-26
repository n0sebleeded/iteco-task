package org.vkuksatech.itecotask.service.employee.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.vkuksatech.itecotask.domain.employee.Employee;
import org.vkuksatech.itecotask.repository.employee.EmployeeRepository;
import org.vkuksatech.itecotask.service.employee.EmployeeService;
import org.vkuksatech.itecotask.web.requests.employee.EmployeeHireRequest;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;

    @Override
    public void hire(EmployeeHireRequest request) {
        employeeRepository.save(
                request.toDomain()
        );
    }

    @Override
    public void dismiss(Long employeeId) {
        employeeRepository.save(
                employeeRepository.findById(employeeId)
                        .orElseThrow()
                        .dismiss()
        );
    }

    @Override
    public void transfer(
            Long employeeId,
            Long newDepartmentId
    ) {
        Employee employeeToTransfer = employeeRepository
                .findById(employeeId)
                .orElseThrow();

        employeeRepository.save(
                employeeToTransfer
                        .changeDepartment(newDepartmentId)
        );
    }

    @Override
    public Page<Employee> findAll(
            Long departmentId,
            Pageable pageable
    ) {
        /**
         * For methods, LocalDate.now() is specified
         * to get employees who are still working and have not been fired.
         */
        return employeeRepository.findByDepartmentId(
                departmentId,
                LocalDate.now(),
                LocalDate.now(),
                pageable
        );
    }
    @Override
    public Page<Employee> findAllByDate(
            Long departmentId,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable
    ) {
        return employeeRepository.findByDepartmentId(
                departmentId,
                startDate,
                endDate,
                pageable
        );
    }


    @Override
    public Page<Employee> findAll(Pageable pageable) {
        return employeeRepository.findAll(pageable);
    }

    @Override
    public Page<Employee> findAllByDate(
            Pageable pageable,
            LocalDate startDate,
            LocalDate endDate
    ) {
        return employeeRepository.findAllByStartDateAndEndDate(
                pageable,
                startDate,
                endDate
        );
    }


    @Override
    public Employee find(Long employeeId) {
        return employeeRepository.findById(employeeId)
                .orElse(null);
    }
}
