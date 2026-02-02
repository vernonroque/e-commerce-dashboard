import '../stylesheets/Dashboard.css'
import Sidebar from './Sidebar.js';
import Navbar from './Navbar.js';
import MainContent from './MainContent.js';

function Dashboard() {
    return (
        <div className="dashboardContent">
            <Navbar />

            <div className="dashboardBody">
                <Sidebar />
                <MainContent />
            </div>
        </div>
    );
}

export default Dashboard;