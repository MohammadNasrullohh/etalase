/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'error',
      comment: 'Circular dependencies make slice ownership and initialization order ambiguous.',
      from: {},
      to: { circular: true },
    },
    {
      name: 'shared-must-not-import-upper-layers',
      severity: 'error',
      comment: 'Shared is the lowest FSD layer and cannot depend on domain or composition layers.',
      from: { path: '^src/shared/' },
      to: { path: '^src/(entities|features|widgets|views|app)/' },
    },
    {
      name: 'entities-must-not-import-upper-layers',
      severity: 'error',
      comment: 'Entities can depend only on shared infrastructure.',
      from: { path: '^src/entities/' },
      to: { path: '^src/(features|widgets|views|app)/' },
    },
    {
      name: 'features-must-not-import-composition-layers',
      severity: 'error',
      comment: 'Features cannot depend on widgets, page views, or App Router composition.',
      from: { path: '^src/features/' },
      to: { path: '^src/(widgets|views|app)/' },
    },
    {
      name: 'widgets-must-not-import-page-layers',
      severity: 'error',
      comment: 'Widgets are reusable compositions and cannot depend on views or routes.',
      from: { path: '^src/widgets/' },
      to: { path: '^src/(views|app)/' },
    },
    {
      name: 'views-must-not-import-app-router',
      severity: 'error',
      comment: 'Views compose pages but cannot depend on Next.js route files.',
      from: { path: '^src/views/' },
      to: { path: '^src/app/' },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: ['(^|/)node_modules/', '(^|/)\.next/', '(^|/)graphify-out/'],
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      conditionNames: ['types', 'import', 'require', 'node', 'default'],
      exportsFields: ['exports'],
    },
  },
}
