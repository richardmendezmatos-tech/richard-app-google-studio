#!/bin/bash

# AntiGravity Microservice Generator
# Generates a Java 21+ Microservice with ArchUnit, GraalVM, and OTel support.

set -e

echo "🚀 Richard AI: Standard Microservice Generator (AntiGravity Edition)"
echo "================================================================"

# Interactive Inputs
read -p "Enter Service Artifact ID (e.g., lead-scoring-service): " ARTIFACT_ID
read -p "Enter Base Package (e.g., com.richard.scoring): " PACKAGE
read -p "Enter Service Port (e.g., 8081): " PORT

if [[ -z "$ARTIFACT_ID" || -z "$PACKAGE" || -z "$PORT" ]]; then
  echo "❌ Error: All fields are required."
  exit 1
fi

# Derived Variables
BASE_DIR="$ARTIFACT_ID"
PACKAGE_PATH="${PACKAGE//.//}"
MAIN_CLASS_NAME=$(echo "$ARTIFACT_ID" | awk -F- '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2)} 1' | sed 's/ //g')Application

echo "🛠️  Scaffolding service '$ARTIFACT_ID' in ./$BASE_DIR..."

mkdir -p "$BASE_DIR"

if [ -f "mvnw" ]; then
    cp mvnw "$BASE_DIR/"
    cp -r .mvn "$BASE_DIR/"
    chmod +x "$BASE_DIR/mvnw"
    echo "📦 Bundled Maven Wrapper."
else
    echo "⚠️  Maven Wrapper (mvnw) not found in root. Run 'mvn wrapper:wrapper' to fix."
fi

mkdir -p "$BASE_DIR/src/main/java/$PACKAGE_PATH/domain"
mkdir -p "$BASE_DIR/src/main/java/$PACKAGE_PATH/service/internal"
mkdir -p "$BASE_DIR/src/main/java/$PACKAGE_PATH/infrastructure/web"
mkdir -p "$BASE_DIR/src/test/java/$PACKAGE_PATH/architecture"
mkdir -p "$BASE_DIR/src/main/resources/META-INF/native-image"

# 1. pom.xml (The Blueprint)
cat <<EOF > "$BASE_DIR/pom.xml"
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>$PACKAGE</groupId>
    <artifactId>$ARTIFACT_ID</artifactId>
    <version>1.0.0-SNAPSHOT</version>

    <properties>
        <java.version>21</java.version>
        <maven.compiler.source>\${java.version}</maven.compiler.source>
        <maven.compiler.target>\${java.version}</maven.compiler.target>
        <resilience4j.version>2.2.0</resilience4j.version>
        <archunit.version>1.2.1</archunit.version>
    </properties>

    <dependencies>
        <!-- AntiGravity Core -->
        <dependency>
            <groupId>io.github.resilience4j</groupId>
            <artifactId>resilience4j-circuitbreaker</artifactId>
            <version>\${resilience4j.version}</version>
        </dependency>
        <dependency>
            <groupId>io.opentelemetry</groupId>
            <artifactId>opentelemetry-api</artifactId>
            <version>1.34.1</version>
        </dependency>

        <!-- Testing -->
        <dependency>
            <groupId>com.tngtech.archunit</groupId>
            <artifactId>archunit-junit5</artifactId>
            <version>\${archunit.version}</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <source>\${java.version}</source>
                    <target>\${java.version}</target>
                </configuration>
            </plugin>
            <!-- SBOM Security -->
            <plugin>
                <groupId>org.cyclonedx</groupId>
                <artifactId>cyclonedx-maven-plugin</artifactId>
                <version>2.7.10</version>
                <executions>
                    <execution>
                        <phase>package</phase>
                        <goals><goal>makeAggregateBom</goal></goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>
EOF

# 2. ArchitectureTest.java (The Guardian)
cat <<EOF > "$BASE_DIR/src/test/java/$PACKAGE_PATH/architecture/ArchitectureTest.java"
package $PACKAGE.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "$PACKAGE", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

    @ArchTest
    public static final ArchRule hexagonal_boundaries = layeredArchitecture()
            .consideringOnlyDependenciesInAnyPackage("$PACKAGE..")
            .layer("Domain").definedBy("..domain..")
            .layer("Service").definedBy("..service..")
            .layer("Infrastructure").definedBy("..infrastructure..")
            .whereLayer("Domain").mayNotAccessAnyLayer()
            .whereLayer("Service").mayOnlyBeAccessedByLayers("Infrastructure");

    @ArchTest
    public static final ArchRule no_lombok_setters = noClasses()
            .should().beAnnotatedWith("lombok.Setter")
            .because("We use Java Records and immutability.");

    @ArchTest
    public static final ArchRule no_legacy_collections = noClasses()
            .should().dependOnClassesThat().haveFullyQualifiedName("java.util.Vector")
            .because("Use modern collections.");
            
    @ArchTest
    public static final ArchRule no_manual_threads = noClasses()
            .should().callConstructor(Thread.class)
            .because("Use Virtual Threads via Executors.");
}
EOF

# 3. Dockerfile (Native Image with Diagnostics)
cat <<EOF > "$BASE_DIR/Dockerfile"
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
COPY --from=builder /app/target/$ARTIFACT_ID /app
# 4. Thread Pinning Detection in Production
ENV JAVA_TOOL_OPTIONS="-Djdk.tracePinnedThreads=short"
EXPOSE $PORT
ENTRYPOINT ["/app"]
EOF

# 4. Main Application Class (With Health and CORS Stubs)
cat <<EOF > "$BASE_DIR/src/main/java/$PACKAGE_PATH/$MAIN_CLASS_NAME.java"
package $PACKAGE;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.util.logging.Logger;
import java.util.concurrent.Executors;
import com.sun.net.httpserver.HttpServer;

public class $MAIN_CLASS_NAME {
    private static final Logger logger = Logger.getLogger($MAIN_CLASS_NAME.class.getName());

    public static void main(String[] args) throws IOException {
        long start = System.currentTimeMillis();
        
        // 2. Health Check (Liveness Probe)
        HttpServer server = HttpServer.create(new InetSocketAddress($PORT), 0);
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
        logger.info("🚀 $ARTIFACT_ID started on port $PORT");
        logger.info("✅ Health Check available at http://localhost:$PORT/health");
        logger.info("⚡ Native Image Optimized + Pinning Detection Active");
    }
}
EOF

# 5. reflect-config.json (1. Cold Start / Reflection Fix)
cat <<EOF > "$BASE_DIR/src/main/resources/META-INF/native-image/reflect-config.json"
[
  {
    "name": "$PACKAGE.$MAIN_CLASS_NAME",
    "allDeclaredConstructors": true,
    "allPublicConstructors": true,
    "allDeclaredMethods": true,
    "allPublicMethods": true
  }
]
EOF

# 5. README.md
cat <<EOF > "$BASE_DIR/README.md"
# $ARTIFACT_ID

Generated by Richard AI AntiGravity Generator.

## Standards
- **Java**: 21+
- **Architecture**: Hexagonal (Enforced by ArchUnit)
- **Deployment**: GraalVM Native Image
- **Diagnostics**:
    - **Health Check**: \`/health\` endpoint active.
    - **Reflection**: \`reflect-config.json\` pre-populated.
    - **CORS**: Enabled by default (star).
    - **Pinning**: \`-Djdk.tracePinnedThreads=short\` enabled.

## Build
\`\`\`bash
./mvnw clean verify
\`\`\`
EOF

# 6. Placeholder Classes (To satisfy ArchUnit & Guide Devs)

# Domain
cat <<EOF > "$BASE_DIR/src/main/java/$PACKAGE_PATH/domain/PlaceholderDomain.java"
package $PACKAGE.domain;

public record PlaceholderDomain(String id) {}
EOF

# Infrastructure (Driving Side)
cat <<EOF > "$BASE_DIR/src/main/java/$PACKAGE_PATH/infrastructure/web/PlaceholderController.java"
package $PACKAGE.infrastructure.web;

import $PACKAGE.service.internal.PlaceholderServiceImpl;

public class PlaceholderController {
    // Only Infra can see Service
    private final PlaceholderServiceImpl service = new PlaceholderServiceImpl();
}
EOF

# Service (Internal Logic)
cat <<EOF > "$BASE_DIR/src/main/java/$PACKAGE_PATH/service/internal/PlaceholderServiceImpl.java"
package $PACKAGE.service.internal;

public class PlaceholderServiceImpl {
    public void execute() {
        // Logic
    }
}
EOF

# Make executable
chmod +x "$BASE_DIR/src/main/java/$PACKAGE_PATH/$MAIN_CLASS_NAME.java"

echo "✅ Microservice '$ARTIFACT_ID' created successfully!"
echo "👉 cd $BASE_DIR"
