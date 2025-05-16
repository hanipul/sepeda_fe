import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';
import Signup from './Signup';

function RootApp() {
    return (
        <Router>
            <Routes>
                <Route path="/App" element={<App />} />
                <Route path="/Signup" element={<Signup />} />
            </Routes>
        </Router>
    );
}

export default RootApp;
