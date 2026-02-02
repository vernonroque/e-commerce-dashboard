import React from 'react'
import '../stylesheets/MainContent.css'
import KpiSummary from './KpiSummary';
import RevenueChart from './RevenueChart';

function MainContent(){


    return(
        <div className = "MainContent">
            <KpiSummary />
            <RevenueChart />

        </div>

    );

}

export default MainContent;