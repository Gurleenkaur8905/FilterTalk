import { createContext, useContext } from "react";

// Define valid field names for type safety
export type UserField = "userName" | "email" ;

// Centralized interface definition
export interface UserContextType {
  userState: Record<UserField, string | null>; // Explicitly define value type
  setUserField: (fieldName: UserField, value: string | null) => void; // Enforce type safety
}

// Define the context
export const UserContext = createContext<UserContextType | undefined>(undefined);

// Custom hook to consume the context
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

