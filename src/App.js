
import './App.css';
import React, {useState} from 'react';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import Login from './components/Login';
import Signup from './components/Signup';

function App() {
  const [compare, setCompare] = useState(false);

  console.log("compare:", compare);
    console.log("setCompare:", setCompare);
  return (
    
    <Router>
        <div className = "App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard compare={compare} setCompare={setCompare}/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      
    </Router>
    
     
  );
}

export default App;
