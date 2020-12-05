module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    browser: true,
    node: true,
  },
  overrides: [
    {
      files: [
        '**/test/**/*.spec.{j,t}s?(x)'
      ],
      env: {
        mocha: true
      }
    }
  ]
}
