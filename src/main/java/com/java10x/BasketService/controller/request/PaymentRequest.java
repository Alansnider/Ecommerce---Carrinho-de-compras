package com.java10x.BasketService.controller.request;
import com.java10x.BasketService.entity.PaymentMethod;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class PaymentRequest {
    private PaymentMethod paymentMethod;
}