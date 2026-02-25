import katex from "https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.mjs";

export function renderLatex(el, tex, opts = {}) {
  katex.render(tex, el, {
    throwOnError: false,
    displayMode: true,
    ...opts,
  });
}