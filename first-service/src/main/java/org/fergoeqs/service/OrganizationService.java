package org.fergoeqs.service;

import org.fergoeqs.dto.*;
import org.fergoeqs.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.Map;

public interface OrganizationService {

    OrganizationResponseDTO createOrganization(OrganizationRequestDTO organizationDTO);

    OrganizationResponseDTO getOrganizationById(Long id);

    OrganizationResponseDTO updateOrganization(Long id, OrganizationRequestDTO organizationDTO);

    void deleteOrganization(Long id);

    void deleteOrganizationByAddress(String street);

    Map<String, Long> groupOrganizationsByFullName();

    Long countOrganizationsByAddressLessThan(String street);

    Page<OrganizationResponseDTO> searchOrganizations(Specification<Organization> spec, Pageable pageable);

    boolean existsByFullName(String fullName);

    PaginatedResponseDTO searchOrganizationsWithSorting(FilterRequestDTO filterRequest);
}