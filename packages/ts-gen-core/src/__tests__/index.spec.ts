import {
  TestContext,
  test,
} from "ava"
import {
  Decl,
  Identifier,
  ModuleExport,
  ModuleImport,
  Type,
  Value,
} from "../"

function print(t: TestContext) {
  t.pass()
}

Object.assign(print, {
  title: (providedTitle: string, input: string) => {
    return `${providedTitle}
----------------------------------
${input}
----------------------------------
`
  },
})

test("#Identifier", print, Identifier.of("a"))

test("#Value", print,
  Decl.const(
    Identifier.of("A")
              .generics(
                Type.of("TInner"),
                Type.of("TOuter"),
              )
              .typed(Type.string())
              .valueOf(
                Value.of("1"),
              ),
  ),
)

test("#func", print,
  Decl.func(Identifier.of("A")
                      .typed(Type.string())
                      .generics(
                        Type.of("T"),
                      )
                      .paramsWith(
                        Identifier.of("a")
                                  .asOptional()
                                  .typed(Identifier.of("string"))
                                  .valueOf(Value.of("as")),
                        Identifier.of("b")
                                  .typed(Identifier.of("T")),
                      )
                      .valueOf(Value.bodyOf(
                        Decl.returnOf(
                          Identifier.of("otherFunc")
                                    .paramsWith(
                                      Identifier.of("a"),
                                      Identifier.of("b"),
                                    ),
                        ),
                      )),
  ),
)

test("#Type", print,
  Decl.type(
    Identifier.of("A")
              .generics(Identifier.of("T"))
              .valueOf(
                Identifier.of("B")
                          .generics(Identifier.of("T")),
              ),
  ),
)

test("#Value", print,
  Decl.const(
    Identifier.of("A")
              .typed(Type.arrayOf(Type.string()))
              .valueOf(
                Value.arrayOf(
                  Value.of("a"),
                  Value.of("b"),
                  Value.of("c"),
                ),
              ),
  ),
)

test("#Obj", print,
  Decl.let(Identifier.of("A")
                     .typed(Type.objectOf(
                       Identifier.of("a").typed(Type.string()),
                       Identifier.of("b").typed(Type.string()),
                       Identifier.of("c").typed(Type.objectOf(
                         Identifier.of("a").valueOf(Value.of("a")),
                         Identifier.of("b").valueOf(Value.of("b")),
                       )),
                     ))
                     .valueOf(Value.objectOf(
                       Identifier.of("a").valueOf(Value.of("a")),
                       Identifier.of("b").valueOf(Value.of("b")),
                       Identifier.of("c").valueOf(Value.objectOf(
                         Identifier.of("a").valueOf(Value.of("a")),
                         Identifier.of("b").valueOf(Value.of("b")),
                       ))),
                     ),
  ),
)

test("#enum", print,
  Decl.enum(Identifier.of("A")
                      .valueOf(Type.enumOf(
                        Identifier.of("a").valueOf(Value.of(1)),
                        Identifier.of("b"),
                        Identifier.of("c"),
                      )),
  ),
)

test("#interface", print,
  Decl.interface(
    Identifier.of("A")
              .generics(Identifier.of("T"))
              .extendsWith(
                Identifier.of("a"),
                Identifier.of("b"),
              )
              .typed(Type.objectOf(
                Identifier.of("a").typed(Type.of(Identifier.of("T"))),
                Identifier.of("b").typed(Type.string()),
                Identifier.of("c").typed(Type.string()),
              )),
  ),
)

test("#import", print,
  ModuleImport.from("module"),
)

test("#import all as", print,
  ModuleImport.from("module").allAs(Identifier.of("a")),
)

test("#import default as", print,
  ModuleImport.from("module")
              .defaultAs(Identifier.of("b"))
              .membersAs(
                Identifier.of("c").as("k"),
                Identifier.of("d"),
              ),
)

test("#export single", print,
  ModuleExport.decl(Decl.const(Identifier.of("d").valueOf(Value.of(1)))),
)

test("#export multi", print,
  ModuleExport.of(
    Identifier.of("d"),
    Identifier.of("c"),
  ),
)

test("#class", print,
  Decl.class(
    Identifier.of("A")
              .generics(Identifier.of("T"))
              .extendsWith(Identifier.of("a"))
              .implementsWith(
                Identifier.of("a"),
                Identifier.of("b"),
              )
              .valueOf(Value.memberOf(
                Identifier.of("a").typed(Type.string()).valueOf(Value.of("1")),
                Identifier.of("b").typed(Type.string()),
                Decl.method(Identifier.of("b").typed(Type.string()))),
              ),
  ),
)
