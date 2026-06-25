package com.java10x.BasketService.excepiton;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestControllerAdvice;
@RestControllerAdvice
public class ControllerAdvice {
    @ExceptionHandler(DataNotFoundException.class)
    @ResponseStatus(HttpStatus.NOT_FOUND)
    public String handleException(DataNotFoundException e) { return e.getMessage(); }
    @ExceptionHandler(BusinessEsxception.class)
    @ResponseStatus(HttpStatus.BAD_REQUEST)
    public String businesshandleException(BusinessEsxception exc) { return exc.getMessage(); }
}