import { test } from "ava";
import { toSingleSchema } from "../utils";
import { IJSONSchema } from "../interfaces";

test("could replace imports schema with definitions", (t) => {
  const result = toSingleSchema({
    $ref: "otherSchema#/definitions/Test",
  }, {
    otherSchema: {
      definitions: {
        Test: {
          type: "string",
        },
      },
    },
  });

  t.deepEqual(result, {
    type: "string",
  } as IJSONSchema);
});

test("could replace imports schema with deep path", (t) => {
  const result = toSingleSchema({
    $ref: "otherSchema#/properties/test",
  }, {
    otherSchema: {
      type: "object",
      properties: {
        test: {
          $ref: "#/definitions/Test",
        },
      },
      definitions: {
        Test: {
          type: "string",
        },
      },
    },
  });

  t.deepEqual(result, {
    type: "string",
  } as IJSONSchema);
});
