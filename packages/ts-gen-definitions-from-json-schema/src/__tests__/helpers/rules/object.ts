export const cases = [{
  schema: {
    type: "object",
    properties: {
      a: {
        type: "string",
      },
      b: {
        type: "string",
      },
    },
    required: [
      "a",
    ],
  },
  result: `{
  a: string;
  b?: string;
}`,
}, {
  schema: {
    type: "object",
    properties: {
      a: {
        type: "string",
      },
      b: {
        type: "object",
        properties: {
          c: {
            type: "string",
          },
        },
      },
    },
    required: [
      "a",
    ],
  },
  result: `{
  a: string;
  b?: {
    c?: string;
  };
}`,
}, {
  schema: {
    type: "object",
  },
  result: `{
  [k: string]: any;
}`,
}, {
  schema: {
    type: "object",
    properties: {
      a: {
        type: "string",
      },
    },
    additionalProperties: true,
  },
  result: `{
  a?: string;
  [k: string]: any;
}`,
}, {
  schema: {
    type: "object",
    properties: {
      a: {
        type: "string",
      },
    },
    additionalProperties: {
      type: "string",
    },
  },
  result: `{
  a?: string;
  [k: string]: string;
}`,
}, {
  schema: {
    type: "object",
    properties: {
      a: {
        type: "string",
      },
    },
    patternProperties: {
      "^x-": {
        type: "string",
      },
    },
  },
  result: `{
  a?: string;
  [k: string]: string;
}`,
}];
