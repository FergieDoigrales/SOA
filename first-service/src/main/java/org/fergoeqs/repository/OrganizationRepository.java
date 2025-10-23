package org.fergoeqs.repository;

import org.fergoeqs.model.Organization;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OrganizationRepository extends JpaRepository<Organization, Long>, JpaSpecificationExecutor<Organization> {

    Optional<Organization> findFirstByPostalAddressStreet(String street);

    @Query("SELECT COUNT(o) FROM Organization o WHERE o.postalAddress.street < :street")
    long countByPostalAddressStreetLessThan(@Param("street") String street);

    @Query("SELECT o.fullName, COUNT(o) FROM Organization o GROUP BY o.fullName")
    List<Object[]> countOrganizationsByFullName();

    boolean existsByFullName(String fullName);

    Optional<Organization> findByFullName(String fullName);
}