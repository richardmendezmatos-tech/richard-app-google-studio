package com.richard.service;

import com.richard.domain.LeadState;
import com.richard.events.LeadTransitionEvent;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.trace.Span;
import io.opentelemetry.api.trace.Tracer;
import java.util.logging.Logger;

/**
 * Lógica Fluida & Observable: 2026 Vision.
 * Instrumentación con OpenTelemetry, JFR y Resiliencia nativa.
 */
public class DomainLogicProcessor {
    private static final Logger logger = Logger.getLogger(DomainLogicProcessor.class.getName());
    private static final Tracer tracer = GlobalOpenTelemetry.getTracer("com.richard.automotive");

    @CircuitBreaker(name = "leadProcessor", fallbackMethod = "fallbackLeadStatus")
    public String processLeadStatus(LeadState state) {
        Span span = tracer.spanBuilder("processLeadStatus").startSpan();
        LeadTransitionEvent event = new LeadTransitionEvent();
        event.fromState = state.getClass().getSimpleName();
        event.begin();

        try (var scope = span.makeCurrent()) {
            String result = switch (state) {
                case LeadState.New(var src, var time) -> 
                    "Nuevo lead desde %s recibido en %s. Activando secuencia de contacto.".formatted(src, time);
                
                case LeadState.Qualified(var score, var agent) -> {
                    span.setAttribute("lead.score", score);
                    yield "Lead calificado con %d. Asignado a %s para cierre inmediato.".formatted(score, agent);
                }
                
                case LeadState.Converted(var saleId, var amount) -> {
                    span.setAttribute("sale.id", saleId);
                    yield "VENTA CERRADA! Referencia: %s. Monto: $%.2f. Registrando en CRM.".formatted(saleId, amount);
                }
                
                case LeadState.Lost(var reason, var closedAt) -> {
                    logger.warning("Oportunidad perdida: " + reason);
                    yield "Cerrado sin éxito en %s. Motivo: %s".formatted(closedAt, reason);
                }
            };
            
            event.toState = "processed"; // Simplified for demo
            return result;
        } finally {
            event.commit();
            span.end();
        }
    }

    public String fallbackLeadStatus(LeadState state, Throwable t) {
        logger.severe("Circuit Breaker ACTIVATED: " + t.getMessage());
        return "Servicio de análisis temporalmente en modo offline. Reintentando...";
    }
}
