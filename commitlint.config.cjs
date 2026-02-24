// commitlint.config.cjs — Richard Automotive v2026.1
// Enforces Conventional Commits: https://www.conventionalcommits.org
module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Tipos permitidos
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad
        'fix',      // Corrección de bug
        'docs',     // Solo documentación
        'style',    // Formato, espacios, punto y coma (sin cambio de lógica)
        'refactor', // Refactorización sin nueva funcionalidad ni fix
        'perf',     // Mejora de rendimiento
        'test',     // Añadir o corregir tests
        'build',    // Sistema de build, deps externas (webpack, npm)
        'ci',       // Cambios en CI/CD (Cloud Build, GitHub Actions)
        'chore',    // Tareas de mantenimiento sin producción
        'revert',   // Revertir un commit anterior
        'wip',      // Trabajo en progreso (solo ramas feature/*)
      ],
    ],
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'subject-case': [2, 'never', ['sentence-case', 'start-case', 'pascal-case', 'upper-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};
