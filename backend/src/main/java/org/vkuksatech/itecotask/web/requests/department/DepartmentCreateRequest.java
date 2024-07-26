package org.vkuksatech.itecotask.web.requests.department;

import org.vkuksatech.itecotask.domain.department.Department;

public record DepartmentCreateRequest(
        String name,
        Long parentId
){
    public Department toDomain(String createdPath){
        return Department.builder()
                .id(null)
                .name(name)
                .path(createdPath)
                .build();
    }
}
