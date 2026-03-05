import '../stylesheets/Dashboard.css'
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';
import MainContent from './MainContent.js';
import React, {useState,useEffect} from 'react';
import apiFetch from '../services/apiFetch.js'

function Dashboard({ compare, setCompare }) {
    const [stores, setStores] = useState([]);
    const [selStore, setSelStore] = useState(stores[0]);
    console.log("The current selected store is >>>", selStore);
    
    useEffect(() => {
        
        const fetchSummary = async () => {
           
            const url = 'http://localhost:8080/api/dashboard';
            const options = {
                 method: "GET",
            }

            const response = await apiFetch(url,options)
            
            if (!response) return;

            if (!response.ok) {
                console.log("Request failed:", response.status);
                return;
            }

            try{
                const jsonResponse = await response.json();
                console.log("This is the list of summaries >>>", jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }
        
        };

        fetchSummary();

    },[]);

    useEffect(()=> {
        const fetchStores = async () => {
            const baseURL ='http://localhost:8080/api/dashboard/stores';

            const apiEndpoint = `${baseURL}`;
            const options = {
                    method: "GET",
                }
            // i need to modify with this apiFetch wrapper below
            const response = await apiFetch(apiEndpoint,options)

            if (!response) return;

            if (!response.ok) {
                console.log("Request failed:", response.status);
                return;
            }

            try{
                const jsonResponse = await response.json();
                console.log("This is the list of stores >>>", jsonResponse);
                setStores(jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }
        }

        fetchStores();

    },[])

    return (
        <div className="dashboardContent">
            <Navbar />

            <div className="dashboardBody">
                <Sidebar />
                <MainContent compare={compare} setCompare={setCompare} stores={stores} selStore={selStore} setSelStore={setSelStore} />
            </div>
        </div>
    );
}

export default Dashboard;