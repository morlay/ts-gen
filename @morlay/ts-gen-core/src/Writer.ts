import { Decl, ModuleExport, ModuleImport, toUpperCamelCase } from "./utils";
import { keys, last, replace, split, values } from "lodash";

export interface IWriterOpts {
  prefixInterface: string;
  prefixType: string;
}

export const writerOf = (opts?: IWriterOpts) => {
  return new Writer(opts);
};

export class Writer {
  protected imports: { [k: string]: ModuleImport } = {};
  protected declarations: { [k: string]: Decl } = {};
  protected names: { [k: string]: string } = {};

  constructor(
    protected opts: IWriterOpts = {
      prefixInterface: "I",
      prefixType: "T",
    },
  ) {}

  output() {
    return [
      values(this.imports)
        .map(String)
        .join("\n"),

      keys(this.declarations)
        .sort()
        .map((k) => {
          const d = this.declarations[k];

          return replace(ModuleExport.decl(d).toString(), /(\$\$\$[A-Za-z0-9_]+)/g, (match: string) => {
            return this.names[match] || match;
          });
        })
        .join("\n\n"),
    ].join("\n\n");
  }

  import(imp: ModuleImport) {
    this.imports[imp.path] = imp;
  }

  onWrite?: (decl: Decl, ctx: any) => void;

  write(decl: Decl, ctx?: any) {
    const id = decl.identifier.name;

    this.onWrite && ctx && this.onWrite(decl, ctx);

    this.declarations[id] = decl;

    switch (decl.kind) {
      case "type":
        this.names[id] = resolveID(id, this.opts.prefixType);
        break;
      case "interface":
        this.names[id] = resolveID(id, this.opts.prefixInterface);
        break;
      default:
        this.names[id] = id;
    }
  }

  id = (id: string = ""): string => `$$$${toUpperCamelCase(last(split(id, "/")) || "")}`;

  has(id: string): boolean {
    return !!this.declarations[id];
  }

  get(id: string): Decl {
    return this.declarations[id];
  }

  isInterface(id: string) {
    return (this.declarations[id] || {}).kind === "interface";
  }
}

const resolveID = (id: string, prefix: string) => {
  return id.replace(/^\$\$\$/, prefix);
};
