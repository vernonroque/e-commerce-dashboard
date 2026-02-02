import '../stylesheets/Sidebar.css'
import { NavLink } from "react-router-dom";

function Sidebar(){


return (
    <aside className="Sidebar">
        <h1>this is the sidebar section</h1>
        <NavLink to="/dashboard" end>
            Dashboard
        </NavLink>

        <NavLink to="/dashboard/revenue">
            Revenue
        </NavLink>

        <NavLink to="/dashboard/settings">
            Settings
        </NavLink>
    </aside>
  );

}



export default Sidebar;