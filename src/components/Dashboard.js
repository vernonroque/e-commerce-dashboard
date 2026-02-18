import '../stylesheets/Dashboard.css'
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';
import MainContent from './MainContent.js';
import React, {useState,useEffect} from 'react';
import apiFetch from '../services/apiFetch.js'

function Dashboard() {

    // const [success, setSuccess] = useState(false);
    
    useEffect(() => {
        
        const fetchSummary = async () => {
           
            const url = 'http://localhost:8080/api/dashboard';
            const options = {
                 method: "GET",
            }

            const response = await apiFetch(url,options)
            console.log("The raw response >>>", response);
            
            if (!response) return;

            if (!response.ok) {
                console.log("Request failed:", response.status);
                return;
            }

            try{
                const jsonResponse = await response.json();
                console.log("This is the jsonResponse >>>", jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }
        
        };

        fetchSummary();

    },[]);

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