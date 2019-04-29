export const cases = [
  {
    schema: {
      type: "array",
      items: {
        type: "string",
      },
    },
    result: "string[]",
  },
  {
    schema: {
      items: {
        type: "integer",
      },
    },
    result: "number[]",
  },
  {
    schema: {
      items: {
        type: "object",
        properties: {
          a: {
            type: "string",
          },
        },
      },
    },
    result: `Array<{
  a?: string;
}>`,
  },
  {
    // TODO additional Tuple ?
    schema: {
      items: [
        {
          type: "string",
        },
        {
          type: "integer",
        },
      ],
    },
    result: "Array<string | number>",
  },
  {
    schema: {
      items: [
        {
          type: "string",
        },
        {
          type: "integer",
        },
      ],
      additionalItems: false,
    },
    result: "[string, number]",
  },
  {
    schema: {
      items: {
        type: "string",
      },
      minItems: 2,
      maxItems: 2,
    },
    result: "[string, string]",
  },
];
