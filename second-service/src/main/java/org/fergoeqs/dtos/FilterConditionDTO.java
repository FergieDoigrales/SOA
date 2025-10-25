package org.fergoeqs.dtos;


import jakarta.validation.constraints.NotNull;

public record FilterConditionDTO(
        @NotNull String field,
        @NotNull String operator,
        Object value
) {}
