# Stage 1: Build the Native Image
FROM ghcr.io/graalvm/native-image-community:21 AS builder

WORKDIR /app

# Copy Maven wrapper and configuration
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
# Resolve dependencies first for caching layers
RUN ./mvnw dependency:go-offline

# Copy source and build
COPY src ./src
RUN ./mvnw -Pnative native:compile

# Stage 2: Create the minimal runtime image
FROM gcr.io/distroless/base-debian12

WORKDIR /

# Copy the native binary from the builder stage
COPY --from=builder /app/target/java-backend-blueprint /app

# Expose port (standard HTTP)
EXPOSE 8080

# Run the native entrypoint
ENTRYPOINT ["/app"]
