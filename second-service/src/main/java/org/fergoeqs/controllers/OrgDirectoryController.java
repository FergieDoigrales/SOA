package org.fergoeqs.controllers;

import lombok.RequiredArgsConstructor;

import org.fergoeqs.dtos.FilterConditionDTO;
import org.fergoeqs.dtos.FilterRequestDTO;
import org.fergoeqs.dtos.SortOptionDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orgdirectory")
@RequiredArgsConstructor
public class OrgDirectoryController {

    private final WebClient webClient;

    @PostMapping("/filter/turnover")
    public Mono<ResponseEntity<Object>> filterByTurnover(@RequestBody Map<String, Object> body) {

        Integer min = (Integer) body.get("minAnnualTurnover");
        Integer max = (Integer) body.get("maxAnnualTurnover");
        if (min == null || max == null || min > max) {
            return Mono.just(ResponseEntity.badRequest().body("Invalid turnover range"));
        }

        List<Map<String, Object>> additionalFilters =
                (List<Map<String, Object>>) body.getOrDefault("filters", List.of());
        List<FilterConditionDTO> filters = new ArrayList<>();

        for (Map<String, Object> f : additionalFilters) {
            filters.add(new FilterConditionDTO(
                    (String) f.get("field"),
                    (String) f.get("operator"),
                    f.get("value")
            ));
        }

        filters.add(new FilterConditionDTO("annualTurnover", "between", List.of(min, max)));

        List<SortOptionDTO> sort = (List<SortOptionDTO>) body.getOrDefault("sort", List.of());

        Integer page = (Integer) body.getOrDefault("page", 0);
        Integer size = (Integer) body.getOrDefault("size", 20);

        FilterRequestDTO requestDTO = new FilterRequestDTO(filters, sort, page, size);

        return webClient.post()
                .uri("/search")
                .bodyValue(requestDTO)
                .retrieve()
                .bodyToMono(Object.class)
                .map(ResponseEntity::ok)
                .onErrorResume(e ->
                        Mono.just(ResponseEntity.status(500).body("Error calling organization service: " + e.getMessage()))
                );
    }


    @PostMapping("/order")
    public Mono<ResponseEntity<?>> orderOrganizations(@RequestBody Map<String, Object> body) {
        if (!body.containsKey("sort")) {
            return Mono.just(ResponseEntity.badRequest().body("Missing sort criteria"));
        }

        return webClient.post()
                .uri("/search")
                .bodyValue(body)
                .retrieve()
                .bodyToMono(Object.class)
                .map(ResponseEntity::ok);
    }
}
