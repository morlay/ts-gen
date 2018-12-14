import { assign, Dictionary, forEach, has, isObject, mapValues, reduce, replace, startsWith, uniq } from "lodash";
import { ISchema } from "./interfaces/Swagger";

export const isObjectSchema = (schema: ISchema) => schema.type === "object" || has(schema, "properties");
export const isArraySchema = (schema: ISchema) => schema.type === "array" || has(schema, "items");

export function deRefs<T>(schema: any, definitions: Dictionary<ISchema>): T {
  if (typeof schema === "undefined") {
    return {} as T;
  }

  if (has(schema, "allOf")) {
    return reduce(
      schema.allOf,
      (final, s) => {
        const f: any = {
          ...final,
        };
        const next = deRefs(s, definitions);

        forEach(next, (v, k) => {
          switch (k) {
            case "properties":
              f[k] = {
                ...f[k],
                ...(v as any),
              };
              break;
            case "required":
              f[k] = uniq((f[k] || []).concat(v));
              break;
            default: {
              f[k] = v;
            }
          }
        });
        return f;
      },
      {},
    ) as T;
  }

  if (startsWith(schema.$ref, "#/components/schemas/")) {
    const refId = replace(schema.$ref, "#/components/schemas/", "") || schema["x-id"];

    if (definitions[refId]) {
      return {
        ...schema,
        ...deRefs<ISchema>(definitions[refId], definitions),
        "x-id": refId,
        $ref: undefined,
      };
    }
  }

  if (isObjectSchema(schema)) {
    const patchedProperties = mapValues(schema.properties, (propSchema) => deRefs<ISchema>(propSchema, definitions));

    if (isObject(schema.additionalProperties)) {
      const patchedAdditionalProperties: ISchema = deRefs<ISchema>(schema.additionalProperties, definitions);
      return assign(schema, {
        properties: patchedAdditionalProperties,
      });
    }

    return assign(schema, {
      properties: patchedProperties,
    });
  }

  if (isArraySchema(schema)) {
    return {
      ...schema,
      items: deRefs<ISchema>(schema.items, definitions),
    };
  }

  return schema;
}
