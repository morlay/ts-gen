import {
  createRequest,
} from "../utils"

import {
  IPet,
  IError,
  INewPet,
} from "./definitions"

export const findPets = createRequest<any, IPet[]>("pets.ungroup.findPets", () => {
  return {
    method: "GET",
    url: `/pets`,
  };
})

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

export const findPetByID = createRequest<{
  id: number;
}, IPet>("pets.ungroup.findPetByID", ({
  id,
}) => {
  return {
    method: "GET",
    url: `/pets/${id}`,
  };
})

export const deletePet = createRequest<{
  "Content-Type"?: string;
  id: number;
}, null>("pets.ungroup.deletePet", ({
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
