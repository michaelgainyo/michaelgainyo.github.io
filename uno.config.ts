import { defineConfig, presetUno } from 'unocss';
// import transformerDirectives from '@unocss/transformer-directives';
// https://unocss.dev/guide/config-file

export default defineConfig({
  presets: [presetUno()],
  extraContent: {
    filesystem: ['./src/**/*'],
  },

  // transformers: [transformerDirectives()],
});
