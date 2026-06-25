package com.java10x.BasketService.client.response.ProductResponse;
import java.io.Serializable;
public record PlatziProductResponse(Long id, String title, double price) implements Serializable {}