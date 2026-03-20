import '../stylesheets/Dashboard.css'
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';
import MainContent from './MainContent.js';
import React, {useState,useEffect} from 'react';
import apiFetch from '../services/apiFetch.js'

function Dashboard({ compare, setCompare }) {
    const [stores, setStores] = useState([]);
    const [selStore, setSelStore] = useState(stores[0]);

    useEffect(()=> {
        const fetchStores = async () => {
            const backendBaseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
            const baseURL =`${backendBaseUrl}/api/dashboard/stores`;

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

                //jsonResponse is an array of object of the stores 
                setStores(jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }
        }

        fetchStores();

    },[])

    useEffect(() => {
        if (stores.length > 0) {
            console.log("The store selected by default is >>>", stores[0]);
            setSelStore(stores[0]);
        }
    }, [stores]);

    return (
        <div className="dashboardContent">
            <Navbar />

            <div className="dashboardBody">
                <Sidebar />
                <MainContent compare={compare} 
                            setCompare={setCompare} 
                            stores={stores} 
                            selStore={selStore} 
                            setSelStore={setSelStore} 
                />
            </div>
        </div>
    );
}

export default Dashboard;