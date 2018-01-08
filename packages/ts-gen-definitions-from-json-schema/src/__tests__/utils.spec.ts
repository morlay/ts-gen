import { IJSONSchema, SimpleTypes } from "../interfaces";
import { toSingleSchema } from "../utils";

test("could replace imports schema with definitions", () => {
  const result = toSingleSchema(
    {
      $ref: "otherSchema#/definitions/Test",
    },
    {
      otherSchema: {
        definitions: {
          Test: {
            type: SimpleTypes.string,
          },
        },
      },
    },
  );

  expect(result).toEqual({
    type: "string",
  } as IJSONSchema);
});

test("could replace imports schema with deep path", () => {
  const result = toSingleSchema(
    {
      $ref: "otherSchema#/properties/test",
    },
    {
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
    },
  );

  expect(result).toEqual({
    id: "Test",
    type: "string",
  } as IJSONSchema);
});
