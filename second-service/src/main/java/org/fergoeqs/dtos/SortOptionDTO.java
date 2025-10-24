package org.fergoeqs.dtos;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SortOptionDTO(
        @NotNull String field,
        String direction,
        @Min(1) Integer priority
) {}