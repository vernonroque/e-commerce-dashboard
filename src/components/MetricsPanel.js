import React, {useState, useEffect} from "react";
import '../stylesheets/MetricsPanel.css';
import apiFetch from '../services/apiFetch.js'

const metricsDataDemo = [
  { name: "NET PROFIT", value: "$25,000" },
  { name: "REVENUE", value: "$120,000" },
  { name: "AD SPEND", value: "$30,000" },
  { name: "CONTR MARGIN", value: "70%" },
  { name: "BLENDED ROAS", value: "4.0" },
  { name: "BREAKEVEN ROAS", value: "2.5" },
];


function MetricsPanel({dateRange,selStore}) {

  const [metrics, setMetrics] = useState({
        revenue: 0,
        netProfit: 0,
        adSpend: 0,
        contrMargin: 0,
        blendedROAS: 0,
        breakevenROAS: 0
  });

  // api call for revenue
  useEffect(() => {
      
      const fetchRevenue = async () => {
        if (!dateRange.startDate || !dateRange.endDate || !selStore) return;
        console.log("I am in the fetchRevenue effect");
        const baseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
        const path = '/api/metrics/revenue'
        // console.log("The dateRange in metrics panel is >>>", dateRange);
        // console.log("the dateRange start date type is >>>", typeof dateRange.startDate);
        const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
        const options = {
              method: "GET",
        }

        const apiEndpoint = `${baseUrl}${path}?${queries}`;
        
        const response = await apiFetch(apiEndpoint,options)

        if (!response) return;

        if (!response.ok) {
            console.log("Request failed:", response.status);
            return;
        }

        try{
            const jsonResponse = await response.json();
            console.log("This is the jsonResponse for revenue >>>", jsonResponse);
            setMetrics(prev => ({
              ...prev,
              revenue: jsonResponse["payload"].revenue
            }));

        }catch(error){
            console.log("there is an error >>>", error);
        }
      
      };

      fetchRevenue();

  },[selStore, dateRange]);

  // api call for adspend
  useEffect(() => {
      
      const fetchAdSpend = async () => {
        if (!dateRange.startDate || !dateRange.endDate || !selStore) return;

        console.log("I am in the fetchAdSpend effect");
        const baseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
        console.log("The base url in the fetchAdSpend function is >>>", baseUrl);
        const path = '/api/metrics/adspend'
        const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
        const options = {
              method: "GET",
        }

        const apiEndpoint = `${baseUrl}${path}?${queries}`;
        
        const response = await apiFetch(apiEndpoint,options)

        if (!response) return;

        if (!response.ok) {
            console.log("Request failed:", response.status);
            return;
        }

        try{
            const jsonResponse = await response.json();
            console.log("This is the jsonResponse adSpend >>>", jsonResponse);
            setMetrics(prev => ({
              ...prev,
              adSpend: jsonResponse['payload'].adspend
            }));

        }catch(error){
            console.log("there is an error >>>", error);
        }
      
      };

      fetchAdSpend();

  },[selStore, dateRange]);

  // api call for net profit
  useEffect(() => {
      
      const fetchNetProfit = async () => {
        if (!dateRange.startDate || !dateRange.endDate || !selStore) return;

        console.log("I am in the netProfit effect");
        const baseUrl = 'http://localhost:8080';
        console.log("The base url in the fetchNetProfit function is >>>", baseUrl);
        const path = '/api/metrics/net_profit'
        const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
        const options = {
              method: "GET",
        }

        const apiEndpoint = `${baseUrl}${path}?${queries}`;
        
        const response = await apiFetch(apiEndpoint,options)

        if (!response) return;

        if (!response.ok) {
            console.log("Request failed:", response.status);
            return;
        }

        try{
            const jsonResponse = await response.json();
            console.log("This is the jsonResponse netProfit >>>", jsonResponse);
            setMetrics(prev => ({
              ...prev,
              netProfit: jsonResponse['payload'].net_profit
            }));

        }catch(error){
            console.log("there is an error >>>", error);
        }
      
      };

      fetchNetProfit();

  },[selStore, dateRange]);

  // api call for contribution margin
  useEffect(() => {
      
      const fetchContrMargin = async () => {
        if (!dateRange.startDate || !dateRange.endDate || !selStore) return;

        console.log("I am in the contribution margin effect");
        const baseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
        const path = '/api/metrics/contribution_margin'
        const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
        const options = {
              method: "GET",
        }

        const apiEndpoint = `${baseUrl}${path}?${queries}`;
        
        const response = await apiFetch(apiEndpoint,options)

        if (!response) return;

        if (!response.ok) {
            console.log("Request failed:", response.status);
            return;
        }

        try{
            const jsonResponse = await response.json();
            console.log("This is the jsonResponse contrMargin >>>", jsonResponse);
            setMetrics(prev => ({
              ...prev,
              contrMargin: jsonResponse['payload'].contr_margin
            }));

        }catch(error){
            console.log("there is an error >>>", error);
        }
      
      };

      fetchContrMargin();

  },[selStore, dateRange]);

  // api call for blended return on ad spend
  useEffect(() => {
      
    const fetchBlendedROAS = async () => {
      if (!dateRange.startDate || !dateRange.endDate || !selStore) return;

      console.log("I am in the blended ROAS effect");
      const baseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
      const path = '/api/metrics/blended_roas'
      const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
      const options = {
            method: "GET",
      }

      const apiEndpoint = `${baseUrl}${path}?${queries}`;
      
      const response = await apiFetch(apiEndpoint,options)

      if (!response) return;

      if (!response.ok) {
          console.log("Request failed:", response.status);
          return;
      }

      try{
          const jsonResponse = await response.json();
          console.log("This is the jsonResponse blended ROAS >>>", jsonResponse);
          setMetrics(prev => ({
            ...prev,
            blendedROAS: jsonResponse['payload'].blended_roas
          }));

      }catch(error){
          console.log("there is an error >>>", error);
      }
    
    };

    fetchBlendedROAS();

  },[selStore, dateRange]);

  // api call for breakeven return on ad spend
  useEffect(() => {
      
    const fetchBreakevenROAS = async () => {

      if (!dateRange.startDate || !dateRange.endDate || !selStore) return;

      console.log("I am in the breakeven ROAS effect");
      const baseUrl = process.env.REACT_APP_BACKEND_ORIGIN;
      const path = '/api/metrics/breakeven_roas'
      const queries = `id=${selStore.id}&start=${dateRange.startDate}&end=${dateRange.endDate}`;
      const options = {
            method: "GET",
      }

      const apiEndpoint = `${baseUrl}${path}?${queries}`;
      
      const response = await apiFetch(apiEndpoint,options)

      if (!response) return;

      if (!response.ok) {
          console.log("Request failed:", response.status);
          return;
      }

      try{
          const jsonResponse = await response.json();
          console.log("This is the jsonResponse breakeven ROAS >>>", jsonResponse);
          setMetrics(prev => ({
            ...prev,
            breakevenROAS: jsonResponse['payload'].breakeven_roas
          }));

      }catch(error){
          console.log("there is an error >>>", error);
      }
    
    };

    fetchBreakevenROAS();

  },[selStore, dateRange]);

  console.log("the metrics object up to now >>>", metrics);
  const metricsData = [
    { name: "NET PROFIT", value: metrics.netProfit },
    { name: "REVENUE", value: metrics.revenue },
    { name: "AD SPEND", value: metrics.adSpend },
    { name: "CONTR MARGIN", value: `${metrics.contrMargin}%` },
    { name: "BLENDED ROAS", value: metrics.blendedROAS },
    { name: "BREAKEVEN ROAS", value: metrics.breakevenROAS }
  ];
  
  return (
    <div className="metrics-grid">
      {metricsData.map((m) => (
        <div key={m.name} className="metric-card">
          <div>{m.name}</div>
          <div className="value">{m.value}</div>
        </div>
      ))}
    </div>
  );
}

export default MetricsPanel;