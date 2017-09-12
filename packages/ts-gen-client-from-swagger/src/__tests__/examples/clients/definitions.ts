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
