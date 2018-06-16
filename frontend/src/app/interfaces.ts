export interface BossResponseType{
  success: boolean,
  error: string,
  boss: number
}

export interface LogResponseType{
  success: boolean,
  error: string,
  user: UserType,
  token: string
}

export interface RegisterResponseType{
  success: boolean,
  error: string
}

export interface SupervisionsResponseType{
  success: boolean,
  error: string,
  supervisions: SupervisionType[]
}

export interface SupervisionType{
  id_user: number,
  id_boss:number
}

export interface UserResponseType{
    success:boolean,
    error: string,
    user: UserType
}

export interface UsersResponseType{
    success:boolean,
    error: string,
    users: UserType[]
}

export interface UserType{
  id: number,
  name:string,
  surname: string,
  email: string
}

export interface SuccessResponseType{
  success: boolean,
  error: string
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
