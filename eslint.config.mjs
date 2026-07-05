import next from 'eslint-config-next'

/** Flat ESLint config (Next 16 ships a native flat config). */
const eslintConfig = [
  ...next,
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'build/**',
      'src/payload-types.ts',
      'src/app/(payload)/**',
      // Non-app, repo-adjacent assets — never part of the build (AD-11).
      'rollun_handoff/**',
      '_bmad/**',
      '_bmad-output/**',
      '.bmad-loop/**',
      '.claude/**',
    ],
  },
]

export default eslintConfig
