package org.fergoeqs.dto;

import jakarta.validation.constraints.NotNull;

public record AddressRequestDTO(
        @NotNull String street
) {}