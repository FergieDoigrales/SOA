package org.fergoeqs.specification;

import org.fergoeqs.dto.FilterConditionDTO;
import org.fergoeqs.dto.FilterRequestDTO;
import org.fergoeqs.model.Organization;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SpecificationBuilder {

    public Specification<Organization> buildSpecification(FilterRequestDTO filterRequest) {
        if (filterRequest.filters() == null || filterRequest.filters().isEmpty()) {
            return Specification.where(null);
        }

        List<FilterConditionDTO> filters = filterRequest.filters();
        Specification<Organization> spec = Specification.where(null);

        for (FilterConditionDTO filter : filters) {
            Specification<Organization> conditionSpec = OrganizationSpecifications.withFilter(
                    filter.field(),
                    filter.operator(),
                    filter.value()
            );
            spec = spec.and(conditionSpec);
        }

        return spec;
    }
}