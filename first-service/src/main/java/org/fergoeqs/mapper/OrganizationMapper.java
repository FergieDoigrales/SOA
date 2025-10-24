package org.fergoeqs.mapper;


import org.fergoeqs.dto.AddressDTO;
import org.fergoeqs.dto.CoordinatesDTO;
import org.fergoeqs.dto.OrganizationRequestDTO;
import org.fergoeqs.dto.OrganizationResponseDTO;
import org.fergoeqs.model.Address;
import org.fergoeqs.model.Coordinates;
import org.fergoeqs.model.Organization;
import org.springframework.stereotype.Component;

@Component
public class OrganizationMapper {

    public Organization toEntity(OrganizationRequestDTO dto) {
        Organization organization = new Organization();
        organization.setName(dto.name());
        organization.setCoordinates(toCoordinatesEntity(dto.coordinates()));
        organization.setAnnualTurnover(dto.annualTurnover());
        organization.setFullName(dto.fullName());
        organization.setType(dto.type());
        organization.setPostalAddress(toAddressEntity(dto.postalAddress()));
        return organization;
    }

    public OrganizationResponseDTO toResponseDTO(Organization organization) {
        return new OrganizationResponseDTO(
                organization.getId(),
                organization.getName(),
                toCoordinatesDTO(organization.getCoordinates()),
                organization.getAnnualTurnover(),
                organization.getFullName(),
                organization.getType(),
                toAddressDTO(organization.getPostalAddress()),
                organization.getCreationDate()
        );
    }

    public Coordinates toCoordinatesEntity(CoordinatesDTO dto) {
        return new Coordinates(dto.x(), dto.y());
    }

    public CoordinatesDTO toCoordinatesDTO(Coordinates coordinates) {
        return new CoordinatesDTO(coordinates.getX(), coordinates.getY());
    }

    public Address toAddressEntity(AddressDTO dto) {
        return new Address(dto.street());
    }

    public AddressDTO toAddressDTO(Address address) {
        return new AddressDTO(address.getStreet());
    }
}