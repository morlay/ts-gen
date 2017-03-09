import {
  createRequest,
} from "../utils"

import {
  IPet,
  IError,
  INewPet,
} from "./definitions"

export const findPets = createRequest<{
  "Content-Type"?: string;
  tags?: string[];
  limit?: number;
}, IPet[]>("pets.ungroup.findPets", ({
  "Content-Type": contentType,
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
    headers: {
      "Content-Type": contentType,
    },
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
  id: number;
}, null>("pets.ungroup.deletePet", ({
  id,
}) => {
  return {
    method: "DELETE",
    url: `/pets/${id}`,
  };
})
