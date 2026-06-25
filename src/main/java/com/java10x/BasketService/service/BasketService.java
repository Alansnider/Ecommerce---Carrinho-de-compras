package com.java10x.BasketService.service;
import com.java10x.BasketService.client.response.ProductResponse.PlatziProductResponse;
import com.java10x.BasketService.controller.request.BasketRequest;
import com.java10x.BasketService.controller.request.ProductRequest;
import com.java10x.BasketService.entity.Basket;
import com.java10x.BasketService.entity.PaymentMethod;
import com.java10x.BasketService.entity.Product;
import com.java10x.BasketService.entity.Status;
import com.java10x.BasketService.excepiton.BusinessEsxception;
import com.java10x.BasketService.excepiton.DataNotFoundException;
import com.java10x.BasketService.repository.BasketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
@Service
@RequiredArgsConstructor
public class BasketService {
    private final BasketRepository basketRepository;
    private final ProductService productService;
    public Basket getBasketById(String id) {
        return basketRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Basket Not Found"));
    }
    public Basket createBasket(BasketRequest basketRequest) {
        basketRepository.findByClientAndStatus(basketRequest.id(), Status.OPEN)
                .ifPresent(basket -> { throw new BusinessEsxception("Basket already exists"); });
        List<Product> products = getProducts(basketRequest);
        Basket basket = Basket.builder()
                .client(basketRequest.id()).status(Status.OPEN).products(products).build();
        basket.calculateTotalPrice();
        return basketRepository.save(basket);
    }
    public Basket update(String id, BasketRequest basketRequest) {
        basketRepository.findById(id)
                .orElseThrow(() -> new DataNotFoundException("Basket not found"));
        List<Product> products = getProducts(basketRequest);
        Basket basket = Basket.builder()
                .id(id).client(basketRequest.id()).status(Status.OPEN).products(products).build();
        basket.calculateTotalPrice();
        return basketRepository.save(basket);
    }
    public Basket payBasket(String basketId, PaymentMethod paymentMethod) {
        Basket basket = getBasketById(basketId);
        basket.setPaymentMethod(paymentMethod);
        return basketRepository.save(basket);
    }
    public void deleteBasket(String basketId) { basketRepository.deleteById(basketId); }
    private List<Product> getProducts(BasketRequest basketRequest) {
        List<Product> products = new ArrayList<>();
        for (ProductRequest productRequest : basketRequest.products()) {
            PlatziProductResponse r = productService.getProductById(productRequest.id());
            products.add(Product.builder()
                    .id(r.id()).title(r.title())
                    .price(BigDecimal.valueOf(r.price()))
                    .quantity(productRequest.quantity()).build());
        }
        return products;
    }
}