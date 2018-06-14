export interface UsersResponseType{
    success:boolean,
    error: string,
    users: UserType[]
}

export interface UserType{
  name:string,
  surname: string,
  email: string
}

export interface TableUserType{
  position: number,
  name:string,
  surname: string,
  email: string
}

export interface VersionResponseType{
  success:boolean,
  error:string,
  version: string;
}
