package com.java10x.BasketService.service;
import com.java10x.BasketService.client.ProductClient;
import com.java10x.BasketService.client.response.ProductResponse.PlatziProductResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import java.util.List;
@Slf4j
@Service
@RequiredArgsConstructor
public class ProductService {
    private final ProductClient productClient;
    @Cacheable(value = "products")
    public List<PlatziProductResponse> getAllProducts() {
        log.info("Getting all products");
        return productClient.getAllProducts();
    }
    @Cacheable(value = "product", key = "#productId")
    public PlatziProductResponse getProductById(Long productId) {
        log.info("Getting product by id {}", productId);
        return productClient.getProductById(productId);
    }
}