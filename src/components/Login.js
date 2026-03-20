import React from 'react';
import '../stylesheets/Login.css';

function Login() {

    const handleSubmit = (e) => {

        e.preventDefault();

        const fetchSearch = async () => {
            console.log("Login function triggered");
            const formData = new FormData(e.target);
            console.log("The form data is >>>", formData);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Data in an object:', data);
            const baseURL = process.env.REACT_APP_BACKEND_ORIGIN;
        
            try {
                const response = await fetch(`${baseURL}/api/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                    body: JSON.stringify(data),
                });
                const jsonResponse = await response.json();

                if (jsonResponse.status === 401) {
                    await fetch(`${baseURL}/api/auth/refresh`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include'
                    });
                }
                console.log("The response in Login component is >>>", jsonResponse);
        
                if (!jsonResponse.ok) {
                    console.error('Error:', jsonResponse);
                } else {
                    
                    console.log('Success:', jsonResponse);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
        }
        fetchSearch();
    }
    return(
         <div className = 'loginPage'>
            <h1>Login</h1>
            <form className = 'loginForm' onSubmit={handleSubmit}>

                <label htmlFor="email">Email:</label>
                <input type="email" id="email" name="email" required />

                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" required />

                <button type="submit">Login</button>
            </form>
        </div>
    )
}

export default Login;