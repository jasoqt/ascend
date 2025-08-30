import React, { useState, useEffect } from 'react';
import { Menu, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './styles/Workouts.css';
import Sidebar from './Sidebar';

const Workouts = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);

  // Mock workout data
  const [workoutData, setWorkoutData] = useState({
    todaysWorkout: {
      name: 'Upper Body Strength',
      time: '5:30 PM',
      duration: '45 min',
      exercises: [
        { name: 'Bench Press', sets: 4, reps: '10-12' },
        { name: 'Pull-ups', sets: 3, reps: '8-10' },
        { name: 'Shoulder Press', sets: 4, reps: '10-12' },
        { name: 'Bicep Curls', sets: 3, reps: '12-15' }
      ]
    },
    recentWorkouts: [
      { id: 1, name: 'Morning Run', calories: 320, duration: '30 min', date: 'Today' },
      { id: 2, name: 'Core Workout', calories: 210, duration: '20 min', date: 'Yesterday' },
      { id: 3, name: 'Leg Day', calories: 450, duration: '45 min', date: '2 days ago' }
    ],
    weeklyProgress: {
      completed: 2,
      goal: 4,
      totalMinutes: 95,
      totalCalories: 980
    }
  });

  useEffect(() => {
    getCurrentUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          navigate('/');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getCurrentUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        navigate('/login');
        return;
      }

      setUser(user);
      await loadProfilePicture(user.id, true);
      await getUserProfile(user.id);
      
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      navigate('/login');
    }
  };

  const loadProfilePicture = async (userId, bustCache = false) => {
    try {
      const { data, error } = await supabase.storage
        .from('profile-pictures')
        .list(`${userId}/`, {
          limit: 1,
          sortBy: { column: 'created_at', order: 'desc' }
        });

      if (error) throw error;

      if (data && data.length > 0) {
        const { data: urlData } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${userId}/${data[0].name}`);
        
        let imageUrl = urlData.publicUrl;
        if (bustCache) {
          const separator = imageUrl.includes('?') ? '&' : '?';
          imageUrl = `${imageUrl}${separator}t=${Date.now()}`;
        }
        
        setProfilePictureUrl(imageUrl);
      }
    } catch (err) {
      console.error('Error loading profile picture:', err);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) setUserProfile(data);
      
    } catch (error) {
      console.error('Error in getUserProfile:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.first_name) return userProfile.first_name;
    return user?.email?.split('@')[0] || 'User';
  };

  return (
    <div className="home-container">
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
      />

      <main className="main-content">
        <header className="header">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>Workouts</h1>
            <p>Track and manage your fitness journey</p>
          </div>
          <div className="header-actions">
            <button className="notification-btn">
              <Bell size={20} />
            </button>
            <div className="user-profile">
              <div className="user-avatar">
                <div className="avatar-placeholder">
                  {profilePictureUrl ? (
                    <img src={profilePictureUrl} alt="Profile" />
                  ) : (
                    getDisplayName().charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          <div className="dashboard-content">
            {/* Today's Workout */}
            <div className="workout-card">
              <div className="card-header">
                <h2>Today's Workout</h2>
                <span className="workout-time">{workoutData.todaysWorkout.time}</span>
              </div>
              <div className="workout-details">
                <h3>{workoutData.todaysWorkout.name}</h3>
                <p>Duration: {workoutData.todaysWorkout.duration}</p>
                <div className="exercise-list">
                  {workoutData.todaysWorkout.exercises.map((exercise, index) => (
                    <div key={index} className="exercise-item">
                      <span className="exercise-name">{exercise.name}</span>
                      <span className="exercise-sets">{exercise.sets} sets × {exercise.reps} reps</span>
                    </div>
                  ))}
                </div>
                <button className="start-workout-btn">Start Workout</button>
              </div>
            </div>

            {/* Weekly Progress */}
            <div className="progress-summary">
              <div className="summary-card">
                <h3>Weekly Progress</h3>
                <div className="progress-stats">
                  <div className="stat">
                    <span className="stat-value">
                      {workoutData.weeklyProgress.completed}/{workoutData.weeklyProgress.goal}
                    </span>
                    <span className="stat-label">Workouts</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{workoutData.weeklyProgress.totalMinutes}</span>
                    <span className="stat-label">Minutes</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{workoutData.weeklyProgress.totalCalories}</span>
                    <span className="stat-label">Calories</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Workouts */}
            <div className="recent-workouts-section">
              <div className="card-header">
                <h2>Recent Workouts</h2>
                <button className="view-all">View All</button>
              </div>
              <div className="recent-workouts-list">
                {workoutData.recentWorkouts.map((workout) => (
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
      </main>
    </div>
  );
};

export default Workouts;