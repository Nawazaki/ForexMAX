module.exports = function(eleventyConfig) {
  // Pass-through copy for static assets
  eleventyConfig.addPassthroughCopy("assets");
  eleventyConfig.addPassthroughCopy("admin");
  eleventyConfig.addPassthroughCopy("articles"); // Keeping existing articles for now
  
  // Also pass through index.html if we want to keep it as is, 
  // but usually in 11ty we move it to the root or content folder
  
  return {
    dir: {
      input: ".",
      output: "_site",
      includes: "_includes"
    }
  };
};
