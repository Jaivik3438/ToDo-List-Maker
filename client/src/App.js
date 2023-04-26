import logo from './logo.svg';
import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import './App.css';
import Login from './components/login';
import Registration from './components/registration';
import Dashboard from './components/dashboard';
import AddYourList from './components/addYourList';
import UpdateToDoList from './components/updateToDoList';

function App() {
  return (
    <div className="App">
      <Router>
      <Routes>
      <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/registration" element={<Registration />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/add-to-do-list" element={<AddYourList />} />
        <Route path="/update" element={<UpdateToDoList />} />
        </Routes>
        </Router>
    </div>
  );
}

export default App;
