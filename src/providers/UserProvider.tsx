"use client";
import React, { useEffect, useState } from "react";
import { UserContext, UserContextType, UserField } from "../context/UserContext";

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    
  // State for user fields
  const [userState, setUserState] = useState<Record<UserField, string | null>>({
    userName: null,
    email: null
  });

  // Dynamic setter function for individual fields
  const setUserField = (fieldName: UserField, value: string | null) => {
    setUserState((prev) => ({
      ...prev,
      [fieldName]: value, // Dynamically update the field
    }));
  };

  

  // Define the context value //function to be imported
  const contextValue: UserContextType = {
    userState,
    setUserField,
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
};
