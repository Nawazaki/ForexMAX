import sanitizeHtml from "sanitize-html";

export function sanitizeRichHtml(input: string) {
  return sanitizeHtml(input, {
    allowedTags: ["h1", "h2", "h3", "h4", "p", "strong", "em", "a", "ul", "ol", "li", "blockquote", "pre", "code", "table", "thead", "tbody", "tr", "th", "td", "figure", "figcaption", "img", "hr", "br"],
    allowedAttributes: {
      a: ["href", "title", "rel", "target"],
      img: ["src", "alt", "width", "height", "loading"],
      code: ["class"],
    },
    allowedSchemes: ["https", "http", "mailto"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer nofollow", target: "_blank" }),
    },
  });
}
