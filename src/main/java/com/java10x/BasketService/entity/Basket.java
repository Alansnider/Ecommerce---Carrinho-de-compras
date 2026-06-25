package com.java10x.BasketService.entity;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.math.BigDecimal;
import java.util.List;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "basket")
public class Basket {
    @Id
    private String id;
    private Long client;
    private BigDecimal totalprice;
    private List<Product> products;
    private Status status;
    @JsonInclude(JsonInclude.Include.NON_NULL)
    private PaymentMethod paymentMethod;
    public void calculateTotalPrice() {
        this.totalprice = products.stream()
                .map(p -> p.getPrice().multiply(BigDecimal.valueOf(p.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}