package com.java10x.BasketService.excepiton;
import feign.Response;
import feign.codec.ErrorDecoder;
public class CustomErrorDecoder implements ErrorDecoder {
    @Override
    public Exception decode(String methodKey, Response response) {
        return switch (response.status()) {
            case 404 -> new DataNotFoundException("Product not found");
            case 400 -> new BusinessEsxception("Bad request");
            default -> new Exception("Exception while getting product");
        };
    }
}