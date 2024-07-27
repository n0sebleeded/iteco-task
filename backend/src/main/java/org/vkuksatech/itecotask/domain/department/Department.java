package org.vkuksatech.itecotask.domain.department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

/**
 * The Department class represents a hierarchical structure of departments.
 * Each department can have a parent department and can contain child departments.
 * The hierarchy is represented using a ltree path in PostgreSQL.
 */
@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;

    /**
     * The ltree path representing the hierarchy of the department.
     * This path is used to navigate the tree structure in the database.
     */
    @Column(nullable = false, columnDefinition = "ltree")
    private String path;

    private LocalDate createdAt;

    /**
     * If the department has not been disbanded yet, this field has the value NULL.
     */
    private LocalDate disbandedAt;
}
