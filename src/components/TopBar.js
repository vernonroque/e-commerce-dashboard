import React from 'react'
import '../stylesheets/TopBar.css'

function TopBar({ compare, setCompare }){
    // console.log("compare:", compare);
    // console.log("setCompare:", setCompare);
    console.log("TopBar setCompare:", setCompare);

    return(
        <div className = "TopBar">
            <div className="dropdown">Store Selector ▼</div>
            <div className="dropdown">Date Range ▼</div>
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