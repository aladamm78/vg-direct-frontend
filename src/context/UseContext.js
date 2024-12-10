import React, { useContext } from "react";
import { UserContext } from "../context/UserContext";

function Profile() {
  const { user } = useContext(UserContext);
  return <h1>{user ? `Welcome back, ${user.name}` : "Please log in!"}</h1>;
}

export default Profile;
