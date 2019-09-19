import path from "path";
//@ts-ignore
import rollupBabel from "rollup-plugin-babel";
//@ts-ignore
import nodeResolve from "rollup-plugin-node-resolve";

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
    nodeResolve({
      extensions: [".js", ".jsx", ".ts", ".tsx"],
    }),
    rollupBabel({
      babelrc: false,
      exclude: "node_modules/**",
      extensions: [".js", ".jsx", ".ts", ".tsx"],
      ...require("./babel.config"),
      overrides: [
        {
          presets: [
            [
              "@babel/preset-env",
              {
                targets: {
                  chrome: 50,
                  ie: 11,
                  esmodules: true,
                },
              },
            ],
          ],
        },
      ],
    }),
  ],
};
