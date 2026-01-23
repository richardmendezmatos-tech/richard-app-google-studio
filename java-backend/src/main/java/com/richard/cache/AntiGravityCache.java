package com.richard.cache;

import io.opentelemetry.api.GlobalOpenTelemetry;
import io.opentelemetry.api.metrics.LongCounter;
import io.opentelemetry.api.metrics.Meter;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.logging.Logger;

/**
 * Concurrencia Invisible & Observable: Virtual Threads + OTel Metrics.
 * Métricas nativas de 2026 para monitorear el rendimiento de la caché.
 */
public class AntiGravityCache<K, V> {
    private static final Logger logger = Logger.getLogger(AntiGravityCache.class.getName());
    private static final Meter meter = GlobalOpenTelemetry.getMeter("com.richard.cache");
    private static final LongCounter hitCounter = meter.counterBuilder("cache.hits")
            .setDescription("Number of cache hits").build();
    private static final LongCounter missCounter = meter.counterBuilder("cache.misses")
            .setDescription("Number of cache misses").build();

    private final Map<K, V> storage = new ConcurrentHashMap<>();

    public void put(K key, V value) {
        // Usamos un hilo virtual para operaciones asíncronas sin impacto en latencia
        try (var executor = Executors.newVirtualThreadPerTaskExecutor()) {
            executor.submit(() -> {
                storage.put(key, value);
                logger.info("Cache entry added: " + key + " (via Virtual Thread)");
            });
        }
    }

    public V get(K key) {
        V value = storage.get(key);
        if (value != null) {
            hitCounter.add(1);
        } else {
            missCounter.add(1);
        }
        return value;
    }

    public void clear() {
        storage.clear();
    }
}
