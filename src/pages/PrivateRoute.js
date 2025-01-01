import React from "react";
import { Navigate } from "react-router-dom";

// Custom PrivateRoute component to protect routes
const PrivateRoute = ({ element }) => {
  const userToken = localStorage.getItem("userToken"); // Check if user is authenticated

  return userToken ? element : <Navigate to="/" />;
};

export default PrivateRoute;
