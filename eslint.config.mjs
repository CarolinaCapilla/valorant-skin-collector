// @ts-check
import withNuxt from './.nuxt/eslint.config.mjs'
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended'

export default withNuxt([
	// Ignore linting config files themselves to avoid parser mode issues
	{ ignores: ['eslint.config.mjs', '.eslint.config.mjs', 'eslintrc.js', '.eslintrc.js'] },
	// Enable Prettier recommended rules integration
	eslintPluginPrettierRecommended
])
