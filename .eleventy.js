module.exports = function(eleventyConfig) {
  // Pass-through copy for static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("articles");
  
  // Set watch targets
  eleventyConfig.addWatchTarget("./_data/");

  // Add articles collection
  eleventyConfig.addCollection("articles", function(collectionApi) {
    return collectionApi.getFilteredByGlob("articles/*.html").filter(item => {
      // Only include files that have front matter (like title)
      return !!item.data.title;
    });
  });

  eleventyConfig.addFilter("dateFilter", function(dateObj) {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  });

  eleventyConfig.addFilter("date", function(dateObj) {
    if (!dateObj) return "";
    return new Date(dateObj).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  });

  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes",
      data: "_data"
    },
    templateFormats: ["html", "md", "njk"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  };
};
