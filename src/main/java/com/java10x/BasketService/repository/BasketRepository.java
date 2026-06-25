package com.java10x.BasketService.repository;
import com.java10x.BasketService.entity.Basket;
import com.java10x.BasketService.entity.Status;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;
public interface BasketRepository extends MongoRepository<Basket, String> {
    Optional<Basket> findByClientAndStatus(Long client, Status status);
}