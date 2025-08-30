import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './User/LandingPage';
import Login from './User/Login';
import SignUp from './User/SignUp';
import Home from './User/Home';
import Profile from './User/Profile';
import Nutrition from './User/Nutrition';
import Workouts from './User/Workouts';
import ProtectedRoute from './User/ProtectedRoute';

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route 
                    path="/home/*" 
                    element={
                        <ProtectedRoute>
                            <Home />
                        </ProtectedRoute>
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } 
                />
                <Route path="/nutrition" element={<Nutrition />} />
                <Route path="/workouts" element={<Workouts />} />
            </Routes>
        </Router>
    );
}

export default App;