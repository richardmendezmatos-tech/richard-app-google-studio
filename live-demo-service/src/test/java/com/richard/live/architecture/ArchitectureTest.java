package com.richard.live.architecture;

import com.tngtech.archunit.core.importer.ImportOption;
import com.tngtech.archunit.junit.AnalyzeClasses;
import com.tngtech.archunit.junit.ArchTest;
import com.tngtech.archunit.lang.ArchRule;

import static com.tngtech.archunit.library.Architectures.layeredArchitecture;
import static com.tngtech.archunit.lang.syntax.ArchRuleDefinition.noClasses;

@AnalyzeClasses(packages = "com.richard.live", importOptions = ImportOption.DoNotIncludeTests.class)
public class ArchitectureTest {

        @ArchTest
        public static final ArchRule hexagonal_boundaries = layeredArchitecture()
                        .consideringOnlyDependenciesInAnyPackage("com.richard.live..")
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
