import { createContext } from "react";

export interface AuthDataType {
    authCookie?: string, 
    loggedIn?: boolean, 
    userData?: {
        userID: string
    }
}
export const AuthData = createContext<AuthDataType>({});