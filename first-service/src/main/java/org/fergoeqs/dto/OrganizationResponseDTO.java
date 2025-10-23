package org.fergoeqs.dto;


import org.fergoeqs.model.OrganizationType;

import java.time.LocalDateTime;

public record OrganizationResponseDTO(
        Long id,
        String name,
        CoordinatesDTO coordinates,
        Integer annualTurnover,
        String fullName,
        OrganizationType type,
        AddressDTO postalAddress,
        LocalDateTime creationDate
) {}