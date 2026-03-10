import React, {useState, useEffect} from 'react'
import '../stylesheets/MainContent.css'
import TopBar from './TopBar';
import MetricsPanel from './MetricsPanel';
import ProfitChart from './ProfitChart';
import UnitEconomics from './UnitEconomics';
// import ProductTable from './ProductTable';
import AdBreakdown from './AdBreakdown';
import ScalingSignal from './ScalingSignal';
// import KpiSummary from './KpiSummary';
// import RevenueChart from './RevenueChart';
// import PayoutsTable from './PayoutsTable';
// import InventoryAlerts from './InventoryAlerts';

function MainContent({compare, setCompare, stores, selStore, setSelStore}){
    const [dateRange, setDateRange] = useState({});
    // console.log("In mainContent component")
    // console.log("the current date range is >>>", dateRange);
    // console.log("The current selectedStore is >>>", selStore);
    // console.log("--------------------");
    
    return(
        <div className = "MainContent">
            <TopBar compare={compare} 
                    setCompare={setCompare} 
                    stores={stores} 
                    selStore={selStore} 
                    setSelStore={setSelStore} 
                    dateRange={dateRange}
                    setDateRange={setDateRange}
            />
            <MetricsPanel dateRange={dateRange}
                        selStore={selStore}
            />
            <ProfitChart />
            <UnitEconomics />
            {/* <ProductTable /> */}
            <AdBreakdown />
            <ScalingSignal />
        </div>

    );
}

export default MainContent;