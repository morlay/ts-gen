import path from "path";
// @ts-ignore
import rollupBabel from "rollup-plugin-babel";

const pkg = require(path.join(process.cwd(), "package.json"));

module.exports = {
  input: pkg.types,
  output: [
    {
      file: pkg.main,
      format: "cjs",
    },
    {
      file: pkg.module,
      format: "es",
    },
  ],
  external: [
    "tslib",
    // @ts-ignore
    ...Object.keys(process.binding("natives")),
    ...Object.keys(pkg.dependencies || {}),
    ...Object.keys(pkg.peerDependencies || {}),
  ],
  plugins: [
    rollupBabel({
      ...require("./babel.config"),
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
  ],
};
