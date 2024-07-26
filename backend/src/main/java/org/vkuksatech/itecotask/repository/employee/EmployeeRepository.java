package org.vkuksatech.itecotask.repository.employee;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vkuksatech.itecotask.domain.employee.Employee;


import java.time.LocalDate;

public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    /**
     * Retrieves all employees where the hired date is less than or equal to the specified date,
     * and the fired date is either greater than the specified date or is null.
     *
     * This method executes an SQL query to find employees based on the given conditions:
     *
     * <ul>
     *     <li>The <code>startDate</code> field is less than or equal to the specified date.</li>
     *     <li>The <code>endDate</code> field is either greater than the specified date or is null.</li>
     * </ul>
     *
     * @param pageable pagination information.
     * @param startDate the date used to filter employees by their hired date.
     * @return a page of {@link Employee} entities that match the specified conditions.
     */
    @Query(
            value = "SELECT e FROM Employee e " +
                    "WHERE e.hiredAt >= :startDate " +
                    "AND (e.firedAt > :endDate OR e.firedAt IS NULL)"
    )
    Page<Employee> findAllByStartDateAndEndDate(
            Pageable pageable,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate
    );

    /**
     * Finds all employees with a null department ID with pagination.
     *
     * @param pageable the pagination information.
     * @return a page of fired employees.
     */
    Page<Employee> findByDepartmentIdNull(Pageable pageable);

    /**
     * Finds all employees by department ID with pagination.
     *
     * @param departmentId the department ID.
     * @param pageable the pagination information.
     * @return a page of employees in the specified department.
     */
    @Query(
            value = "SELECT e FROM Employee e " +
                    "WHERE e.hiredAt >= :startDate " +
                    "AND (e.firedAt > :endDate OR e.firedAt IS NULL) " +
                    "AND e.departmentId = :departmentId"
    )
    Page<Employee> findByDepartmentId(
            @Param("departmentId") Long departmentId,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            Pageable pageable
    );
}
