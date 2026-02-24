import React, {useState,useEffect} from 'react'
import '../stylesheets/TopBar.css'
import DateRange from './DateRange';

function TopBar({ compare, setCompare }){
    const [dateRange, setDateRange] = useState({});

    useEffect(() => {
        if (!dateRange.startDate) return;

        fetch(`/api/dashboard?start=${dateRange.startDate}&end=${dateRange.endDate}`)
        .then(res => res.json())
        .then(data => {
            console.log("Dashboard data:", data);
        });
    }, [dateRange]);

    return(
        <div className = "TopBar">
            <div className="dropdown">Store Selector ▼</div>
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