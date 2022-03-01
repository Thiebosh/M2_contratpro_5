import {BrowserRouter, Route, Routes} from "react-router-dom";

import * as React from 'react'
import './App.css'
import Home from "./pages/Home";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import Projets from "./pages/Projets";
import RequireAuth from "./components/utils/RequireAuth";
import Layout from "./components/navigation/Layout";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { ChakraProvider } from '@chakra-ui/react'

function App() {

  return (
      <ChakraProvider>

        <BrowserRouter>
          <Routes>
            <Route path="/" element={
              <RequireAuth element={<Layout/>}/>
            }>
              <Route index element={<Home/>}/>
              <Route path="dashboard/*" element={<Dashboard/>}/>
              <Route path="projets" element={<Projets/>}/>
              <Route path="profile" element={<Profile/>}/>
              <Route path="*" element={<NotFound/>}/>
            </Route>

            <Route path="/login" element={<Login/>}/>
          </Routes>
        </BrowserRouter>
      </ChakraProvider>

  )
}

export default App
