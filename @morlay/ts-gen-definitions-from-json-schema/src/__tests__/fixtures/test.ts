import { IJSONSchema } from "../../interfaces";

export default {
  allOf: [
    {
      $ref: "#/definitions/testBase",
    },
    {
      type: "object",
      properties: {
        name: {
          type: "string",
        },
      },
    },
  ],
  definitions: {
    testBase: {
      type: "object",
      properties: {
        id: {
          type: "string",
          enum: ["1", "2"],
        },
        id2: {
          type: "string",
          enum: ["V1", "V2"],
          "x-enum-labels": ["v1", "v2"],
        },
      },
    },
  },
} as IJSONSchema;
