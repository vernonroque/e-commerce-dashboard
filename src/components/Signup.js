import React from 'react';
import '../stylesheets/Signup.css';

function Signup() {

    const handleSubmit = (e) => {

        e.preventDefault();

        const fetchSearch = async () => {
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Data:', data);
        
            try {
                const response = await fetch('http://localhost:3001/api/auth/register', {
                    method: 'POST',
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
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        
        fetchSearch();
    }
    return(
        <div className = 'signupPage'>
            <h1>This is the signup component</h1>
            <form className = 'signupForm' onSubmit={handleSubmit}>
                <label htmlFor="firstname">First Name:</label>
                <input type="text" class="firstname" name="firstname" required />

                <label htmlFor="lastname">Last Name:</label>
                <input type="text" class="lastname" name="lastname" required />

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Sign Up</button>
            </form>
        </div>
    )
}

export default Signup;