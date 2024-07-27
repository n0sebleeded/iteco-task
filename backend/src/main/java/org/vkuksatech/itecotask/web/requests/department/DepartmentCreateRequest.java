package org.vkuksatech.itecotask.web.requests.department;

import org.vkuksatech.itecotask.domain.department.Department;

import java.time.LocalDate;

public record DepartmentCreateRequest(
        String name,
        Long parentId
){
    public Department toDomain(String createdPath){
        return Department.builder()
                .id(null)
                .name(name)
                .path(createdPath)
                .createdAt(LocalDate.now())
                .disbandedAt(null)
                .build();
    }
}
