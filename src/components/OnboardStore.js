import React,{useState, useEffect} from 'react';
import '../stylesheets/Signup.css';

function OnboardStore() {
    return(
        <div className = 'onboardStorePage'>
            <h1>This is the onboard store component</h1>
            <h2>Please connect your shopify store to continue</h2>
            <p> Need to think of what info needed from user to connect to store</p>
            <p>What info do i need for shopify api call</p>
                <button className='connectButton'>Connect Shopify Store</button>
        </div>
    );
}

export default OnboardStore;