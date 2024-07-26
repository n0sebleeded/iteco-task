package org.vkuksatech.itecotask.web.responses;

import java.util.List;

public record DepartmentResponse(
        Long id,
        String name,
        List<DepartmentResponse> childs
) { }
