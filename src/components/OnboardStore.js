import React,{useState, useEffect} from 'react';
import '../stylesheets/OnboardStore.css';

function OnboardStore() {
    const handleSubmit = async(e) => {
        e.preventDefault();
        const storeName = e.target[0].value;
        console.log("The store name entered is >>>", storeName);
        // Here you would typically make an API call to connect the Shopify store using the entered store name

        const response = await fetch('/api/shopify/oauth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ storeName })
        });

        if(response.ok) {
            // Handle successful connection (e.g., redirect to dashboard, show success message)
            console.log("Shopify store connected successfully");
            const data = await response.json();
            window.location.href = data.authUrl;
        } else {
            // Handle error (e.g., show error message)
            console.error("Failed to connect Shopify store");
        }
    }

    return(
        <div className = 'onboardStorePage'>
            <h1>This is the onboard store component</h1>
            <h2>Please connect your shopify store to continue</h2>
            <p> Need to think of what info needed from user to connect to store</p>
            <p>What info do i need for shopify api call</p>
            <form className="onboard-store-form" onSubmit={handleSubmit}>

                <input type="text" placeholder='Enter your shopify store name' className='storeUrlInput' />
                <button type="submit" className='connectButton'>Connect Shopify Store</button>

            </form>
                
        </div>
    );
}

export default OnboardStore;