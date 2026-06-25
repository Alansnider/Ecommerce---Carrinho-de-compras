package com.java10x.BasketService.controller.request;
import lombok.Builder;
@Builder
public record ProductRequest(Long id, Integer quantity) {}