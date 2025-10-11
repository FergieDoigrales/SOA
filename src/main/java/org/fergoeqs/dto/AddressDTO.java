package org.fergoeqs.dto;

import jakarta.validation.constraints.NotNull;

public record AddressDTO(
        @NotNull String street
) {}