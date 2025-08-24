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
    ]
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
                  <span>{userData.caloriesRemaining} left</span>
                </div>
              </div>
              
              <div className="summary-card">
                <h3>Water</h3>
                <div className="progress-container">
                  <div 
                    className="progress-bar water-progress" 
                    style={{ width: `${calculateProgress(userData.waterIntake, userData.waterGoal)}%` }}
                  ></div>
                </div>
                <div className="progress-stats">
                  <span>{userData.waterIntake} / {userData.waterGoal} glasses</span>
                  <span>{userData.waterGoal - userData.waterIntake} to go</span>
                </div>
              </div>
              
              <div className="summary-card">
                <h3>Steps</h3>
                <div className="progress-container">
                  <div 
                    className="progress-bar steps-progress" 
                    style={{ width: `${calculateProgress(userData.steps, userData.stepsGoal)}%` }}
                  ></div>
                </div>
                <div className="progress-stats">
                  <span>{userData.steps.toLocaleString()} / {userData.stepsGoal.toLocaleString()}</span>
                  <span>{(userData.stepsGoal - userData.steps).toLocaleString()} to go</span>
                </div>
              </div>
            </div>
            
            <div className="dashboard-cards">
              <div className="card today-meals">
                <div className="card-header">
                  <h2>Today's Meals</h2>
                  <a href="#" className="view-all">View all</a>
                </div>
                <div className="meals-list">
                  {userData.meals.map(meal => (
                    <div key={meal.id} className={`meal-item ${meal.status === 'upcoming' ? 'upcoming' : ''}`}>
                      <div className="meal-info">
                        <h3>{meal.name}</h3>
                        <p>{meal.time}</p>
                      </div>
                      <div className="meal-calories">
                        {meal.status === 'upcoming' ? (
                          <button className="log-meal-btn">Log meal</button>
                        ) : (
                          <>
                            <span>{meal.calories}</span>
                            <span className="calorie-unit">kcal</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="card upcoming-workouts">
                <div className="card-header">
                  <h2>Upcoming Workout</h2>
                  <a href="#" className="view-all">View plan</a>
                </div>
                <div className="workout-preview">
                  <div className="workout-info">
                    <h3>{userData.nextWorkout}</h3>
                    <p>Today at {userData.workoutTime}</p>
                  </div>
                  <button className="start-workout-btn">
                    Start
                  </button>
                </div>
                <div className="recent-workouts">
                  <h3>Recent Activity</h3>
                  <div className="recent-workouts-list">
                    {userData.recentWorkouts.map(workout => (
                      <div key={workout.id} className="recent-workout-item">
                        <div className="workout-details">
                          <h4>{workout.name}</h4>
                          <p>{workout.date}</p>
                        </div>
                        <div className="workout-stats">
                          <span>{workout.calories} kcal</span>
                          <span>{workout.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
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