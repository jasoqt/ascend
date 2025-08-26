import React, { useState } from 'react';
import { CheckCircle, PieChart, BarChart2, Dumbbell, Calendar, User, Bell, Menu, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './styles/Home.css';
import Profile from './Profile';


const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock user data
  const userData = {
    name: 'Alex Johnson',
    dailyCalories: 2100,
    caloriesConsumed: 1450,
    caloriesRemaining: 650,
    waterIntake: 5,
    waterGoal: 8,
    steps: 7500,
    stepsGoal: 10000,
    nextWorkout: 'Upper Body Strength',
    workoutTime: '5:30 PM',
    meals: [
      { id: 1, name: 'Breakfast', calories: 450, time: '8:00 AM', items: ['Oatmeal with berries', 'Greek yogurt', 'Coffee'] },
      { id: 2, name: 'Lunch', calories: 620, time: '12:30 PM', items: ['Grilled chicken salad', 'Whole grain bread', 'Apple'] },
      { id: 3, name: 'Snack', calories: 180, time: '3:00 PM', items: ['Protein bar', 'Handful of almonds'] },
      { id: 4, name: 'Dinner', calories: 0, time: '7:00 PM', status: 'upcoming' }
    ],
    recentWorkouts: [
      { id: 1, name: 'Morning Run', calories: 320, duration: '30 min', date: 'Today' },
      { id: 2, name: 'Core Workout', calories: 210, duration: '20 min', date: 'Yesterday' },
      { id: 3, name: 'Leg Day', calories: 450, duration: '45 min', date: '2 days ago' }
    ],
    age: 28,
    weight: 75, // in kg
    height: 175, // in cm
    bmi: 24.5,
    goal: "Lose weight",
    macros: {
      carbs: 45, // percentages
      protein: 30,
      fats: 25
    },
    weeklyWorkouts: {
      completed: 2,
      goal: 3
    },
    weightHistory: [
      { date: '2025-08-17', weight: 76.2 },
      { date: '2025-08-19', weight: 75.8 },
      { date: '2025-08-21', weight: 75.5 },
      { date: '2025-08-23', weight: 75.0 }
    ],
    caloriesBurned: 420,
    workoutsToday: 1
  };

  const calculateProgress = (current, goal) => {
    return (current / goal) * 100;
  };

  const handleLogout = () => {
    // In a real app, handle logout logic here
    navigate('/');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="dashboard-content">
            {/* User Greeting & Profile Summary */}
            <div className="user-summary-card">
              <div className="greeting-section">
                <h2>Hello, {userData.name} 👋</h2>
                <p>Here's your health summary for today</p>
              </div>
              <div className="profile-stats">
                <div className="stat-item">
                  <label>Age</label>
                  <span>{userData.age} years</span>
                </div>
                <div className="stat-item">
                  <label>Weight</label>
                  <span>{userData.weight} kg</span>
                </div>
                <div className="stat-item">
                  <label>BMI</label>
                  <span>{userData.bmi}</span>
                </div>
                <div className="stat-item">
                  <label>Goal</label>
                  <span>{userData.goal}</span>
                </div>
              </div>
            </div>

            {/* Daily Progress Cards */}
            <div className="progress-summary">
              <div className="summary-card">
                <h3>Calories</h3>
                <div className="progress-container">
                  <div 
                    className="progress-bar" 
                    style={{ width: `${calculateProgress(userData.caloriesConsumed, userData.dailyCalories)}%` }}
                  ></div>
                </div>
                <div className="progress-stats">
                  <span>{userData.caloriesConsumed} / {userData.dailyCalories} kcal</span>
                  <button className="quick-add-btn">+ Add Meal</button>
                </div>
              </div>

              <div className="summary-card">
                <h3>Macronutrients</h3>
                <div className="macros-chart">
                  <div className="macro-bar">
                    <div style={{ width: `${userData.macros.carbs}%` }} className="carbs">
                      Carbs {userData.macros.carbs}%
                    </div>
                    <div style={{ width: `${userData.macros.protein}%` }} className="protein">
                      Protein {userData.macros.protein}%
                    </div>
                    <div style={{ width: `${userData.macros.fats}%` }} className="fats">
                      Fats {userData.macros.fats}%
                    </div>
                  </div>
                </div>
              </div>

              <div className="summary-card">
                <h3>Today's Activity</h3>
                <div className="activity-stats">
                  <div className="stat">
                    <span className="stat-value">{userData.caloriesBurned}</span>
                    <span className="stat-label">kcal burned</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{userData.workoutsToday}</span>
                    <span className="stat-label">workouts</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{userData.weeklyWorkouts.completed}/{userData.weeklyWorkouts.goal}</span>
                    <span className="stat-label">weekly target</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Weight Progress Chart */}
            <div className="dashboard-cards">
              <div className="card weight-progress">
                <div className="card-header">
                  <h2>Weight Progress</h2>
                  <div className="chart-controls">
                    <button className="chart-toggle active">Week</button>
                    <button className="chart-toggle">Month</button>
                  </div>
                </div>
                <div className="weight-chart">
                  {/* Add your preferred charting library here */}
                  <div className="placeholder-chart">
                    {userData.weightHistory.map((entry, index) => (
                      <div key={index} className="chart-point">
                        <span className="weight">{entry.weight}</span>
                        <span className="date">{entry.date}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Keep existing cards */}
              {/* ...existing meal and workout cards... */}
            </div>
          </div>
        );
      case 'nutrition':
        return <div className="placeholder-content"><h2>Nutrition</h2><p>Detailed nutrition tracking and meal planning coming soon.</p></div>;
      case 'workouts':
        return <div className="placeholder-content"><h2>Workouts</h2><p>Workout plans and exercise tracking coming soon.</p></div>;
      case 'progress':
        return <div className="placeholder-content"><h2>Progress</h2><p>Health metrics and progress charts coming soon.</p></div>;
      case 'profile':
        return <Profile userData={userData} />;
      default:
        return <div className="placeholder-content"><h2>Dashboard</h2></div>;
    }
  };

  return (
    <div className="home-container">
      {/* Sidebar */}
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
            <li className={activeTab === 'dashboard' ? 'active' : ''}>
              <button onClick={() => setActiveTab('dashboard')}>
                <PieChart size={20} />
                <span>Dashboard</span>
              </button>
            </li>
            <li className={activeTab === 'nutrition' ? 'active' : ''}>
              <button onClick={() => setActiveTab('nutrition')}>
                <BarChart2 size={20} />
                <span>Nutrition</span>
              </button>
            </li>
            <li className={activeTab === 'workouts' ? 'active' : ''}>
              <button onClick={() => setActiveTab('workouts')}>
                <Dumbbell size={20} />
                <span>Workouts</span>
              </button>
            </li>
            <li className={activeTab === 'progress' ? 'active' : ''}>
              <button onClick={() => setActiveTab('progress')}>
                <Calendar size={20} />
                <span>Progress</span>
              </button>
            </li>
            <li className={activeTab === 'profile' ? 'active' : ''}>
              <button onClick={() => setActiveTab('profile')}>
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

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>Welcome, {userData.name}</h1>
            <p>Let's achieve your health goals today!</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                <img src="/api/placeholder/40/40" alt="User Avatar" />
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <div className="content-area">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Home;