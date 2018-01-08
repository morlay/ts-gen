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
  id: number;
}, null>("pets.deletePet", ({
  id,
}) => {
  return {
    method: "DELETE",
    url: `/pets/${id}`,
    query: {
      id,
    },
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
    query: {
      id,
    },
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