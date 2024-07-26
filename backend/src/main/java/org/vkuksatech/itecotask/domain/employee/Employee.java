package org.vkuksatech.itecotask.domain.employee;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.vkuksatech.itecotask.domain.department.Department;

import java.time.LocalDate;

/**
 * Represents an employee within an organization.
 */
@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String surname;
    private String patronymic;

    /**
     * The ID of the {@link Department} in which the employee is either currently
     * working or worked before he was fired.
     */
    private Long departmentId;

    private LocalDate hiredAt;

    /**
     * If the employee has not been fired yet, this field has the value NULL
     */
    private LocalDate firedAt;

    /**
     * Changes the department of the employee.
     *
     * @param newDepartmentId The new {@link Department} identifier.
     * @return A new Employee instance with the updated department.
     */
    public Employee changeDepartment(Long newDepartmentId) {
        return Employee.builder()
                .id(this.id)
                .name(this.name)
                .surname(this.surname)
                .patronymic(this.patronymic)
                .hiredAt(this.hiredAt)
                .departmentId(newDepartmentId)
                .build();
    }

    /**
     * Dismisses an employee.
     * @return A new Employee instance with the firedAt date.
     */
    public Employee dismiss() {
        return Employee.builder()
                .id(this.id)
                .name(this.name)
                .surname(this.surname)
                .patronymic(this.patronymic)
                .hiredAt(this.hiredAt)
                .departmentId(departmentId)
                .firedAt(LocalDate.now())
                .build();
    }
}
