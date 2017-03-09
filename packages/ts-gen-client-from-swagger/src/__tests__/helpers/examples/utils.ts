export type IMethod = "GET" | "DELETE" | "HEAD" | "POST" | "PUT" | "PATCH";

export interface IRequestOptions {
  method: IMethod;
  url: string;
  query?: any;
  data?: any;
  headers?: any;
  formData?: any;
}

export function createRequest<TReq, TRespBody>(id: string, reqBuilder: (req: TReq) => IRequestOptions) {
  return (req: TReq): Promise<TRespBody> => Promise.resolve({});
}
