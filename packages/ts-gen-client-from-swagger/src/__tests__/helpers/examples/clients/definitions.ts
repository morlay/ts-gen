export interface IPet extends INewPet {
  id: number;
}

export interface INewPet {
  name: string;
  tag?: string;
}

export interface IError {
  code: number;
  message: string;
}
