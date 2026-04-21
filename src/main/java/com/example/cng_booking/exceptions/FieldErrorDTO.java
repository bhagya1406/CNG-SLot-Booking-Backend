package com.example.cng_booking.exceptions;

public record FieldErrorDTO(String field, Object rejectedValue, String message) {
}
