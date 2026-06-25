package com.java10x.BasketService.client;
import com.java10x.BasketService.client.response.ProductResponse.PlatziProductResponse;
import com.java10x.BasketService.excepiton.CustomErrorDecoder;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import java.util.List;
@FeignClient(name = "product-client", url = "${basket.client.platzi}", configuration = {CustomErrorDecoder.class})
public interface ProductClient {
    @GetMapping("products")
    List<PlatziProductResponse> getAllProducts();
    @GetMapping("products/{id}")
    PlatziProductResponse getProductById(@PathVariable Long id);
}