import {
  createRequest,
} from "../utils"

import {
  IPet,
  IError,
  INewPet,
} from "./definitions"

export function findPets({
  tags,
  limit,
}: {
  tags?: string[];
  limit?: number;
}) {
  return createRequest<IPet[]>("pets.ungroup.findPets", {
    method: "GET",
    url: `/pets`,
    query: {
      tags,
      limit,
    },
  });
}

export function addPet({
  body,
}: {
  body: INewPet;
}) {
  return createRequest<IPet>("pets.ungroup.addPet", {
    method: "POST",
    url: `/pets`,
    data: body,
  });
}

export function findPetByID({
  id,
}: {
  id: number;
}) {
  return createRequest<IPet>("pets.ungroup.findPetByID", {
    method: "GET",
    url: `/pets/${id}`,
  });
}

export function deletePet({
  id,
}: {
  id: number;
}) {
  return createRequest<null>("pets.ungroup.deletePet", {
    method: "DELETE",
    url: `/pets/${id}`,
  });
}
