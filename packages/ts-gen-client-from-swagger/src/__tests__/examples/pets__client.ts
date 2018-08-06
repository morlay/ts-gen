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
  body: pBody,
}) => {
  return {
    method: "POST",
    url: `/pets`,
    data: pBody,
  };
})

export const deletePet = createRequest<{
  "Content-Type"?: string;
  id: number;
}, null>("pets.deletePet", ({
  "Content-Type": pContentType,
  id: pID,
}) => {
  return {
    method: "DELETE",
    url: `/pets/${pID}`,
    headers: {
      "Content-Type": pContentType,
    },
  };
})

export const findPetByID = createRequest<{
  id: number;
  tag?: keyof typeof FindPetByIDTag;
}, IPet>("pets.find pet by id", ({
  id: pID,
  tag: pTag,
}) => {
  return {
    method: "GET",
    url: `/pets/${pID}`,
    query: {
      tag: pTag,
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