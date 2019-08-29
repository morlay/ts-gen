import { Decl, Identifier, ModuleExport, safeKey, Type, Value } from "@morlay/ts-gen-core";
import {
  assign,
  concat,
  filter,
  forEach,
  indexOf,
  isArray,
  isEmpty,
  isObject,
  keys,
  last,
  map,
  pick,
  split,
  times,
  uniq,
  values,
} from "lodash";
import { IJSONSchema } from "./interfaces";
import {
  isArrayType,
  isBooleanType,
  isNullType,
  isNumberType,
  isObjectType,
  isStringType,
  toSafeId,
  toUpperCamelCase,
} from "./utils";

const MAIN_SCHEMA_PLACEHOLDER = "MAIN_SCHEMA_PLACEHOLDER";

export const pickRefName = (schema: IJSONSchema): string => {
  if (schema.$ref === "#") {
    return MAIN_SCHEMA_PLACEHOLDER;
  }
  const refName = last(split(schema.$ref || "", "/")) || "";
  return toSafeId(refName);
};

export const filterNonTypeSchemas = (schemas: IJSONSchema[]) =>
  filter(schemas, (schema) => !!keys(pick(schema, ["enum", "type", "$ref"])).length);

export const extendsableAllOfSchema = (schemas: IJSONSchema[]): [IJSONSchema | undefined, IJSONSchema[]] => {
  const refSchemas: IJSONSchema[] = [];
  let objectSchema: IJSONSchema | undefined;

  forEach(schemas, (schema) => {
    if (isObjectType(schema)) {
      objectSchema = schema;
    }
    if (schema.$ref) {
      refSchemas.push(schema);
    }
  });

  return [objectSchema, refSchemas];
};

export const encode = (type: string) => `/**${encodeURIComponent(type)}**/`;
export const decode = (encodedType: string): [string, string[]] => {
  const sideDefs: string[] = [];
  const res: string = encodedType.replace(/\/\*\*([^\*\*\/]+)\*\*\//g, (_: any, $1) => {
    sideDefs.push(decodeURIComponent($1));
    return "";
  });
  return [res, sideDefs];
};

export const toTypings = (schema: IJSONSchema): Type => {
  if (schema.$ref) {
    return Type.of(pickRefName(schema));
  }

  if (schema.enum) {
    if (schema.$id && schema.enum.length > 1 && isNaN(Number(schema.enum[0]))) {
      const id = Identifier.of(toUpperCamelCase(schema.$id));
      return Type.of(
        `keyof typeof ${id}${encode(
          Decl.enum(
            id.valueOf(
              Type.enumOf(
                ...map(schema.enum, (value: any) =>
                  Identifier.of(safeKey(value)).valueOf(Identifier.of(JSON.stringify(value))),
                ),
              ),
            ),
          ).toString(),
        )}`,
      );
    }

    return Type.unionOf(...map(schema.enum, (value: any) => Type.of(Value.of(value))));
  }

  if (schema.allOf) {
    return Type.intersectionOf(...map(filterNonTypeSchemas(schema.allOf), toTypings));
  }

  if (schema.anyOf) {
    return Type.unionOf(...map(filterNonTypeSchemas(schema.anyOf), toTypings));
  }

  if (schema.oneOf) {
    // TODO xor not support
    return Type.unionOf(...map(filterNonTypeSchemas(schema.oneOf), toTypings));
  }

  // TODO find better way
  if (isObjectType(schema) && isArrayType(schema)) {
    return Type.any();
  }

  if (isObjectType(schema)) {
    let additionalPropertyType: Type | undefined;
    let patternPropertiesTypes: Type[] = [];

    // if (isEmpty(schema.properties) && !schema.additionalProperties) {
    //   schema.additionalProperties = true
    // }

    if (schema.additionalProperties) {
      additionalPropertyType =
        typeof schema.additionalProperties === "boolean" ? Type.any() : toTypings(schema.additionalProperties);
    }

    if (schema.patternProperties) {
      patternPropertiesTypes = map(values(schema.patternProperties), toTypings) || [];
    }

    const mayWithAdditionalPropertiesTypes = concat(patternPropertiesTypes, additionalPropertyType || []);

    let props = map(schema.properties || {}, (subSchema: IJSONSchema, key: string) => {
      let id = Identifier.of(safeKey(key));

      if (indexOf(schema.required || [], key) === -1) {
        id = id.asOptional();
      }

      return id.typed(
        toTypings({
          ...subSchema,
          $id: subSchema.$id || [schema.$id, key].join("_"),
        }),
      );
    });

    if (!isEmpty(mayWithAdditionalPropertiesTypes)) {
      props = props.concat(
        Identifier.of("")
          .indexBy(Identifier.of("k").typed(Type.string()))
          .typed(Type.unionOf(...mayWithAdditionalPropertiesTypes)),
      );
    }

    return Type.objectOf(...props);
  }

  if (isArrayType(schema)) {
    if (isArray(schema.items)) {
      if (isObject(schema.additionalItems)) {
        return Type.additionalTupleOf(
          toTypings(schema.additionalItems as IJSONSchema),
          ...map(schema.items, toTypings),
        );
      }

      if (schema.additionalItems === true) {
        return Type.additionalTupleOf(toTypings({}), ...map(schema.items, toTypings));
      }

      return Type.tupleOf(...map(schema.items, toTypings));
    }

    if (schema.maxItems && schema.maxItems === schema.minItems) {
      return Type.tupleOf(...times(schema.maxItems).map(() => toTypings(schema.items as IJSONSchema)));
    }

    return Type.arrayOf(toTypings(schema.items as IJSONSchema));
  }

  if (isStringType(schema)) {
    if ((schema as any).format === "binary") {
      return Type.of("File | Blob");
    }
    return Type.string();
  }

  if (isNumberType(schema)) {
    return Type.number();
  }

  if (isBooleanType(schema)) {
    return Type.boolean();
  }

  if (isNullType(schema)) {
    return Type.null();
  }

  return Type.any();
};

export const pickSideDefs = (s: string): string => {
  const [result, sideDefs] = decode(s);
  const uniqedSideDefs = uniq(sideDefs);

  if (uniqedSideDefs.length > 0) {
    return uniqedSideDefs
      .map((sideDef) => `export ${sideDef}`)
      .concat(result)
      .join("\n\n");
  }

  return result;
};

export const toDeclaration = (schema: IJSONSchema): string | never => {
  if (!schema.$id) {
    throw new Error("Declaration should be need Schema have an `id`");
  }

  const type = toTypings(schema);

  if (schema.allOf) {
    const [objectSchema, refSchemas] = extendsableAllOfSchema(schema.allOf);

    if (objectSchema) {
      return `${ModuleExport.decl(
        Decl.interface(
          Identifier.of(toSafeId(schema.$id))
            .extendsWith(
              ...refSchemas
                .map(toTypings)
                .map(String)
                .map(Identifier.of),
            )
            .typed(
              toTypings({
                ...objectSchema,
                $id: schema.$id,
              }),
            ),
        ),
      )}`;
    }
  }

  if (isObjectType(schema) && !isArrayType(schema) && !(schema.oneOf || schema.allOf || schema.anyOf)) {
    return `${ModuleExport.decl(Decl.interface(Identifier.of(toSafeId(schema.$id)).typed(type)))}`;
  }

  return `${ModuleExport.decl(Decl.type(Identifier.of(toSafeId(schema.$id)).typed(type)))}`;
};

export const toDeclarations = (schema: IJSONSchema) => {
  const main = toDeclaration(schema);

  return pickSideDefs(
    map(isEmpty(schema.definitions) ? {} : schema.definitions!, (defSchema, $id) =>
      toDeclaration(assign(defSchema, { $id })),
    )
      .concat(main)
      .join("\n\n")
      .replace(new RegExp(MAIN_SCHEMA_PLACEHOLDER, "g"), toSafeId(schema.$id || "")),
  );
};
