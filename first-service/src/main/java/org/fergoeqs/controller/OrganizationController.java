package org.fergoeqs.controller;

import org.fergoeqs.dto.*;
import org.fergoeqs.service.OrganizationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/organizations")
public class OrganizationController {

    private final OrganizationService organizationService;

    public OrganizationController(OrganizationService organizationService) {
        this.organizationService = organizationService;
    }

    @PostMapping("/search")
    public ResponseEntity<PaginatedResponseDTO> searchOrganizations(
            @Valid @RequestBody FilterRequestDTO filterRequest) {
        PaginatedResponseDTO response = organizationService.searchOrganizationsWithSorting(filterRequest);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<OrganizationResponseDTO> createOrganization(
            @Valid @RequestBody OrganizationRequestDTO organizationRequest) {
        OrganizationResponseDTO created = organizationService.createOrganization(organizationRequest);
        return ResponseEntity
                .created(URI.create("/organizations/" + created.id()))
                .body(created);
    }

    @GetMapping("/{id}")
    public ResponseEntity<OrganizationResponseDTO> getOrganizationById(@PathVariable Long id) {
        OrganizationResponseDTO organization = organizationService.getOrganizationById(id);
        return ResponseEntity.ok(organization);
    }

    @PutMapping("/{id}")
    public ResponseEntity<OrganizationResponseDTO> updateOrganization(
            @PathVariable Long id,
            @Valid @RequestBody OrganizationRequestDTO organizationRequest) {
        OrganizationResponseDTO updated = organizationService.updateOrganization(id, organizationRequest);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOrganization(@PathVariable Long id) {
        organizationService.deleteOrganization(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/by-address")
    public ResponseEntity<Void> deleteOrganizationByAddress(
            @Valid @RequestBody AddressRequestDTO addressRequest) {
        organizationService.deleteOrganizationByAddress(addressRequest.street());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/group-by-fullname")
    public ResponseEntity<Map<String, Long>> groupOrganizationsByFullName() {
        Map<String, Long> result = organizationService.groupOrganizationsByFullName();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/count-by-address")
    public ResponseEntity<Long> countOrganizationsByAddressLessThan(
            @Valid @RequestBody AddressRequestDTO addressRequest) {
        Long count = organizationService.countOrganizationsByAddressLessThan(addressRequest.street());
        return ResponseEntity.ok(count);
    }
}