package org.vkuksatech.itecotask.web.controllers.department;

import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.vkuksatech.itecotask.service.department.DepartmentService;
import org.vkuksatech.itecotask.web.requests.department.DepartmentCreateRequest;
import org.vkuksatech.itecotask.web.responses.DepartmentResponse;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/departments")
public class DepartmentController {
    private final DepartmentService departmentService;

    @PostMapping
    public ResponseEntity<?> formDepartment(
            @RequestBody DepartmentCreateRequest request
    ) {
        try{
            departmentService.create(request);
            return ResponseEntity
                    .ok()
                    .build();
        } catch (Exception e){
            return ResponseEntity
                    .badRequest()
                    .body("It was not possible to form a department due to: "
                            + e.getMessage()
                    );
        }
    }

    @DeleteMapping
    public ResponseEntity<?> disbandDepartment(
            @RequestParam Long departmentId
    ) {
        try{
            departmentService.disband(departmentId);
            return ResponseEntity
                    .ok()
                    .build();
        } catch (Exception e){
            return ResponseEntity
                    .badRequest()
                    .body("It was not possible to disband a department due to: "
                            + e.getMessage()
                    );
        }
    }

    @GetMapping
    public ResponseEntity<?> getDepartment(
            @RequestParam(required = false) Long parentDepartmentId,
            @RequestParam(required = false) LocalDate startDate
    ) {
        try {
            if (parentDepartmentId != null) {
                List<DepartmentResponse> departments = departmentService.find(parentDepartmentId);
                return ResponseEntity.ok(departments);
            }

            if (startDate != null) {
                List<DepartmentResponse> departments = departmentService.findByDate(startDate);
                return ResponseEntity.ok(departments);
            }

            // Default case: get all departments
            List<DepartmentResponse> departments = departmentService.find();
            return ResponseEntity.ok(departments);

        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An error occurred: " + e.getMessage());
        }
    }
}
