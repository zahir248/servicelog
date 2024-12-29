import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import AddVehicle from "./pages/AddVehicle";
import EditVehicle from "./pages/EditVehicle";
import ServiceHistory from "./pages/ServiceHistory";

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<Login />} />
        <Route exact path="/register" element={<Register />} />
        <Route exact path="/dashboard" element={<Dashboard />} />
        <Route exact path="/add-vehicle" element={<AddVehicle />} />
        <Route exact path="/edit-vehicle/:id" element={<EditVehicle />} />
        <Route exact path="/service-history/:id" element={<ServiceHistory />} />
      </Routes>
    </Router>
  );
}

export default App;