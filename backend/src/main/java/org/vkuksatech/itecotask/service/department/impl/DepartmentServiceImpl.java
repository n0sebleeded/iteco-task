package org.vkuksatech.itecotask.service.department.impl;

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.vkuksatech.itecotask.domain.department.Department;
import org.vkuksatech.itecotask.repository.department.DepartmentRepository;
import org.vkuksatech.itecotask.service.department.DepartmentService;
import org.vkuksatech.itecotask.utils.DepartmentUtils;
import org.vkuksatech.itecotask.web.requests.department.DepartmentCreateRequest;
import org.vkuksatech.itecotask.web.responses.DepartmentResponse;

import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentServiceImpl implements DepartmentService {
    private final DepartmentRepository departmentRepository;

    @Override
    public void create(DepartmentCreateRequest request) {
        /*
         * We get the path to the created division,
         * it should not contain spaces. For example:
         * TopDep.SubDep.SubSubDepNameWithoutSpaces
         */
        String createdPath;
        if(request.parentId() == null){
            createdPath = request.name();
        } else {
            Department parentDepartment = departmentRepository
                    .findById(request.parentId())
                    .orElseThrow(
                            () -> new IllegalArgumentException("Department not found")
                    );

            createdPath = parentDepartment.getPath()
                    .concat("." + request.name()
                            .replace(" ", "")
                    );
        }

        Department createdDepartment = request.toDomain(createdPath);

        departmentRepository.saveDepartment(
                createdDepartment.getCreatedAt(),
                createdDepartment.getDisbandedAt(),
                createdDepartment.getName(),
                createdDepartment.getPath()
        );
    }

    @Override
    public void disband(Long departmentId) {
        Department departmentToDelete = departmentRepository
                .findById(departmentId)
                .orElseThrow();

        departmentRepository.disbandByPath(
                departmentToDelete.getPath()
        );
    }

    @Override
    public List<DepartmentResponse> find(Long departmentParentId) {
        Department parentDepartment = departmentRepository
                .findById(departmentParentId)
                .orElseThrow();

        return DepartmentUtils.toDepartmentResponse(
                departmentRepository.findAllByPath(
                        parentDepartment.getPath()
                )
        );
    }

    @Override
    public List<DepartmentResponse> find() {
        return DepartmentUtils.toDepartmentResponse(
                departmentRepository.findAllDepartmentsTree(
                        LocalDate.now()
                )
        );
    }

    @Override
    public List<DepartmentResponse> findByDate(LocalDate startDate) {
        return DepartmentUtils.toDepartmentResponse(
                departmentRepository.findAllDepartmentsTree(startDate)
        );
    }
}
