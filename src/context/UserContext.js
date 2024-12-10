import React, { createContext, useState, useEffect } from "react";

const UserContext = createContext();

const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a token in localStorage and populate user context
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
        setUser({ username: decodedToken.username, user_id: decodedToken.user_id });
      } catch (error) {
        console.error("Failed to decode token:", error);
        setUser(null); // Clear user if token is invalid
      }
    }
  }, []); // Run once on app load

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };
