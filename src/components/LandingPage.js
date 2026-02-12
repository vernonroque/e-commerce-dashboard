import React from 'react';
import '../stylesheets/LandingPage.css';
import { NavLink } from "react-router-dom";

function LandingPage() {
    return (
        <div className = "landingPage">
            <h1>This is the landing page section</h1>
                <NavLink to="/login" end>
                    <button className = 'loginButton'>Login</button>
                </NavLink>
                 <NavLink to="/signup" end>
                    <button className = 'signupButton'>Sign Up</button>
                </NavLink>
        </div>
    )
}

export default LandingPage;