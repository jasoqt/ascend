import React from 'react';
import './styles/Profile.css';

const Profile = ({ userData }) => {
  return (
    <div className="content-area">
      <div className="dashboard-content">
        <h2>Profile</h2>
        
        <div className="profile-content">
          <div className="card profile-info">
            <div className="profile-info-container">
              <div className="profile-left">
                <div className="profile-header">
                  <div className="profile-avatar">
                    <img src="/api/placeholder/120/120" alt={`${userData.name}'s Avatar`} />
                  </div>
                  <h3>{userData.name}</h3>
                </div>
                
                <div className="profile-details">
                  <div className="detail-item">
                    <label>Age</label>
                    <span>{userData.age} years</span>
                  </div>
                  <div className="detail-item">
                    <label>Gender</label>
                    <span>{userData.gender}</span>
                  </div>
                  <div className="detail-item">
                    <label>Height</label>
                    <span>{userData.height} cm</span>
                  </div>
                  <div className="detail-item">
                    <label>Weight</label>
                    <span>{userData.weight} kg</span>
                  </div>
                  <div className="detail-item">
                    <label>Goal</label>
                    <span>{userData.fitnessGoal}</span>
                  </div>
                </div>
              </div>

              <div className="profile-right">
                <div className="profile-stats">
                  <div className="stat-item">
                    <label>Daily Calorie Goal</label>
                    <span>{userData.dailyCalories} kcal</span>
                  </div>
                  <div className="stat-item">
                    <label>Water Goal</label>
                    <span>{userData.waterGoal} glasses</span>
                  </div>
                  <div className="stat-item">
                    <label>Steps Goal</label>
                    <span>{userData.stepsGoal.toLocaleString()} steps</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="card profile-settings">
            <h3>Settings</h3>
            <p>Profile settings and preferences coming soon.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;