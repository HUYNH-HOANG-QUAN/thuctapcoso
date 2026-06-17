package com.doan.ProFit.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleResourceNotFound(ResourceNotFoundException ex) {
        return buildErrorResponse(HttpStatus.NOT_FOUND, ex.getMessage());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException ex) {
        return buildErrorResponse(HttpStatus.BAD_REQUEST, ex.getMessage());
    }

    @ExceptionHandler(org.springframework.dao.DataAccessException.class)
    public ResponseEntity<Map<String, Object>> handleDatabaseException(
            org.springframework.dao.DataAccessException ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Lỗi cơ sở dữ liệu: " + ex.getMostSpecificCause().getMessage());
    }

    @ExceptionHandler(org.hibernate.LazyInitializationException.class)
    public ResponseEntity<Map<String, Object>> handleLazyInitialization(
            org.hibernate.LazyInitializationException ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Lỗi khởi tạo dữ liệu. Vui lòng thử lại.");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGenericException(Exception ex) {
        return buildErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR,
                "Đã xảy ra lỗi: " + ex.getMessage());
    }

    private ResponseEntity<Map<String, Object>> buildErrorResponse(HttpStatus status, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
