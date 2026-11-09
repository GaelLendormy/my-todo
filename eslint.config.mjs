import withNuxt from './.nuxt/eslint.config.mjs'

export default withNuxt({ ignores: ['runs/**', 'ai-workflow/**', '.agents/**'] })
