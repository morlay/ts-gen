module.exports = {
  "presets": [
    [
      "@babel/preset-env",
      {
        "targets": {
          "node": "current",
        },
      },
    ],
  ],
  "plugins": [
    "babel-plugin-typescript-iife-enum",
    "@babel/plugin-transform-typescript",
    "@babel/plugin-proposal-class-properties",
    "@babel/plugin-proposal-object-rest-spread",
    "babel-plugin-pure-calls-annotation",
  ],
};
