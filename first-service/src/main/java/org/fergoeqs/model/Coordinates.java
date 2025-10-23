package org.fergoeqs.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "coordinates")
public class Coordinates {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotNull
    @Column(name = "x_coordinate")
    private Double x;

    @NotNull
    @Column(name = "y_coordinate")
    private Float y;

    public Coordinates() {}

    public Coordinates(Double x, Float y) {
        this.x = x;
        this.y = y;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Double getX() { return x; }
    public void setX(Double x) { this.x = x; }

    public Float getY() { return y; }
    public void setY(Float y) { this.y = y; }
}