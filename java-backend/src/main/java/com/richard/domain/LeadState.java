package com.richard.domain;

import java.time.Instant;

/**
 * AntiGravity Tipado Expresivo: Sealed Interfaces para un dominio cerrado y seguro.
 * Elimina la necesidad de validaciones manuales de "instanceof" pesadas.
 */
public sealed

interface LeadState
permits 
    LeadState.New,LeadState.Qualified,LeadState.Converted,LeadState.Lost
{

    record New(String source, Instant timestamp) implements LeadState {}

    record Qualified(int score, String assignedAgent) implements LeadState {}

    record Converted(String saleId, double amount) implements LeadState {}

    record Lost(String reason, Instant closedAt) implements LeadState {}
}
