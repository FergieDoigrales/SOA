package org.fergoeqs.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record SortOptionDTO(
        @NotNull String field,
        String direction,
        @Min(1) Integer priority
) {}