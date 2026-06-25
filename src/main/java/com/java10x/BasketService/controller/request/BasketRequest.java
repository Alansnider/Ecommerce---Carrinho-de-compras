package com.java10x.BasketService.controller.request;
import java.util.List;
public record BasketRequest(Long id, List<ProductRequest> products) {}