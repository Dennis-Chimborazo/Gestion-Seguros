// eslint.config.mjs
import eslint from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';
import jsxA11yPlugin from 'eslint-plugin-jsx-a11y';

export default [
  // Configuración base
  eslint.configs.recommended,
  
  // Configuración para React
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react': reactPlugin,
      'react-hooks': reactHooksPlugin,
      'import': importPlugin,
      'jsx-a11y': jsxA11yPlugin
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx']
        }
      }
    },
    rules: {
      // Reglas de React
      'react/prop-types': 'error',
      'react/jsx-uses-react': 'error',
      'react/jsx-uses-vars': 'error',
      'react/react-in-jsx-scope': 'off', // Para React 17+ que no requiere importar React
      'react/jsx-filename-extension': ['warn', { extensions: ['.jsx'] }],
      
      // Reglas de React Hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      
      // Reglas de accesibilidad
      'jsx-a11y/alt-text': 'warn',
      'jsx-a11y/anchor-has-content': 'warn',
      'jsx-a11y/aria-props': 'warn',
      'jsx-a11y/aria-role': 'warn',
      'jsx-a11y/aria-unsupported-elements': 'warn',
      
      // Reglas de importación
      'import/no-unresolved': 'error',
      'import/named': 'error',
      'import/default': 'error',
      'import/namespace': 'error',
      'import/order': ['warn', {
        'groups': [
          'builtin',
          'external', 
          'internal', 
          ['parent', 'sibling', 'index']
        ],
        'newlines-between': 'always',
        'alphabetize': { order: 'asc', caseInsensitive: true }
      }],
      
      // Reglas generales de JavaScript
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      'no-unused-vars': 'warn',
      'prefer-const': 'warn',
      'no-var': 'error',
      'eqeqeq': ['error', 'always']
    }
  },
  
  // Configuración para archivos de prueba
  {
    files: ['**/*.test.js', '**/*.spec.js', '**/tests/**'],
    rules: {
      'no-undef': 'off',
      'react/prop-types': 'off'
    }
  }
];