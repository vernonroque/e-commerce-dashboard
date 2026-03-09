import React, {useState,useEffect} from 'react'
import '../stylesheets/TopBar.css'
import DateRange from './DateRange';
import apiFetch from '../services/apiFetch.js'
import StoreSelector from './StoreSelector';

function TopBar({ compare, setCompare, stores, selStore, setSelStore,dateRange, setDateRange }){
    // const [dateRange, setDateRange] = useState({});
    // console.log("the current date range is >>>", dateRange);

    useEffect(() => {

        const fetchDates = async() =>{

            if (!dateRange.startDate) return;
            const baseURL ='http://localhost:8080/api/dashboard/getDates';
            const queries = `start=${dateRange.startDate}&end=${dateRange.endDate}`;

            const apiEndpoint = `${baseURL}?${queries}`;
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
                console.log("This is the jsonResponse >>>", jsonResponse);
            }catch(error){
                console.log("there is an error >>>", error);
            }

        }
        fetchDates();
       

    }, [dateRange]);

    // useEffect(()=> {
    //     const fetchStores = async () => {
    //         if (!dateRange.startDate) return;
    //         const baseURL ='http://localhost:8080/api/dashboard/stores';

    //         const apiEndpoint = `${baseURL}`;
    //         const options = {
    //                 method: "GET",
    //             }
    //         // i need to modify with this apiFetch wrapper below
    //         const response = await apiFetch(apiEndpoint,options)

             
    //         if (!response) return;

    //         if (!response.ok) {
    //             console.log("Request failed:", response.status);
    //             return;
    //         }

    //         try{
    //             const jsonResponse = await response.json();
    //             console.log("This is the jsonResponse >>>", jsonResponse);
    //         }catch(error){
    //             console.log("there is an error >>>", error);
    //         }
    //     }

    //     fetchStores();

    // },[])

    return(
        <div className = "TopBar">
            <StoreSelector stores={stores} 
                        selStore={selStore} 
                        setSelStore={setSelStore}
            />
            <DateRange onChange={setDateRange}/>
            <label className="toggle">
                <input
                    type="checkbox"
                    checked={compare}
                    onChange={(e) => setCompare(e.target.checked)}
                />{" "}
                Compare
            </label>
        </div>
    );
}

export default TopBar;