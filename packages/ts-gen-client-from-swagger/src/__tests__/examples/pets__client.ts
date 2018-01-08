export enum FindPetByIDTag {
  A = "A",
  B = "B",
  C = "C",
}

import {
  createRequest,
} from "./utils"

export const addPet = createRequest<{
  body: INewPet;
}, IPet>("pets.addPet", ({
  body,
}) => {
  return {
    method: "POST",
    url: `/pets`,
    data: body,
  };
})

export const deletePet = createRequest<{
  "Content-Type"?: string;
  id: number;
}, null>("pets.deletePet", ({
  "Content-Type": contentType,
  id,
}) => {
  return {
    method: "DELETE",
    url: `/pets/${id}`,
    headers: {
      "Content-Type": contentType,
    },
  };
})

export const findPetByID = createRequest<{
  id: number;
  tag?: keyof typeof FindPetByIDTag;
}, IPet>("pets.find pet by id", ({
  id,
  tag,
}) => {
  return {
    method: "GET",
    url: `/pets/${id}`,
    query: {
      tag,
    },
  };
})

export const findPets = createRequest<void, IPet[]>("pets.findPets", () => {
  return {
    method: "GET",
    url: `/pets`,
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