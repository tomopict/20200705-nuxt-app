/*
 ** TailwindCSS Configuration File
 **
 ** Docs: https://tailwindcss.com/docs/configuration
 ** Default: https://github.com/tailwindcss/tailwindcss/blob/master/stubs/defaultConfig.stub.js
 */
module.exports = {
  purge: {
    // https://github.com/nuxt-community/tailwindcss-module/issues/114
    // purgeCSSのバグ?によりprod環境でtailwindが適応されない
    enabled: false,
  },
  theme: {},
  variants: {},
  plugins: [],
}
