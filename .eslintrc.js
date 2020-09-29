/**
 * eslint中文规则网站
 *
 * https://cn.eslint.org/docs/rules/
 *
 */
// 使用例子 eslint fix
// yarn eslint --fix packages/award/src/**/*.tsx

module.exports = {
  extends: ['alloy', 'alloy/react', 'alloy/typescript', 'prettier'],
  root: true,
  plugins: ['prettier', 'jest'],
  rules: {
    'prettier/prettier': ['error'],
    /**
     * eslint-config-alloy
     * https://github.com/AlloyTeam/eslint-config-alloy/blob/master/index.js
     */
    'max-params': ['off'],
    'no-throw-literal': ['off'],
    'no-param-reassign': ['off'],
    indent: ['off'],
    'no-async-promise-executor': ['off'],
    semi: ['error', 'always'],
    'spaced-comment': [
      'error',
      'always',
      {
        markers: ['/']
      }
    ],
    'comma-dangle': ['error', 'never'],
    'no-unused-vars': ['off'],
    'require-atomic-updates': ['off'],
    'react/no-unescaped-entities': ['off'],

    /**
     * eslint-config-alloy/react
     * https://github.com/AlloyTeam/eslint-config-alloy/blob/master/react.js
     */
    'react/jsx-indent': ['off'],
    'react/jsx-indent-props': ['off'],
    'react/sort-comp': ['off'],

    /**
     * eslint-config-alloy/typescript
     * https://github.com/AlloyTeam/eslint-config-alloy/blob/master/typescript.js
     */
    '@typescript-eslint/no-unused-vars': ['error'],
    '@typescript-eslint/indent': ['off'],
    '@typescript-eslint/no-var-requires': ['off'],
    '@typescript-eslint/no-this-alias': [
      'error',
      {
        allowDestructuring: true, // Allow `const { props, state } = this`; false by default
        allowedNames: ['self'] // Allow `const self = this`; `[]` by default
      }
    ],
    '@typescript-eslint/no-angle-bracket-type-assertion': ['off'],
    '@typescript-eslint/no-triple-slash-reference': ['off'],
    '@typescript-eslint/prefer-interface': ['off'],
    '@typescript-eslint/no-object-literal-type-assertion': ['off'],
    '@typescript-eslint/member-ordering': ['off'],
    '@typescript-eslint/no-require-imports': ['off'],
    '@typescript-eslint/no-unused-expressions': ['off']
  },
  overrides: [
    {
      // 覆盖测试示例
      files: ['{packages,tools}/**/__tests__/**/*.{ts,tsx}'],
      rules: {
        // https://github.com/jest-community/eslint-plugin-jest
        'jest/no-focused-tests': 2
      },
      env: {
        jest: true
      }
    },
    {
      // 源代码
      files: ['{packages,tools}/**/src/**/*.{ts,tsx}'],
      rules: {
        'no-undef': 'off'
      }
    },
    {
      files: ['**/*.js'],
      globals: {
        React: true
      },
      rules: {
        '@typescript-eslint/no-unused-vars': ['off'],
        '@typescript-eslint/explicit-member-accessibility': ['off']
      }
    }
  ],
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
    ecmaFeatures: {
      modules: true,
      jsx: true
    }
  },
  settings: {
    react: {
      pragma: 'React',
      version: '16.9.0'
    }
  }
};
