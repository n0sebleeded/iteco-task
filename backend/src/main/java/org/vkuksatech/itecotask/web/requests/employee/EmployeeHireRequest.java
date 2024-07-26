package org.vkuksatech.itecotask.web.requests.employee;

import org.vkuksatech.itecotask.domain.employee.Employee;

public record EmployeeHireRequest(
         String name,
         String surname,
         String patronymic,
         Long departmentId
){
    public Employee toDomain(){
        return Employee.builder()
                .id(null)
                .name(this.name)
                .surname(this.surname)
                .patronymic(this.patronymic)
                .departmentId(this.departmentId)
                .build();
    }
}
