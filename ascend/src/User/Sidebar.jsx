import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PieChart, BarChart2, Dumbbell, Calendar, User, LogOut, X } from 'lucide-react';
import './styles/Sidebar.css';

const Sidebar = ({ isMenuOpen, setIsMenuOpen, handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const getActiveTab = (path) => {
    return location.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMenuOpen(false);
  };

  return (
    <aside className={`sidebar ${isMenuOpen ? 'active' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <span className="logo-icon"></span>
          <span className="logo-text">Ascend</span>
        </div>
        <button className="close-menu" onClick={() => setIsMenuOpen(false)}>
          <X size={24} />
        </button>
      </div>
      
      <nav className="sidebar-nav">
        <ul>
          <li className={getActiveTab('/home') ? 'active' : ''}>
            <button onClick={() => handleNavigation('/home')}>
              <PieChart size={20} />
              <span>Dashboard</span>
            </button>
          </li>
          <li className={getActiveTab('/nutrition') ? 'active' : ''}>
            <button onClick={() => handleNavigation('/nutrition')}>
              <BarChart2 size={20} />
              <span>Nutrition</span>
            </button>
          </li>
          <li className={getActiveTab('/workouts') ? 'active' : ''}>
            <button onClick={() => handleNavigation('/workouts')}>
              <Dumbbell size={20} />
              <span>Workouts</span>
            </button>
          </li>

        {/* <li className={getActiveTab('/progress') ? 'active' : ''}>
            <button onClick={() => handleNavigation('/progress')}>
              <Calendar size={20} />
              <span>Progress</span>
            </button>
          </li> */}
          <li className={getActiveTab('/profile') ? 'active' : ''}>
            <button onClick={() => handleNavigation('/profile')}>
              <User size={20} />
              <span>Profile</span>
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;