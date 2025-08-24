import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './User/LandingPage';
import Login from './User/Login';
import SignUp from './User/SignUp';
import Home from './User/Home';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/home" element={<Home />} />
                {/* Add other routes as needed */}
            </Routes>
        </Router>
    );
}

export default App;