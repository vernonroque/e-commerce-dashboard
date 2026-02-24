import React from 'react'
import '../stylesheets/MainContent.css'
import TopBar from './TopBar';
import MetricsPanel from './MetricsPanel';
import ProfitChart from './ProfitChart';
import UnitEconomics from './UnitEconomics';
import ProductTable from './ProductTable';
import AdBreakdown from './AdBreakdown';
import ScalingSignal from './ScalingSignal';
// import KpiSummary from './KpiSummary';
// import RevenueChart from './RevenueChart';
// import PayoutsTable from './PayoutsTable';
// import InventoryAlerts from './InventoryAlerts';

function MainContent({compare, setCompare}){

    return(
        <div className = "MainContent">
            <TopBar compare={compare} setCompare={setCompare} />
            <MetricsPanel />
            <ProfitChart />
            <UnitEconomics />
            <ProductTable />
            <AdBreakdown />
            <ScalingSignal />
        </div>

    );
}

export default MainContent;