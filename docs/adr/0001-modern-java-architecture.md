# 1. Adoption of 'AntiGravity' Architecture using Java 21+ and Cloud-Native Principles

Date: 2026-01-21

## Status

Accepted

## Context

The Richard Automotive Command Center backend was facing increasing complexity and resource utilization challenges. Traditional Java development patterns (heavy use of reflection, DTO boilerplate, thread-per-request models) were leading to:

1.  **High Infrastructure Costs**: Memory footprints per microservice were averaging 500MB+, requiring larger Kubernetes nodes.
2.  **Maintenance Overhead**: Significant developer time was spent maintaining structural code (getters, setters, builders) rather than business logic.
3.  **Scalability Bottlenecks**: Blocking I/O operations limited throughput on standard hardware, requiring horizontal scaling earlier than necessary.
4.  **Architectural Drift**: Without automated enforcement, domain boundaries were frequently violated, leading to "Spaghetti Code".

We needed a standardized architecture that optimizes for **Cloud-Native efficiency** (low RAM/CPU) and **Developer Velocity** (focus on domain logic).

## Decision

We have decided to adopt the **"AntiGravity" Architecture**, a modern subset of Java 21+ features and ecosystem tools designed for high-efficiency, zero-friction development.

This architecture mandates the following technical pillars:

1.  **Project Loom (Virtual Threads)**:
    *   We will replace all `java.util.concurrent` thread pools with `Executors.newVirtualThreadPerTaskExecutor()`.
    *   **Justification**: Allows the application to handle 100k+ concurrent requests/events on a single generic CPU core. This eliminates the need for reactive programming complexity (RxJava/Reactor) while maintaining non-blocking IO benefits.

2.  **Data-Oriented Programming (Records & Sealed Interfaces)**:
    *   All domain models must be defined as `sealed interface` hierarchies.
    *   All data carriers must be immutable `record` types.
    *   **Justification**: Provides compile-time safety against unhandled states (via exhaustive `switch`). Reduces LOC (Lines of Code) by ~40%, directly impacting long-term maintenance costs.

3.  **GraalVM Native Image First**:
    *   All code must be reflection-free or configured for Native Image compilation.
    *   **Justification**: Enables "Scale-to-Zero" capabilities. Startup times drop from 2s to <50ms, and memory usage drops from 512MB to <50MB per instance. This drastically reduces cloud billing for serverless/containerized workloads.

4.  **Architecture as Code (ArchUnit)**:
    *   We will enforce hexagonal architecture boundaries using ArchUnit tests in the CI pipeline.
    *   **Justification**: Prevents technical debt accumulation by blocking PRs that violate dependency rules (e.g., Domain depending on Infrastructure).

## Consequences

### Positive
*   **Cost Reduction**: Projected 60-80% reduction in cloud compute and memory resources due to GraalVM and Virtual Threads efficiency.
*   **Resilience**: Type-safe domain models make "impossible states" unrepresentable, reducing production runtime errors.
*   **Evolution**: The system is self-documenting and self-policing (via ArchUnit), allowing new team members to be productive safely.

### Negative
*   **Observability Changes**: Traditional debugging tools may need updates to fully support Virtual Threads (though JDK 21+ JFR support mitigates this).
*   **Library Constraints**: We are restricted to libraries that are compatible with GraalVM Native Image (no heavy dynamic reflection).
*   **Training**: Developers must upskill on Pattern Matching and Switch Expressions, moving away from classic OOP polymorphism.

## Compliance

This decision is enforced technically by the `ArchitectureTest.java` test suite and operationally by the `java-backend-blueprint` Maven archetype.
