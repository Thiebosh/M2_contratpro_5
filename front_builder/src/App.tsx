import {BrowserRouter, Routes, Route} from "react-router-dom";

import './App.css'
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import RequireAuth from "./components/utils/RequireAuth";
import NavBar from "./components/navigation/NavBar";
import Login from "./pages/Login";

function App() {

  return (
    <BrowserRouter>
      <NavBar/>
      <Routes>
        <Route path="/" element={<Home/>}/>
        <Route path="/dashboard/*" element={
          <RequireAuth element={<Dashboard/>}/>
        }/>
        <Route path="/about" element={<About/>}/>
        <Route path="/login" element={<Login/>}/>
        <Route path="*" element={<NotFound/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
