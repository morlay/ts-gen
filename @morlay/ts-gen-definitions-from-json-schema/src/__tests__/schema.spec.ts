import { scan } from "../Scanner";
// @ts-ignore
import schemaJSON from "../../../../spec/schema.json";
import * as fs from "fs";
import * as path from "path";
import { writerOf } from "@morlay/ts-gen-core";

test("#toSchema", () => {
  const writer = writerOf();

  scan(writer, schemaJSON);

  fs.writeFileSync(path.resolve(__dirname, "../Schema.ts"), `${writer.output()}\n`);
});
