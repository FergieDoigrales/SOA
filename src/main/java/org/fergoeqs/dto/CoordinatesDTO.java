package org.fergoeqs.dto;

import jakarta.validation.constraints.NotNull;

public record CoordinatesDTO(
        @NotNull Double x,
        @NotNull Float y
) {}