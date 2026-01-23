FROM ghcr.io/graalvm/native-image-community:21 AS builder
WORKDIR /app
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw dependency:go-offline
COPY src ./src
# Build native image
RUN ./mvnw -Pnative native:compile

FROM gcr.io/distroless/base-debian12
WORKDIR /
COPY --from=builder /app/target/live-demo-service /app
# 4. Thread Pinning Detection in Production
ENV JAVA_TOOL_OPTIONS="-Djdk.tracePinnedThreads=short"
EXPOSE 8100
ENTRYPOINT ["/app"]
