import React,{useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import '../stylesheets/Signup.css';

function Signup() {
    const navigate = useNavigate();
    const [isSignedIn, setIsSignedIn] = useState(false);

    const handleSubmit = (e) => {

        e.preventDefault();

        const fetchSearch = async () => {
            const formData = new FormData(e.target);
            console.log("The form data is >>>", formData);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Data in an object:', data);
            const backendBaseUrl = process.env.REACT_APP_BACKEND_ORIGIN || 'http://localhost:8080';
        
            try {
                const response = await fetch(`${backendBaseUrl}/api/auth/register`, {
                    method: 'POST',
                    credentials: 'include',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data),
                });
        
                if (!response.ok) {
                    const errorData = await response.json();
                    console.error('Error:', errorData);
                } else {
                    const responseData = await response.json();
                    console.log('Success:', responseData);
                    setIsSignedIn(true);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        
        fetchSearch();
    }
    useEffect(() => {
        // once signed in redirect to the new page which is 
        // the store onboarding page
        if (isSignedIn) {
            navigate('/onboard-store');
        }
    },[isSignedIn,navigate])
    
    return(
        <div className = 'signupPage'>
            <h1>This is the signup component</h1>
            <form className = 'signupForm' onSubmit={handleSubmit}>
                <label htmlFor="firstname">First Name:</label>
                <input type="text" className="firstname" name="firstname" required />

                <label htmlFor="lastname">Last Name:</label>
                <input type="text" className="lastname" name="lastname" required />

                <label htmlFor="email">Email:</label>
                <input type="email" className="email" name="email" required />

                <label htmlFor="password">Password:</label>
                <input type="password" className="password" name="password" required />

                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default Signup;