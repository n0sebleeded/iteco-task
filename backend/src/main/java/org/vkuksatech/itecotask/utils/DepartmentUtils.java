package org.vkuksatech.itecotask.utils;

import org.vkuksatech.itecotask.domain.department.Department;
import org.vkuksatech.itecotask.web.responses.DepartmentResponse;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

public class DepartmentUtils {
    public static List<DepartmentResponse> toDepartmentResponse(
            Collection<Department> departments
    ) {
        // Build a map from path to Department
        Map<String, Department> pathToDepartmentMap = departments.stream()
                .collect(Collectors.toMap(Department::getPath, dept -> dept));

        // Build the hierarchical structure
        Map<Long, DepartmentResponse> idToResponseMap = new HashMap<>();
        for (Department dept : departments) {
            DepartmentResponse response = new DepartmentResponse(
                    dept.getId(),
                    dept.getName(),
                    new ArrayList<>()
            );
            idToResponseMap.put(dept.getId(), response);
        }

        List<DepartmentResponse> rootDepartments = new ArrayList<>();

        for (Department dept : departments) {
            DepartmentResponse response = idToResponseMap.get(dept.getId());

            // If department has a parent, add this department to its parent's child list
            if (dept.getPath() != null && dept.getPath().contains(".")) {
                String parentPath = dept.getPath().substring(0, dept.getPath().lastIndexOf('.'));
                Department parentDept = pathToDepartmentMap.get(parentPath);

                if (parentDept != null) {
                    DepartmentResponse parentResponse = idToResponseMap.get(parentDept.getId());
                    parentResponse.childs().add(response);
                }
            } else {
                // Root department
                rootDepartments.add(response);
            }
        }

        return rootDepartments;
    }
}
