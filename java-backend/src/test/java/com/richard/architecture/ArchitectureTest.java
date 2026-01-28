package com.richard.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.classes;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;
import static com.tngtech.archunit.core.domain.JavaClass.Predicates.simpleNameEndingWith;

@AnalyzeClasses(packages = "com.richard", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

        // 1. Capa de Dominio: Independencia Total
        @ArchTest
        public static final ArchRule hexagonal_architecture_must_be_respected = layeredArchitecture()
                        .consideringOnlyDependenciesInAnyPackage("com.richard..")
                        .layer("Domain").definedBy("..domain..")
                        .layer("Service").definedBy("..service..")
                        .layer("Infrastructure").definedBy("..infrastructure..")

                        .whereLayer("Domain").mayNotAccessAnyLayer() // El dominio no habla con nadie hacia afuera
                        .whereLayer("Service").mayOnlyBeAccessedByLayers("Infrastructure") // Los controladores (Infra)
                                                                                           // llaman a servicios
                        .whereLayer("Infrastructure").mayNotBeAccessedByAnyLayer()
                        .allowEmptyShould(true);

        // 2. Nombramiento: Estándar para Servicios
        @ArchTest
        public static final ArchRule service_naming_convention = classes()
                        .that().resideInAPackage("..service.internal..") // Implementaciones ocultas
                        .or().resideInAPackage("..service.impl..")
                        .should().haveSimpleNameEndingWith("Impl")
                        .andShould()
                        .implement(simpleNameEndingWith("Service"))
                        .allowEmptyShould(true);

        // 3. Anti-Boilerplate: Inmutabilidad estricta (Records > Lombok)
        @ArchTest
        public static final ArchRule loops_not_lombok = noClasses()
                        .should().beAnnotatedWith("lombok.Setter")
                        .because("In 2026 we use Java Records. Mutability is forbidden.");

        // 4. Modernización: Prohibido legacy collections
        @ArchTest
        public static final ArchRule no_legacy_collections = noClasses()
                        .should().dependOnClassesThat().haveFullyQualifiedName("java.util.Vector")
                        .orShould().dependOnClassesThat().haveFullyQualifiedName("java.util.Hashtable")
                        .because("Use modern collections (ArrayList, HashMap, or ConcurrentHashMap) instead.");

        // 5. Hilos: Virtual Threads obligatorios (No new Thread())
        @ArchTest
        public static final ArchRule virtual_threads_only = noClasses()
                        .should().callConstructor(Thread.class)
                        .because("Manual thread creation is banned. Use 'Executors.newVirtualThreadPerTaskExecutor()' for Loom compliance.");
}
