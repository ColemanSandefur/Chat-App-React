import { createContext } from "react";

export interface AuthDataType {
    authCookie?: string, 
    loggedIn?: boolean, 
    userData?: {
        userID: number
    }
}
export const AuthData = createContext<AuthDataType>({});