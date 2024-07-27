package org.vkuksatech.itecotask.repository.department;

import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.vkuksatech.itecotask.domain.department.Department;

import java.time.LocalDate;
import java.util.Collection;


public interface DepartmentRepository extends JpaRepository<Department, Long> {
    /**
     * Retrieves all department records where the path is within the specified range.
     *
     * This method executes an SQL query that uses the <code>ltree</code> type to work with hierarchical paths.
     * The query selects all departments where the <code>path</code> is contained within the specified <code>pathToSearch</code>.
     *
     * @param pathToSearch the path used to search for departments.
     * Should be in <code>ltree</code> format.
     * @return a collection of {@link Department} entities that match the specified path.
     */
    @Query(
            value = "SELECT * " +
                    "FROM department " +
                    "WHERE path <@ CAST(:pathToSearch AS ltree)",
            nativeQuery = true
    )
    Collection<Department> findAllByPath(
            @Param("pathToSearch")
            String pathToSearch
    );

    /**
     * Updates the disbanded date of all departments where the path is within the specified range.
     *
     * This method executes an SQL query that uses the <code>ltree</code> type to work with hierarchical paths.
     * The query updates the <code>disbandedAt</code> field to the current date for
     * all departments where the <code>path</code> is contained within the specified <code>pathToDelete</code>.
     *
     * @param pathToDelete the path used to identify which departments to update.
     * Should be in <code>ltree</code> format.
     */
    @Modifying
    @Transactional
    @Query(
            value = "UPDATE department SET disbanded_at = CURRENT_DATE " +
                    "WHERE path <@ CAST(:pathToDelete AS ltree)",
            nativeQuery = true
    )
    void disbandByPath(
            @Param("pathToDelete")
            String pathToDelete
    );


    /**
     * Retrieves the hierarchical tree of departments that meet the specified date conditions.
     *
     * This method executes an SQL query to build a complete hierarchy of departments where:
     *
     * <ol>
     *     <li>The department's creation date is greater than or equal to the specified <code>startDate</code>.</li>
     *     <li>The department's disbanded date is either greater than the specified <code>startDate</code> or is null.</li>
     * </ol>
     *
     * @param startDate the date used to filter departments by their creation and disbanded dates.
     * @return a collection of {@link Department} entities representing the hierarchical structure of departments that meet the specified date conditions.
     */
    @Query(value =
            "SELECT *" +
            "FROM department " +
            "WHERE path <@ CAST('' AS ltree) " +
            "AND created_at <= :startDate " +
            "AND (disbanded_at > :startDate OR disbanded_at IS NULL);",
            nativeQuery = true)
    Collection<Department> findAllDepartmentsTree(
            @Param("startDate") LocalDate startDate
    );


    @Modifying
    @Transactional
    @Query(value = "INSERT INTO department (created_at, disbanded_at, name, path) " +
            "VALUES (:createdAt, :disbandedAt, :name, CAST(:path AS ltree))", nativeQuery = true)
    void saveDepartment(@Param("createdAt") LocalDate createdAt,
                        @Param("disbandedAt") LocalDate disbandedAt,
                        @Param("name") String name,
                        @Param("path") String path);
}
