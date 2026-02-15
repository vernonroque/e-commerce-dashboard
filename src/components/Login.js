import React from 'react';
import '../stylesheets/Login.css';

function Login() {

    const handleSubmit = (e) => {

        e.preventDefault();

        const fetchSearch = async () => {
            const formData = new FormData(e.target);
            console.log("The form data is >>>", formData);
            const data = Object.fromEntries(formData.entries());
            console.log('Form Data in an object:', data);
        
            try {
                const response = await fetch('http://localhost:8080/api/auth/login', {
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