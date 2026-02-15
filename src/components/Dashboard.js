import '../stylesheets/Dashboard.css'
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';
import MainContent from './MainContent.js';
import React, {useState,useEffect} from 'react';

function Dashboard() {

    const [success, setSuccess] = useState(false);
    useEffect(() => {
       
        const fetchSummary = async () => {
            const url = 'http://localhost:8080/api/dashboard';
            
            const response = await fetch(url);
            const jsonResponse = await response.json();
            if(jsonResponse.ok){
                setSuccess(true);
            }
            try{
                console.log("This is the jsonResponse >>>", jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }
            
        };

        fetchSummary();
        
    },[success]);

    return (
        <div className="dashboardContent">
            <Navbar />

            <div className="dashboardBody">
                <Sidebar />
                <MainContent />
            </div>
        </div>
    );
}

export default Dashboard;