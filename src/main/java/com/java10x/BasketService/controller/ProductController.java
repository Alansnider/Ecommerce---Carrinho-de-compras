package com.java10x.BasketService.controller;
import com.java10x.BasketService.client.response.ProductResponse.PlatziProductResponse;
import com.java10x.BasketService.service.ProductService;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/products")
public class ProductController {
    private final ProductService productService;
    public ProductController(ProductService productService) {
        this.productService = productService;
    }
    @GetMapping
    public List<PlatziProductResponse> getProducts() {
        return productService.getAllProducts();
    }
    @GetMapping("/{id}")
    public PlatziProductResponse getProduct(@PathVariable Long id) {
        return productService.getProductById(id);
    }
}