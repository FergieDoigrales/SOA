package org.fergoeqs.dto;


import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import org.fergoeqs.model.OrganizationType;

public record OrganizationRequestDTO(
        @NotBlank String name,
        @NotNull CoordinatesDTO coordinates,
        @Min(1) Integer annualTurnover,
        @NotBlank String fullName,
        OrganizationType type,
        @NotNull AddressDTO postalAddress
) {}