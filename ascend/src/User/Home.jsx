import React, { useState, useEffect } from 'react';
import { CheckCircle, Bell, Menu, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, signOut } from '../supabase';
import './styles/Home.css';
import Sidebar from './Sidebar';

const Home = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null); // <-- Added state for profile picture

  // Mock data that would eventually come from the database
  const [userData, setUserData] = useState({
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
  });

  useEffect(() => {
    // Get current user on component mount
    getCurrentUser();
    
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const loadProfilePicture = async (userId, bustCache = false) => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .list(`${userId}/`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) {
        console.error('Error loading profile picture:', error);
        return;
      }

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${userId}/${data[0].name}`);
        
        // Add cache busting parameter when needed
        let imageUrl = urlData.publicUrl;
        if (bustCache) {
          const separator = imageUrl.includes('?') ? '&' : '?';
          imageUrl = `${imageUrl}${separator}t=${Date.now()}`;
        }
        
        setProfilePictureUrl(imageUrl);
      } else {
        // No profile picture found
        setProfilePictureUrl(null);
      }
    } catch (err) {
      console.error('Unexpected error loading profile picture:', err);
    }
  };

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Error getting user:', error);
        navigate('/login');
        return;
      }

      if (!user) {
        navigate('/login');
        return;
      }

      setUser(user);
      
      // Load profile picture with cache busting on initial load
      await loadProfilePicture(user.id, true);
      
      // Get user profile from database
      await getUserProfile(user.id);
      
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
        console.log('User profile loaded:', data); // Debug log
      } else {
        console.log('No profile data found for user'); // Debug log
      }
    } catch (error) {
      console.error('Error in getUserProfile:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile) {
      const { first_name, middle_name, last_name, suffix } = userProfile;
      let name = '';
      
      if (first_name) name += first_name;
      if (middle_name) name += ` ${middle_name}`;
      if (last_name) name += ` ${last_name}`;
      if (suffix) name += ` ${suffix}`;
      
      const fullName = name.trim();
      if (fullName) {
        return fullName;
      }
    }
    
    // Fallback to email username if no profile name is available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const getFirstName = () => {
    if (userProfile && userProfile.first_name) {
      return userProfile.first_name;
    }
    
    // Fallback to email username if no profile name is available
    if (user?.email) {
      return user.email.split('@')[0];
    }
    
    return 'User';
  };

  const calculateProgress = (current, goal) => {
    return (current / goal) * 100;
  };

  const handleLogout = async () => {
    try {
      const { error } = await signOut();
      if (error) {
        console.error('Logout error:', error);
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="dashboard-content">
        {/* User Greeting & Profile Summary */}
        <div className="user-summary-card">
          <div className="greeting-section">
            <h2>Hello, {getFirstName()} 👋</h2>
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
        </div>
      </div>
    );
  };

  return (
    <div className="home-container">
      {/* Sidebar Component */}
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <main className="main-content">
        {/* Header */}
        <header className="header">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>Welcome, {getFirstName()}</h1>
            <p>Let's achieve your health goals today!</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {profilePictureUrl ? (
                    <img 
                      src={profilePictureUrl} 
                      alt="Profile" 
                      onError={(e) => {
                        console.error('Header avatar failed to load:', e.target.src);
                      }}
                      onLoad={() => {
                        console.log('Header avatar loaded successfully:', profilePictureUrl);
                      }}
                    />
                  ) : (
                    getDisplayName().charAt(0).toUpperCase()
                  )}
                </div>
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