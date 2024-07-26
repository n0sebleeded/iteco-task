package org.vkuksatech.itecotask.service.department;

import org.vkuksatech.itecotask.web.requests.department.DepartmentCreateRequest;
import org.vkuksatech.itecotask.web.responses.DepartmentResponse;

import java.time.LocalDate;
import java.util.List;

public interface DepartmentService {
    void create(DepartmentCreateRequest request);
    void disband(Long departmentId);

    /**
     * This method returns a subtree of the specified parent element.
     */
    List<DepartmentResponse> find(Long departmentParentId);

    /**
     * This method returns a full department tree.
     */
    List<DepartmentResponse> find();

    List<DepartmentResponse> findByDate(LocalDate startDate);
}
