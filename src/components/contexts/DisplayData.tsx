import { createContext } from "react";

export interface DisplayDataType {isMobile?: boolean}
export const DisplayData = createContext<DisplayDataType>({});