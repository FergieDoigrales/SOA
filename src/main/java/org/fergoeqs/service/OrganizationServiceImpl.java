package org.fergoeqs.service;

import org.fergoeqs.dto.*;
import org.fergoeqs.exception.ResourceNotFoundException;
import org.fergoeqs.mapper.OrganizationMapper;
import org.fergoeqs.model.Organization;
import org.fergoeqs.repository.OrganizationRepository;
import org.fergoeqs.specification.SpecificationBuilder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@Transactional
public class OrganizationServiceImpl implements OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper mapper;
    private final SpecificationBuilder specificationBuilder;

    public OrganizationServiceImpl(OrganizationRepository organizationRepository,
                                   OrganizationMapper mapper,
                                   SpecificationBuilder specificationBuilder) {
        this.organizationRepository = organizationRepository;
        this.mapper = mapper;
        this.specificationBuilder = specificationBuilder;
    }

    @Override
    public OrganizationResponseDTO createOrganization(OrganizationRequestDTO organizationDTO) {
        if (organizationRepository.existsByFullName(organizationDTO.fullName())) {
            throw new IllegalArgumentException("Organization with fullName '" + organizationDTO.fullName() + "' already exists");
        }

        Organization organization = mapper.toEntity(organizationDTO);
        Organization saved = organizationRepository.save(organization);
        return mapper.toResponseDTO(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public OrganizationResponseDTO getOrganizationById(Long id) {
        Organization organization = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));
        return mapper.toResponseDTO(organization);
    }

    @Override
    public OrganizationResponseDTO updateOrganization(Long id, OrganizationRequestDTO organizationDTO) {
        Organization existing = organizationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Organization", id));

        if (!existing.getFullName().equals(organizationDTO.fullName()) &&
                organizationRepository.existsByFullName(organizationDTO.fullName())) {
            throw new IllegalArgumentException("Organization with fullName '" + organizationDTO.fullName() + "' already exists");
        }

        existing.setName(organizationDTO.name());
        existing.setCoordinates(mapper.toCoordinatesEntity(organizationDTO.coordinates()));
        existing.setAnnualTurnover(organizationDTO.annualTurnover());
        existing.setFullName(organizationDTO.fullName());
        existing.setType(organizationDTO.type());
        existing.setPostalAddress(mapper.toAddressEntity(organizationDTO.postalAddress()));

        Organization updated = organizationRepository.save(existing);
        return mapper.toResponseDTO(updated);
    }

    @Override
    public void deleteOrganization(Long id) {
        if (!organizationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Organization", id);
        }
        organizationRepository.deleteById(id);
    }

    @Override
    public void deleteOrganizationByAddress(String street) {
        Organization organization = organizationRepository.findFirstByPostalAddressStreet(street)
                .orElseThrow(() -> new ResourceNotFoundException("No organization found with address: " + street));
        organizationRepository.delete(organization);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Long> groupOrganizationsByFullName() {
        List<Object[]> results = organizationRepository.countOrganizationsByFullName();
        Map<String, Long> resultMap = new HashMap<>();

        for (Object[] result : results) {
            String fullName = (String) result[0];
            Long count = (Long) result[1];
            resultMap.put(fullName, count);
        }

        return resultMap;
    }

    @Override
    @Transactional(readOnly = true)
    public Long countOrganizationsByAddressLessThan(String street) {
        return organizationRepository.countByPostalAddressStreetLessThan(street);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<OrganizationResponseDTO> searchOrganizations(Specification<Organization> spec, Pageable pageable) {
        Page<Organization> organizations = organizationRepository.findAll(spec, pageable);
        return organizations.map(mapper::toResponseDTO);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean existsByFullName(String fullName) {
        return organizationRepository.existsByFullName(fullName);
    }

    public PaginatedResponseDTO searchOrganizationsWithSorting(FilterRequestDTO filterRequest) {
        Specification<Organization> spec = specificationBuilder.buildSpecification(filterRequest);

        Pageable pageable = buildPageable(filterRequest);

        Page<OrganizationResponseDTO> resultPage = searchOrganizations(spec, pageable);

        return new PaginatedResponseDTO(
                resultPage.getContent(),
                resultPage.getTotalPages(),
                resultPage.getTotalElements(),
                resultPage.getNumber(),
                resultPage.getSize()
        );
    }

    private Pageable buildPageable(FilterRequestDTO filterRequest) {
        int page = filterRequest.page() != null ? filterRequest.page() : 0;
        int size = filterRequest.size() != null ? filterRequest.size() : 20;

        if (filterRequest.sort() == null || filterRequest.sort().isEmpty()) {
            return PageRequest.of(page, size);
        }

        List<Sort.Order> orders = filterRequest.sort().stream()
                .map(sortOption -> {
                    Sort.Direction direction = Sort.Direction.fromString(
                            sortOption.direction() != null ? sortOption.direction() : "asc"
                    );
                    return new Sort.Order(direction, sortOption.field());
                })
                .toList();

        return PageRequest.of(page, size, Sort.by(orders));
    }


}