package org.fergoeqs.dto;

import java.util.List;

public record PaginatedResponseDTO(
        List<OrganizationResponseDTO> organizations,
        Integer totalPages,
        Long totalElements,
        Integer page,
        Integer size
) {}
