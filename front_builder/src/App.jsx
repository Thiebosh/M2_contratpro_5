import {BrowserRouter, Routes, Route} from "react-router-dom";

import './App.css'
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import About from "./pages/About";
import RequireAuth from "./components/utils/RequireAuth";
import NavBar from "./components/navigation/NavBar";
import Layout from "./components/navigation/Layout";
import Login from "./pages/Login";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={
          <RequireAuth element={<Layout/>}/>
        }>
          <Route index element={<Home/>}/>
          <Route path="dashboard/*" element={<Dashboard/>}/>
          <Route path="about" element={<About/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Route>

        <Route path="/login" element={<Login/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
