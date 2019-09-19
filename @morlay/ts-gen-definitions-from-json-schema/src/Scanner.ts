import { Decl, Identifier, safeKey, Type, Value, Writer } from "@morlay/ts-gen-core";
import { ISchemaBasic, TSchema } from "./Schema";
import {
  isArrayType,
  isBooleanType,
  isMetaType,
  isNullType,
  isNumberType,
  isObjectType,
  isStringType,
  normalizeSchema,
  toUpperCamelCase,
} from "./utils";

import {
  concat,
  filter,
  forEach,
  get,
  has,
  indexOf,
  isArray,
  isEmpty,
  isObject,
  last,
  map,
  omit,
  split,
  startsWith,
  times,
  values,
} from "lodash";

export const scan = (writer: Writer, schema: ISchemaBasic) => {
  return new Scanner(writer).scan(schema, true);
};

export class Scanner {
  $root: any = {};

  constructor(protected writer: Writer) {}

  scan(schema: ISchemaBasic, root?: boolean) {
    if (root) {
      this.$root = {
        ...schema,
        $id: schema.$id || "Root",
      };
    }

    this.writer.write(this.toDecl(schema));
  }

  toDecl = (schema: ISchemaBasic): Decl => {
    if (!schema.$id) {
      throw new Error("Declaration should be need Schema have an `$id`");
    }

    const id = this.writer.id(schema.$id);

    // type: ["object","boolean"]
    if (isArray(schema.type)) {
      const type = Identifier.of(id).typed(
        Type.unionOf(
          ...map(schema.type, (type, i) => {
            if (i === 0) {
              const s = {
                ...schema,
                type: type,
                $id: schema.$id + "Basic",
              };

              this.writer.write(this.toDecl(s));

              return this.toRefType({
                $ref: s.$id,
              });
            }

            return this.toType({
              type: type,
            });
          }),
        ),
      );

      return Decl.type(type);
    }

    if (schema.allOf) {
      const ident = this.extendableAllOfSchema(id, schema);

      if (ident) {
        return Decl.interface(ident);
      }
    }

    const type = this.toType(schema);

    if (canInterface(type)) {
      return Decl.interface(Identifier.of(id).typed(type));
    }

    return Decl.type(Identifier.of(id).typed(type));
  };

  extendableAllOfSchema = (id: string, schema: ISchemaBasic): Identifier | null => {
    let objectSchema: ISchemaBasic | undefined;
    const types: Type[] = [];
    let ok = false;

    forEach(schema.allOf, (subSchema, i) => {
      subSchema = normalizeSchema(subSchema);

      if (subSchema.$id) {
        this.writer.write(this.toDecl(subSchema));

        subSchema = {
          $ref: subSchema.$id,
        };
      }

      if (subSchema.$ref || subSchema.$recursiveRef) {
        const type = this.toType(subSchema);

        if (this.writer.isInterface(type.name)) {
          types.push(type);
        }

        return;
      }

      if (i === schema.allOf!.length - 1 && isObjectType(subSchema)) {
        if (schema.allOf!.length - 1 === types.length) {
          ok = true;
        }
        objectSchema = subSchema;
      }
    });

    if (isObjectType(schema)) {
      objectSchema = omit(schema, "allOf");

      if (schema.allOf!.length === types.length) {
        ok = true;
      }
    }

    if (ok) {
      return Identifier.of(id)
        .extendsWith(...types.map(String).map(Identifier.of))
        .typed(
          this.toType({
            ...objectSchema,
            $id: schema.$id,
          }),
        );
    }

    return null;
  };

  toType = (schema: TSchema): Type => {
    schema = normalizeSchema(schema);

    if (schema.$recursiveRef || schema.$ref) {
      return this.toRefType(schema);
    }

    if (schema.enum || schema.const) {
      return this.toEnumType(schema);
    }

    if (schema.anyOf) {
      return this.toAnyOfType(schema);
    }

    if (schema.allOf) {
      return this.toAllOfType(schema);
    }

    if (schema.oneOf) {
      return this.toOneOfType(schema);
    }

    if (isObjectType(schema)) {
      return this.toObjectType(schema);
    }

    if (isArrayType(schema)) {
      return this.toArrayType(schema);
    }

    if (isStringType(schema)) {
      if (schema.format === "binary") {
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

  toAnyOfType = (schema: ISchemaBasic): Type => {
    return Type.unionOf(...map(schema.anyOf!, this.toType));
  };

  toAllOfType = (schema: ISchemaBasic): Type => {
    const allOf = filter(schema.allOf!, (s) => !isMetaType(normalizeSchema(s)));
    const rootSchema = omit(schema, "allOf");

    if (!isMetaType(rootSchema)) {
      allOf.push(rootSchema);
    }

    return Type.intersectionOf(...map(allOf, this.toType));
  };

  toOneOfType = (schema: ISchemaBasic): Type => {
    const objectParent = isObjectType(schema);

    return Type.unionOf(
      ...map(schema.oneOf!, (subSchema) => {
        if (objectParent) {
          return this.toType({
            ...schema,
            oneOf: undefined,
            allOf: [subSchema],
          });
        }

        return this.toType(subSchema);
      }),
    );
  };

  toRefType = (schema: ISchemaBasic): Type => {
    if (schema.$recursiveRef) {
      return Type.of(this.writer.id(this.$root.$id));
    }

    let ref$ = schema.$ref!;

    const id = this.writer.id(schema.$ref);

    if (!!id && !this.writer.has(id)) {
      let [, keyPath] = split(ref$, "#");
      let keyPathArr = filter(split(keyPath, "/"), (v) => v) as string[];

      if (keyPathArr.length === 1) {
        keyPathArr = ["$defs", ...keyPathArr];
      }

      const refSchema = get(this.$root, keyPathArr);

      if (!refSchema) {
        console.warn(`missing node for ref ${ref$}`);
        return Type.nothing();
      }

      // just for placeholder
      this.writer.write(Decl.interface(Identifier.of(id)));

      const decl = this.toDecl({
        ...refSchema,
        $id: last(keyPathArr),
      });

      this.writer.write(decl);
    }

    return Type.of(id);
  };

  toArrayType = (schema: ISchemaBasic): Type => {
    if (isArray(schema.items)) {
      if (isObject(schema.additionalItems)) {
        return Type.additionalTupleOf(
          this.toType(schema.additionalItems as ISchemaBasic),
          ...map(schema.items, this.toType),
        );
      }

      if (schema.additionalItems) {
        return Type.additionalTupleOf(this.toType({}), ...map(schema.items, this.toType));
      }

      return Type.tupleOf(...map(schema.items, this.toType));
    }

    if (schema.maxItems && schema.maxItems === schema.minItems) {
      return Type.tupleOf(...times(schema.maxItems).map(() => this.toType(schema.items as ISchemaBasic)));
    }

    return Type.arrayOf(this.toType(normalizeSchema(schema.items as TSchema) as ISchemaBasic));
  };

  toObjectType = (schema: ISchemaBasic): Type => {
    let additionalPropertyType: Type | undefined;
    let patternPropertiesTypes: Type[] = [];

    if (schema.additionalProperties) {
      additionalPropertyType =
        typeof schema.additionalProperties === "boolean" ? Type.any() : this.toType(schema.additionalProperties);
    }

    if (schema.patternProperties) {
      patternPropertiesTypes = map(values(schema.patternProperties), this.toType) || [];
    }

    const mayWithAdditionalPropertiesTypes = concat(patternPropertiesTypes, additionalPropertyType || []);

    let props = map(schema.properties || {}, (subSchema: ISchemaBasic, key: string) => {
      let id = Identifier.of(safeKey(key));

      if (indexOf(schema.required || [], key) === -1) {
        id = id.asOptional();
      }

      return id.typed(
        this.toType({
          ...subSchema,
          $id: subSchema.$id || [schema.$id, key].join("_"),
        }),
      );
    });

    let composed = false;

    if (!isEmpty(mayWithAdditionalPropertiesTypes)) {
      let key = Identifier.of("k").typed(Type.string());

      if (schema.propertyNames) {
        const propertyNamesSchema = normalizeSchema(schema.propertyNames);

        const keyType = this.toType(propertyNamesSchema).toString();

        if (startsWith(keyType, "keyof")) {
          composed = true;
          key = Identifier.of(`k in ${keyType}`);
        }
      }

      props = props.concat(
        Identifier.of("")
          .indexBy(key)
          .typed(Type.unionOf(...mayWithAdditionalPropertiesTypes)),
      );
    }

    return Type.composedObjectOf(composed, ...props);
  };

  toEnumType = (schema: ISchemaBasic): Type => {
    if (has(schema, "const")) {
      schema.enum = [schema.const];
    }

    if (schema.$id && schema.enum!.length > 1 && isNaN(Number(schema.enum![0]))) {
      const $id = toUpperCamelCase(schema.$id);

      this.writer.write(
        Decl.enum(
          Identifier.of($id).valueOf(
            Type.enumOf(
              ...map(schema.enum, (value: any) =>
                Identifier.of(safeKey(value)).valueOf(Identifier.of(JSON.stringify(value))),
              ),
            ),
          ),
        ),
      );

      return Type.of(`keyof typeof ${$id}`);
    }

    return Type.unionOf(...map(schema.enum, (value: any) => Type.of(Value.of(value))));
  };
}

const canInterface = (type: Type) => {
  return !type.composed && type.name[0] === "{";
};