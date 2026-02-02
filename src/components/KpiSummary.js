import '../stylesheets/KpiSummary.css'
import KpiCard from './KpiCard';

const kpis = [
    {
        title: "Today Revenue",
        value: "$3,420",
        meta: "▲ 12%",
        trend: "up"
    },
    {
        title: "Net Cash Flow",
        value: "+$1,180",
        meta: "Positive",
        trend: "up"
    },
    {
        title: "Pending Payout",
        value: "$4,900",
        meta: "ETA: 3 days"
    },
    {
        title: "Ad Spend Today",
        value: "$620",
        meta: "ROAS 2.8"
    }
];

function KpiSummary(){

   

    return (
        <div className="kpi-summary">
            {
            kpis.map((kpi, index) => (
                    <KpiCard key={index} {...kpi} />
                    )
                )
            }
        </div>
  );

}

export default KpiSummary;