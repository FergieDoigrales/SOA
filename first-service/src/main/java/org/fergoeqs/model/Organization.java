package org.fergoeqs.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "organizations")
public class Organization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank(message = "Name cannot be null or empty")
    @Column(name = "name", nullable = false)
    private String name;

    @NotNull(message = "Coordinates cannot be null")
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "coordinates_id", nullable = false)
    private Coordinates coordinates;

    @Min(value = 1, message = "Annual turnover must be greater than 0")
    @Column(name = "annual_turnover")
    private Integer annualTurnover;

    @NotBlank(message = "Full name cannot be null or empty")
    @Column(name = "full_name", nullable = false, unique = true)
    private String fullName;

    @Enumerated(EnumType.STRING)
    @Column(name = "type")
    private OrganizationType type;

    @NotNull(message = "Postal address cannot be null")
    @ManyToOne(cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JoinColumn(name = "address_id", nullable = false)
    private Address postalAddress;

    @Column(name = "creation_date", nullable = false, updatable = false)
    private LocalDateTime creationDate;

    public Organization() {
        this.creationDate = LocalDateTime.now();
    }

    public Organization(String name, Coordinates coordinates, String fullName, Address postalAddress) {
        this();
        this.name = name;
        this.coordinates = coordinates;
        this.fullName = fullName;
        this.postalAddress = postalAddress;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public Coordinates getCoordinates() { return coordinates; }
    public void setCoordinates(Coordinates coordinates) { this.coordinates = coordinates; }

    public Integer getAnnualTurnover() { return annualTurnover; }
    public void setAnnualTurnover(Integer annualTurnover) { this.annualTurnover = annualTurnover; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public OrganizationType getType() { return type; }
    public void setType(OrganizationType type) { this.type = type; }

    public Address getPostalAddress() { return postalAddress; }
    public void setPostalAddress(Address postalAddress) { this.postalAddress = postalAddress; }

    public LocalDateTime getCreationDate() { return creationDate; }
    public void setCreationDate(LocalDateTime creationDate) { this.creationDate = creationDate; }
}