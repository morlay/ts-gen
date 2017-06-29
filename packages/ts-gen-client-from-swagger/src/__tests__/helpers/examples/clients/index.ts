export enum FindPetByIDTag {
  A = "A",
  B = "B",
  C = "C",
}

import {
  createRequest,
} from "../utils"

import {
  IPet,
  INewPet,
} from "./definitions"

export const addPet = createRequest<{
  body: INewPet;
}, IPet>("pets.ungroup.addPet", ({
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
}, any>("pets.ungroup.deletePet", ({
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
}, IPet>("pets.ungroup.findPetByID", ({
  id,
  tag,
}) => {
  return {
    method: "GET",
    url: `/pets/${id}`,
  };
})

export const findPets = createRequest<void, IPet[]>("pets.ungroup.findPets", () => {
  return {
    method: "GET",
    url: `/pets`,
  };
})
