package com.richard.domain;

import java.util.List;
import java.util.Optional;

/**
 * Zero Boilerplate: Sustitución de clases tradicionales por Records.
 * Sin constructores manuales, getters, equals o hashCode. Java puro y ligero.
 */
public record VehicleRecord(String id,String make,String model,int year,double price,Optional<String>description,List<String>features){
// Lógica dinámica compacta
public String fullName(){return"%s %s (%d)".formatted(make,model,year);}}
