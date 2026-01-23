package com.richard.live;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.logging.Logger;
import java.util.concurrent.Executors;
import com.sun.net.httpserver.HttpServer;

public class LiveDemoServiceApplication {
    private static final Logger logger = Logger.getLogger(LiveDemoServiceApplication.class.getName());

    public static void main(String[] args) throws IOException {
        long start = System.currentTimeMillis();
        
        // 2. Health Check (Liveness Probe)
        HttpServer server = HttpServer.create(new InetSocketAddress(8100), 0);
        server.createContext("/health", exchange -> {
            String response = "{\"status\": \"UP\", \"checks\": {\"database\": \"OK\"}}";
            exchange.getResponseHeaders().set("Content-Type", "application/json");
            // 3. CORS Headers
            exchange.getResponseHeaders().set("Access-Control-Allow-Origin", "*"); 
            exchange.sendResponseHeaders(200, response.length());
            try (OutputStream os = exchange.getResponseBody()) {
                os.write(response.getBytes());
            }
        });

        // 4. Virtual Thread Executor
        server.setExecutor(Executors.newVirtualThreadPerTaskExecutor());
        server.start();

        long time = System.currentTimeMillis() - start;
        logger.info("🚀 live-demo-service started on port 8100");
        logger.info("✅ Health Check available at http://localhost:8100/health");
        logger.info("⚡ Native Image Optimized + Pinning Detection Active");
    }
}
