import { createRequest } from "./utils";

export const formMultipartWithFile = createRequest<
  {
    data?: {
      name: string;
      tag?: string;
      id: number;
    };
    file: File | Blob;
    slice?: [string][];
    string?: string;
  },
  null
>("pets.FormMultipartWithFile", ({ data: pData, file: pFile, slice: pSlice, string: pString }) => {
  return {
    method: "POST",
    url: `/demo/forms/multipart`,
    data: {
      data: pData,
      file: pFile,
      slice: pSlice,
      string: pString,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
});

export const formMultipartWithFiles = createRequest<
  {
    files: Array<[File | Blob]>;
  },
  null
>("pets.FormMultipartWithFiles", ({ files: pFiles }) => {
  return {
    method: "POST",
    url: `/demo/forms/multipart-with-files`,
    data: {
      files: pFiles,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
});

export const formURLEncoded = createRequest<
  {
    data: {
      name: string;
      tag?: string;
      id: number;
    };
    slice: [string][];
    string: string;
  },
  null
>("pets.FormURLEncoded", ({ data: pData, slice: pSlice, string: pString }) => {
  return {
    method: "POST",
    url: `/demo/forms/url-encoded`,
    data: {
      data: pData,
      slice: pSlice,
      string: pString,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
});

export const addPet = createRequest<
  {
    body: INewPet;
  },
  IPet
>("pets.addPet", ({ body: pBody }) => {
  return {
    method: "POST",
    url: `/pets`,
    data: pBody,
    headers: {
      "Content-Type": "application/json",
    },
  };
});

export const deletePet = createRequest<
  {
    id: number;
  },
  null
>("pets.deletePet", ({ id: pID }) => {
  return {
    method: "DELETE",
    url: `/pets/${pID}`,
  };
});

export const findPetByID = createRequest<
  {
    id: number;
  },
  IPet
>("pets.find pet by id", ({ id: pID }) => {
  return {
    method: "GET",
    url: `/pets/${pID}`,
  };
});

export const findPets = createRequest<
  {
    tags?: [string][];
    limit?: number;
  },
  [IPet][]
>("pets.findPets", ({ tags: pTags, limit: pLimit }) => {
  return {
    method: "GET",
    url: `/pets`,
    query: {
      tags: pTags,
      limit: pLimit,
    },
  };
});

export interface IError {
  code: number;
  message: string;
}

export interface INewPet {
  name: string;
  tag?: string;
}

export interface IPet extends INewPet {
  id: number;
}

export interface IRequestForm {
  data: {
    name: string;
    tag?: string;
    id: number;
  };
  slice: [string][];
  string: string;
}
