package org.fergoeqs.specification;

import org.fergoeqs.model.Organization;
import org.fergoeqs.model.OrganizationType;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Path;
import jakarta.persistence.criteria.Root;
import java.time.LocalDateTime;
import java.util.List;

public class OrganizationSpecifications {

    public static Specification<Organization> withFilter(String field, String operator, Object value) {
        return (Root<Organization> root, CriteriaQuery<?> query, CriteriaBuilder cb) -> {
            try {
                Path<?> fieldPath = getPath(root, field);
                Class<?> fieldType = fieldPath.getJavaType();

                switch (operator) {
                    case "eq":
                        return cb.equal(fieldPath, convertValue(value, fieldType));
                    case "ne":
                        return cb.notEqual(fieldPath, convertValue(value, fieldType));
                    case "gt":
                        if (Comparable.class.isAssignableFrom(fieldType)) {
                            return cb.greaterThan((Path<Comparable>) fieldPath, (Comparable) convertValue(value, fieldType));
                        }
                        throw new IllegalArgumentException("Field " + field + " is not comparable for gt operation");
                    case "gte":
                        if (Comparable.class.isAssignableFrom(fieldType)) {
                            return cb.greaterThanOrEqualTo((Path<Comparable>) fieldPath, (Comparable) convertValue(value, fieldType));
                        }
                        throw new IllegalArgumentException("Field " + field + " is not comparable for gte operation");
                    case "lt":
                        if (Comparable.class.isAssignableFrom(fieldType)) {
                            return cb.lessThan((Path<Comparable>) fieldPath, (Comparable) convertValue(value, fieldType));
                        }
                        throw new IllegalArgumentException("Field " + field + " is not comparable for lt operation");
                    case "lte":
                        if (Comparable.class.isAssignableFrom(fieldType)) {
                            return cb.lessThanOrEqualTo((Path<Comparable>) fieldPath, (Comparable) convertValue(value, fieldType));
                        }
                        throw new IllegalArgumentException("Field " + field + " is not comparable for lte operation");
                    case "like":
                        if (fieldType == String.class) {
                            return cb.like((Path<String>) fieldPath, "%" + value + "%");
                        }
                        throw new IllegalArgumentException("Field " + field + " is not a string for like operation");
                    case "in":
                        CriteriaBuilder.In<Object> inClause = cb.in(fieldPath);
                        List<Object> values = (List<Object>) value;
                        for (Object val : values) {
                            inClause.value(convertValue(val, fieldType));
                        }
                        return inClause;
                    case "between":
                        List<Object> range = (List<Object>) value;
                        if (range.size() != 2) {
                            throw new IllegalArgumentException("Between operator requires two values");
                        }
                        if (Comparable.class.isAssignableFrom(fieldType)) {
                            return cb.between((Path<Comparable>) fieldPath,
                                    (Comparable) convertValue(range.get(0), fieldType),
                                    (Comparable) convertValue(range.get(1), fieldType));
                        }
                        throw new IllegalArgumentException("Field " + field + " is not comparable for between operation");
                    default:
                        throw new IllegalArgumentException("Unsupported operator: " + operator);
                }
            } catch (Exception e) {
                throw new IllegalArgumentException("Invalid filter condition: " + field + " " + operator + " " + value, e);
            }
        };
    }

    private static Object convertValue(Object value, Class<?> targetType) {
        if (value == null) {
            return null;
        }

        if (targetType.isAssignableFrom(value.getClass())) {
            return value;
        }

        if (targetType == String.class) {
            return value.toString();
        } else if (targetType == Integer.class || targetType == int.class) {
            if (value instanceof Number) {
                return ((Number) value).intValue();
            }
            return Integer.valueOf(value.toString());
        } else if (targetType == Long.class || targetType == long.class) {
            if (value instanceof Number) {
                return ((Number) value).longValue();
            }
            return Long.valueOf(value.toString());
        } else if (targetType == Double.class || targetType == double.class) {
            if (value instanceof Number) {
                return ((Number) value).doubleValue();
            }
            return Double.valueOf(value.toString());
        } else if (targetType == Float.class || targetType == float.class) {
            if (value instanceof Number) {
                return ((Number) value).floatValue();
            }
            return Float.valueOf(value.toString());
        } else if (targetType == LocalDateTime.class) {
            return LocalDateTime.parse(value.toString());
        } else if (targetType == OrganizationType.class) {
            return OrganizationType.valueOf(value.toString());
        } else {
            throw new IllegalArgumentException("Unsupported target type: " + targetType);
        }
    }

    private static Path<?> getPath(Root<Organization> root, String field) {
        String[] parts = field.split("\\.");
        Path<?> path = root.get(parts[0]);
        for (int i = 1; i < parts.length; i++) {
            path = path.get(parts[i]);
        }
        return path;
    }
}