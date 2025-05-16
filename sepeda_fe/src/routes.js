import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from './App';

function RootApp() {
    return (
        <Router>
            <Routes>
                <Route path="/App" element={<App />} />
            </Routes>
        </Router>
    );
}

export default RootApp;
