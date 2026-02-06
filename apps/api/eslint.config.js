import { configApp } from '@adonisjs/eslint-config'
export default configApp([
  {
    parserOptions: {
      project: './tsconfig.json',
    },
  },
])
