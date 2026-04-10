import React from 'react';
import '../stylesheets/OnboardStore.css';
import apiFetch from '../services/apiFetch.js'

function OnboardAdPlatforms() {

    return(
        <div className = 'onboardAdPlatformsPage'>
            <h1>This is the onboard ad platforms component</h1>
            <h2>Please connect your ad platforms to continue</h2>
            <p> Need to think of what info needed from user to connect to ad platforms</p>
            <p>What info do i need for ad platforms api call</p>
            {/* <form className="onboard-ad-platforms-form" onSubmit={handleSubmit}>

                <input type="text" placeholder='Enter your shopify store name' className='storeUrlInput' />
                <button type="submit" className='connectButton'>Connect Shopify Store</button>

            </form> */}
                
        </div>
    );
}
export default OnboardAdPlatforms;