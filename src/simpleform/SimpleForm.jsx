import { useState } from 'react'
import reactLogo from '../assets/react.svg'
import viteLogo from '../assets/vite.svg'
import heroImg from '../assets/hero.png'
import infologo from '../assets/infopic.jpg'; 
import './SimpleForm.css'

function SimpleForm()
{
  const [userName,setUserName]=useState("");
  const [lastName,setLastName]=useState("");
  const [email,setEmail]=useState("");
  const [mobile,setMobile]=useState("");
  const [gender,setGender]=useState(
    {
      male:true,
      female:false,
      other:false,
    }
  )
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(
        userName,
        lastName,
        email,
        mobile,
        gender
    
    );
    // Add your form submission logic here
};
const handleReset = () => {
  // Reset all state variables here
  setUserName("");
  setLastName("");
  setEmail("");
  setMobile("");
  setGender("male");  
};
  return (
    <div className="App">
      <h3> Simple Form in ReactJS</h3>
      <img src={infologo} width="240" height="240"></img>
      <form>
        <label htmlFor="username" >First Name</label>
        <input type="text" placeholder="Enter your name" id="username" value={userName} onChange={(e)=>setUserName(e.target.value)} />
        <label htmlFor='lastname'>Last Name</label>
        <input type="text" placeholder="Enter your last name" id="lastname" value={lastName} onChange={(e)=>setLastName(e.target.value)}/>
        <label htmlFor='email'>Email</label>
        <input type="email" placeholder="Enter your email" id="email" value={email} onChange={(e)=>setEmail(e.target.value)}/>
        <label htmlFor='mobile'>Mobile</label>
        <input type="number" placeholder="Enter your mobile number" id="mobile" value={mobile} onChange={(e)=>setMobile(e.target.value)}/>

        <label htmlFor='gender'>Gender</label>
      <div className='genderdiv'>
        <input type="radio" name="gender" id="male" value="Male" onChange={(e)=>setGender(e.target.value)}/>Male
        <input type="radio" name="gender" id="female" value="Female" onChange={(e)=>setGender(e.target.value)}/>Female
        <input type="radio" name="gender" id="other" value="Other" onChange={(e)=>setGender(e.target.value)}/>Other
        </div>
        <div className='buttondiv'>
        <button type='submit' className='submitbutton' onClick={(e)=>handleSubmit(e)}>Submit</button>
        <button type='reset' className='resetbutton' onClick={(e)=>handleReset()}>Reset</button>
        </div>
      </form>
    </div>
  );
}

export default SimpleForm;
