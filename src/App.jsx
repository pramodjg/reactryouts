import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import Dashboard from './Dashboard/Dashboard.jsx'
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SignInForm from './login/Login.jsx'

import './App.css'
import SimpleForm from './simpleform/SimpleForm'
import SignUpForm from './Register/Register.jsx'

function App()
{

  const [type, setType] = useState("signIn");
  
  const handleOnClick = text => {
    if (text !== type) {
      setType(text);
      return;
    }
   
  };
  
  const containerClass = "container " + (type === "signUp" ? "right-panel-active" : "");

  return  (
   <Router>   
    <div>
     <Routes>
     <Route path="/" element= { <div className={containerClass}  id="container">
      {/* Only show one form at a time based on type */}
      {type === "signIn" ? <SignInForm /> : <SignUpForm />}
      
      <div className="overlay-container">
        <div className="overlay">
          <div className="overlay-panel overlay-left">
            <h1>Welcome Back!</h1>
            <p>
              To keep connected with us please login with your personal info
            </p>
            <button
              className="ghost"
              id="signIn"
              onClick={() => handleOnClick("signIn")}
            >
              Sign In
            </button>
          </div>
          <div className="overlay-panel overlay-right">
            <h1>Hello, Friend!</h1>
            <p>Enter your personal details and start journey with us</p>
            <button
              className="ghost"
              id="signUp"
              onClick={() => handleOnClick("signUp")}
            >
              Sign Up
            </button>
          </div>
        </div>
      </div>
    </div>}/>
     <Route path="/login" element= {<SignInForm/>}/>
     <Route path="/dashboard" element= {<Dashboard/>}/>
     <Route path="/userinfopage" element= {<SimpleForm/>}/>
     <Route path="/registration" element= {<SignUpForm/>}/>
      </Routes>    
      </div>
  </Router>)
}

// function Startup()
// {
//   return (
//     <div className={containerClass}  id="container">
//       {/* Only show one form at a time based on type */}
//       {type === "signIn" ? <SignInForm /> : <SignUpForm />}
      
//       <div className="overlay-container">
//         <div className="overlay">
//           <div className="overlay-panel overlay-left">
//             <h1>Welcome Back!</h1>
//             <p>
//               To keep connected with us please login with your personal info
//             </p>
//             <button
//               className="ghost"
//               id="signIn"
//               onClick={() => handleOnClick("signIn")}
//             >
//               Sign In
//             </button>
//           </div>
//           <div className="overlay-panel overlay-right">
//             <h1>Hello, Friend!</h1>
//             <p>Enter your personal details and start journey with us</p>
//             <button
//               className="ghost"
//               id="signUp"
//               onClick={() => handleOnClick("signUp")}
//             >
//               Sign Up
//             </button>
//           </div>
//         </div>
//       </div>
//     </div>
//   )
// }

export default App;

