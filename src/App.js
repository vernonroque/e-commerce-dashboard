
import './App.css';
import {BrowserRouter as Router,Routes,Route} from 'react-router-dom';
import Dashboard from './components/Dashboard';

function App() {
  return (
    
    <Router>
        <div className = "App">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </div>
      
    </Router>
    
     
  );
}

export default App;
