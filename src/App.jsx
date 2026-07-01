import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'

import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInForm from './login/Login.jsx'

import './App.css'
import SimpleForm from './simpleform/SimpleForm'

function App()
{
  return  (
   <Router>   
    <div>
     <Routes>
     <Route path="/" element= {<SignInForm/>}/>
     <Route path="/userinfopage" element= {<SimpleForm/>}/>
      </Routes>    
      </div>
  </Router>)
}

export default App;
