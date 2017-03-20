export enum TestBaseID2 {
  V1,
  V2,
}

export interface ITestBase {
  id?: "1" | "2";
  id2?: keyof typeof TestBaseID2;
}

export interface ITest extends ITestBase {
  name?: string;
}
