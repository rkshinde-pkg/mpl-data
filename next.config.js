const withSass = require("@zeit/next-sass");
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
// const withSourceMaps = require("@zeit/next-source-maps");
// const { BundleAnalyzerPlugin } = require("webpack-bundle-analyzer");
// const { ANALYZE } = process.env;

// const nextJsConfig = {
//   exportPathMap: function(defaultPathMap) {
//     return {
//       "/": { page: "/index" },
//       "/about": { page: "/about" },
//       "/disclaimer": { page: "/disclaimer" },
//       "/gamesofskill": { page: "/gamesofskill" },
//       "/privacy": { page: "/privacy" },
//       "/privacypolicy": { page: "/privacypolicy" },
//       "/returns": { page: "/returns" },
//       "/skillgames": { page: "/skillgames" },
//       "/terms": { page: "/terms" },
//       "/termsandconditions": { page: "/termsandconditions" }
//     };
//   }
// };

// module.exports = withSass(nextJsConfig);

// const analyze = {
//   webpack: function(config, { isServer }) {
//     if (ANALYZE) {
//       config.plugins.push(
//         new BundleAnalyzerPlugin({
//           analyzerMode: "server",
//           analyzerPort: isServer ? 8888 : 8889,
//           openAnalyzer: true
//         })
//       );
//     }

//     return config;
//   }
// };

// module.exports = withSass(
//   withSourceMaps({
//     webpack(config, options) {
//       return config;
//     }
//   })
// );

module.exports = withSass({
  webpack(config, options) {
    config.module.rules.push({
      test: /\.(raw)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
      use: "raw-loader"
    });
    if (config.mode === "production") {
      if (Array.isArray(config.optimization.minimizer)) {
        config.optimization.minimizer.push(new OptimizeCSSAssetsPlugin({}));
      }
    }
    return config;
  },
  generateBuildId: async () => {
    // For example get the latest git commit hash here
    return require("child_process")
      .execSync("git rev-parse HEAD")
      .toString()
      .trim();

    // return "randomvalue";
  }
});
