import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import UnoCSS from 'unocss/astro';
import rehypePrettyCode from 'rehype-pretty-code';

const prettyCodeOptions = {
  theme: 'monokai',
  onVisitLine(node) {
    if (node.children.length === 0) {
      node.children = [
        {
          type: 'text',
          value: ' ',
        },
      ];
    }
  },
  onVisitHighlightedLine(node) {
    node.properties.className.push('highlighted');
  },
  onVisitHighlightedWord(node) {
    node.properties.className = ['word'];
  },
  // getHighlighter(){
  //   // 'dark-plus'   | 'light-plus'     => for the classic VS Code feel
  //   // 'github-dark' | 'github-light'   => for the GitHub feel
  //   // 'material-theme-*'               => for the materialists
  //   // 'min-dark'    | 'min-light'      => for the minimalists
  //   theme: 'nord'
  // },
  tokensMap: {},
};

// https://astro.build/config
export default defineConfig({
  site: 'https://michaelgainyo.github.io',
  integrations: [
    UnoCSS({
      injectReset: true,
    }),
    mdx(),
    sitemap(),
  ],
  markdown: {
    shikiConfig: { theme: 'css-variables' },
    extendDefaultPlugins: true,
    syntaxHighlight: false,
    rehypePlugins: [[rehypePrettyCode, prettyCodeOptions]],
  },
});
