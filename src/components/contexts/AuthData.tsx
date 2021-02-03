import { createContext } from "react";

export interface AuthDataType {authCookie?: string, loggedIn?: boolean}
export const AuthData = createContext<AuthDataType>({});