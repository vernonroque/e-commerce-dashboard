import React from 'react'
import '../stylesheets/MainContent.css'
import KpiSummary from './KpiSummary';
import RevenueChart from './RevenueChart';
import PayoutsTable from './PayoutsTable';
import InventoryAlerts from './InventoryAlerts';

function MainContent(){


    return(
        <div className = "MainContent">
            <KpiSummary />
            <RevenueChart />
            <PayoutsTable />
            <InventoryAlerts />
        </div>

    );

}

export default MainContent;