import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import UnoCSS from "unocss/astro";
import rehypePrettyCode from "rehype-pretty-code";

// https://astro.build/config
export default defineConfig({
  site: "https://michaelgainyo.github.io",
  integrations: [mdx(), UnoCSS(), sitemap()],
  server: { port: 3010, host: true },
  markdown: {
    shikiConfig: { theme: "" },
    extendDefaultPlugins: true,
    syntaxHighlight: false,
    rehypePlugins: [
      [
        rehypePrettyCode,
        {
          theme: "material-theme-palenight",
          onVisitLine(node) {
            if (node.children.length === 0) node.children = [{ type: "text", value: " " }];
          },
          onVisitHighlightedLine(node) {
            const nodeClass = node.properties.className;
            console.log("Highlighted Line", { node });
            if (nodeClass && nodeClass.length > 0) {
              node.properties.className.push("highlighted");
            } else {
              node.properties.className = ["highlighted"];
            }
          },
          onVisitHighlightedWord(node) {
            node.properties.className = ["word"];
          },
          tokensMap: {},
        },
      ],
    ],
  },
});
