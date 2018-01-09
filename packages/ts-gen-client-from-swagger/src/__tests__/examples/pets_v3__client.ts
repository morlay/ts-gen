import {
  createRequest,
} from "./utils"

export const formMultipartWithFile = createRequest<{
  data?: IPet;
  file: File | Blob;
  slice?: string[];
  string?: string;
}, null>("pets.FormMultipartWithFile", ({
  data,
  file,
  slice,
  string,
}) => {
  return {
    method: "POST",
    url: `/demo/forms/multipart`,
    data: {
      data,
      file,
      slice,
      string,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
})

export const formMultipartWithFiles = createRequest<{
  files: Array<File | Blob>;
}, null>("pets.FormMultipartWithFiles", ({
  files,
}) => {
  return {
    method: "POST",
    url: `/demo/forms/multipart-with-files`,
    data: {
      files,
    },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  };
})

export const formURLEncoded = createRequest<{
  data: IPet;
  slice: string[];
  string: string;
}, null>("pets.FormURLEncoded", ({
  data,
  slice,
  string,
}) => {
  return {
    method: "POST",
    url: `/demo/forms/url-encoded`,
    data: {
      data,
      slice,
      string,
    },
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  };
})

export const addPet = createRequest<{
  body: INewPet;
}, IPet>("pets.addPet", ({
  body,
}) => {
  return {
    method: "POST",
    url: `/pets`,
    data: body,
    headers: {
      "Content-Type": "application/json",
    },
  };
})

export const deletePet = createRequest<{
  id: number;
}, null>("pets.deletePet", ({
  id,
}) => {
  return {
    method: "DELETE",
    url: `/pets/${id}`,
  };
})

export const findPetByID = createRequest<{
  id: number;
}, IPet>("pets.find pet by id", ({
  id,
}) => {
  return {
    method: "GET",
    url: `/pets/${id}`,
  };
})

export const findPets = createRequest<{
  tags?: string[];
  limit?: number;
}, IPet[]>("pets.findPets", ({
  tags,
  limit,
}) => {
  return {
    method: "GET",
    url: `/pets`,
    query: {
      tags,
      limit,
    },
  };
})

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