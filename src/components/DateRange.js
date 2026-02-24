import { useState, useEffect } from "react";
import '../stylesheets/DateRange.css'
import {getDateRange} from '../utils/dateRange';

function DateRange({ onChange }) {
  const [range, setRange] = useState("last_30_days");

  const handleChange = (e) => {
    const selected = e.target.value;
    setRange(selected);

    const { startDate, endDate } = getDateRange(selected);
    onChange({ startDate, endDate });
  };

  return (
    <select value={range} onChange={handleChange}>
      <option value="today">Today</option>
      <option value="yesterday">Yesterday</option>
      <option value="last_7_days">Last 7 Days</option>
      <option value="last_30_days">Last 30 Days</option>
      <option value="this_month">This Month</option>
      <option value="last_month">Last Month</option>
    </select>
  );
}

export default DateRange;