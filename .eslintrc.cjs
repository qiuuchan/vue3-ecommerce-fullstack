module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  extends: [
    'eslint:recommended',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/recommended',
    // 必须放在最后：关掉会和 Prettier 打架的 ESLint 格式规则，避免重复报错
    'prettier'
  ],
  plugins: ['vue', 'local-rules'],
  rules: {
    // 允许多词组件名检查关闭，方便零基础先把页面跑起来。
    'vue/multi-word-component-names': 'off',
    // 本地规则：禁止 Vue 模板中出现未国际化的中文文本
    'local-rules/no-chinese-text': 'warn'
  }
};
