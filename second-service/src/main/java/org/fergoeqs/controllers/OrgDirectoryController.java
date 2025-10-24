package org.fergoeqs.controllers;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/orgdirectory")
@RequiredArgsConstructor
public class OrgDirectoryController {

    private final WebClient webClient;

    @PostMapping("/filter/turnover")
    public Mono<ResponseEntity<?>> filterByTurnover(@RequestBody Map<String, Object> body) {
        Integer min = (Integer) body.get("minAnnualTurnover");
        Integer max = (Integer) body.get("maxAnnualTurnover");
        if (min == null || max == null || min > max) {
            return Mono.just(ResponseEntity.badRequest().body("Invalid turnover range"));
        }

        Map<String, Object> filterBody = Map.of(
                "filters", List.of(Map.of(
                        "field", "annualTurnover",
                        "operator", "between",
                        "value", List.of(min, max)
                )),
                "page", body.getOrDefault("page", 0),
                "size", body.getOrDefault("size", 20)
        );

        return webClient.post()
                .uri("/search")
                .bodyValue(filterBody)
                .retrieve()
                .bodyToMono(Object.class)
                .map(ResponseEntity::ok);
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
