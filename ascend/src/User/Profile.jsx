import React, { useState, useEffect, useRef } from 'react';
import { User, Edit, Save, X, Bell, Menu, Camera, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase, getSupabaseErrorMessage, signOut } from '../supabase';
import Sidebar from './Sidebar';
import './styles/Profile.css';

const Profile = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Calculate age from birthday
  const calculateAge = (birthday) => {
    if (!birthday) return 'N/A';
    
    const birthDate = new Date(birthday);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  // Load profile picture from Supabase Storage with cache busting
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

  // Handle profile picture upload with improved error handling and cache management
  const handleProfilePictureUpload = async (file) => {
    if (!file || !user) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('Image size must be less than 5MB');
      return;
    }

    setUploadingPicture(true);
    setError('');
    setSuccessMessage('');

    try {
      // First, delete all existing profile pictures
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('profile-pictures')
        .list(`${user.id}/`);

      if (listError) {
        console.error('Error listing existing files:', listError);
      } else if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles.map(file => `${user.id}/${file.name}`);
        const { error: deleteError } = await supabase.storage
          .from('profile-pictures')
          .remove(filesToDelete);
        
        if (deleteError) {
          console.error('Error deleting existing files:', deleteError);
        }
      }

      // Generate a unique filename with timestamp to avoid caching issues
      const fileExt = file.name.split('.').pop().toLowerCase();
      const timestamp = Date.now();
      const fileName = `profile_${timestamp}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload new profile picture with explicit cache control
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(filePath, file, {
          cacheControl: '0', // Disable caching for immediate updates
          upsert: false // Don't upsert to ensure we get a new file
        });

      if (uploadError) {
        console.error('Upload error:', uploadError);
        setError(`Failed to upload profile picture: ${uploadError.message}`);
        return;
      }

      console.log('Upload successful:', uploadData);

      // Wait a moment for the upload to be fully processed
      await new Promise(resolve => setTimeout(resolve, 500));

      // Get the public URL for the new image
      const { data: urlData } = supabase.storage
        .from('profile-pictures')
        .getPublicUrl(filePath);

      // Add cache busting parameter to ensure fresh load
      const imageUrl = `${urlData.publicUrl}?t=${timestamp}`;
      
      console.log('New profile picture URL:', imageUrl);
      
      // Update the profile picture URL state
      setProfilePictureUrl(imageUrl);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      setSuccessMessage('Profile picture updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);

    } catch (err) {
      console.error('Unexpected error uploading profile picture:', err);
      setError('An unexpected error occurred while uploading');
    } finally {
      setUploadingPicture(false);
    }
  };

  // Handle file input change
  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleProfilePictureUpload(file);
    }
  };

  // Trigger file input click
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  // Fetch user and profile data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          setError('Failed to fetch user data');
          return;
        }

        if (user) {
          setUser(user);

          // Load profile picture with cache busting on initial load
          await loadProfilePicture(user.id, true);

          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('user_profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
          } else if (profileData) {
            setProfile(profileData);
            setEditData({
              first_name: profileData.first_name || '',
              middle_name: profileData.middle_name || '',
              last_name: profileData.last_name || '',
              suffix: profileData.suffix || '',
              sex: profileData.sex || '',
              birthday: profileData.birthday || '',
              height: profileData.height || '',
              weight: profileData.weight || ''
            });
          } else {
            // No profile found, initialize with empty data
            const initialData = {
              first_name: user.user_metadata?.first_name || '',
              middle_name: '',
              last_name: user.user_metadata?.last_name || '',
              suffix: '',
              sex: '',
              birthday: '',
              height: '',
              weight: ''
            };
            setEditData(initialData);
          }
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    // Only allow changes to height and weight
    if (name === 'height' || name === 'weight') {
      setEditData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      // Validate height and weight values
      const height = parseFloat(editData.height);
      const weight = parseFloat(editData.weight);

      if (editData.height && (isNaN(height) || height < 50 || height > 300)) {
        setError('Height must be between 50 and 300 cm');
        setSaving(false);
        return;
      }

      if (editData.weight && (isNaN(weight) || weight < 20 || weight > 500)) {
        setError('Weight must be between 20 and 500 kg');
        setSaving(false);
        return;
      }

      const updateData = {
        height: editData.height ? parseFloat(editData.height) : null,
        weight: editData.weight ? parseFloat(editData.weight) : null,
        updated_at: new Date().toISOString()
      };

      let result;
      if (profile) {
        // Update existing profile
        result = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id)
          .select()
          .single();
      } else {
        // Create new profile
        result = await supabase
          .from('user_profiles')
          .insert([{
            id: user.id,
            ...updateData
          }])
          .select()
          .single();
      }

      if (result.error) {
        console.error('Profile update error:', result.error);
        setError(getSupabaseErrorMessage(result.error));
      } else {
        setProfile(result.data);
        setSuccessMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (err) {
      console.error('Unexpected error updating profile:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  // Modify the cancelEdit function
  const cancelEdit = () => {
    setIsEditing(false);
    setError('');
    
    // Reset only height and weight to current profile data
    if (profile) {
      setEditData(prev => ({
        ...prev,
        height: profile.height || '',
        weight: profile.weight || ''
      }));
    }
  };

  // Add handleLogout function
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
      <div className="content-area">
        <div className="dashboard-content">
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: '300px',
            flexDirection: 'column'
          }}>
            <div style={{ 
              width: '40px', 
              height: '40px', 
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #3498db',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <p style={{ marginTop: '20px', color: '#666' }}>
              Loading profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  const displayName = profile 
    ? `${profile.first_name || ''} ${profile.middle_name ? profile.middle_name + ' ' : ''}${profile.last_name || ''}${profile.suffix ? ' ' + profile.suffix : ''}`.trim()
    : user?.email || 'User';

  const age = profile ? calculateAge(profile.birthday) : 'N/A';

  return (
    <div className="home-container">
      <Sidebar 
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        handleLogout={handleLogout}
      />

      <main className="main-content">
        <header className="header">
          <button className="menu-toggle" onClick={() => setIsMenuOpen(true)}>
            <Menu size={24} />
          </button>
          <div className="header-title">
            <h1>Profile Settings</h1>
            <p>Manage your personal information</p>
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
                        // Don't set to null here to avoid infinite loops
                      }}
                      onLoad={() => {
                        console.log('Header avatar loaded successfully:', profilePictureUrl);
                      }}
                    />
                  ) : (
                    user?.email?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          style={{ display: 'none' }}
        />

        {/* Your existing Profile content */}
        <div className="content-area">
          <div className="dashboard-content">
            <div className="profile-header-container">
              <h2>Profile</h2>
              {!isEditing ? (
                <button 
                  className="edit-profile-btn"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit size={16} />
                  Edit Profile
                </button>
              ) : (
                <div className="profile-actions">
                  <button 
                    className="save-profile-btn"
                    onClick={handleUpdateProfile}
                    disabled={saving}
                  >
                    <Save size={16} />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                  <button 
                    className="cancel-edit-btn"
                    onClick={cancelEdit}
                    disabled={saving}
                  >
                    <X size={16} />
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="alert alert-error">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="alert alert-success">
                {successMessage}
              </div>
            )}
            
            <div className="profile-content">
              <div className="card profile-info">
                <div className="profile-info-container">
                  <div className="profile-left">
                    <div className="profile-avatar-section">
                      <div className="profile-avatar-container">
                        <div className="profile-avatar large">
                          {profilePictureUrl ? (
                            <img 
                              src={profilePictureUrl} 
                              alt="Profile" 
                              onError={(e) => {
                                console.error('Main avatar failed to load:', e.target.src);
                                // Don't set to null here to avoid infinite loops
                              }}
                              onLoad={() => {
                                console.log('Main avatar loaded successfully:', profilePictureUrl);
                              }}
                            />
                          ) : (
                            <User size={64} />
                          )}
                          {uploadingPicture && (
                            <div className="upload-overlay">
                              <div className="upload-spinner"></div>
                            </div>
                          )}
                        </div>
                        <button 
                          className="change-picture-btn"
                          onClick={triggerFileUpload}
                          disabled={uploadingPicture}
                        >
                          {uploadingPicture ? (
                            <>
                              <Upload size={16} className="spinning" />
                              Uploading...
                            </>
                          ) : (
                            <>
                              <Camera size={16} />
                              Change Picture
                            </>
                          )}
                        </button>
                      </div>
                      <div className="profile-name-info">
                        <h3>{displayName}</h3>
                        <p>{user?.email}</p>
                      </div>
                    </div>
                    
                    <div className="profile-details">
                      <div className="details-grid">
                        {/* Name Fields Row - Always read-only */}
                        <div className="detail-item">
                          <label>First Name</label>
                          <span>{profile?.first_name || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Middle Name</label>
                          <span>{profile?.middle_name || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Last Name</label>
                          <span>{profile?.last_name || 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Suffix</label>
                          <span>{profile?.suffix || 'Not specified'}</span>
                        </div>

                        {/* Personal Info Row - Always read-only */}
                        <div className="detail-item">
                          <label>Gender</label>
                          <span>{profile?.sex ? profile.sex.charAt(0).toUpperCase() + profile.sex.slice(1) : 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Birthday</label>
                          <span>{profile?.birthday ? new Date(profile.birthday).toLocaleDateString() : 'Not specified'}</span>
                        </div>
                        <div className="detail-item">
                          <label>Age</label>
                          <span>{age} years</span>
                        </div>

                        {/* Physical Info Row - Only these remain editable */}
                        <div className="detail-item">
                          <label>Height (cm)</label>
                          {!isEditing ? (
                            <span>{profile?.height ? `${profile.height} cm` : 'Not specified'}</span>
                          ) : (
                            <input
                              type="number"
                              name="height"
                              value={editData.height}
                              onChange={handleEditChange}
                              placeholder="Enter height in cm"
                              min="50"
                              max="300"
                              step="0.1"
                              className="inline-input"
                            />
                          )}
                        </div>
                        <div className="detail-item">
                          <label>Weight (kg)</label>
                          {!isEditing ? (
                            <span>{profile?.weight ? `${profile.weight} kg` : 'Not specified'}</span>
                          ) : (
                            <input
                              type="number"
                              name="weight"
                              value={editData.weight}
                              onChange={handleEditChange}
                              placeholder="Enter weight in kg"
                              min="20"
                              max="500"
                              step="0.1"
                              className="inline-input"
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="profile-right">
                    <div className="profile-stats">
                      <div className="stat-item">
                        <label>Account Created</label>
                        <span>{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="stat-item">
                        <label>Email Verified</label>
                        <span>{user?.email_confirmed_at ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="stat-item">
                        <label>Profile Updated</label>
                        <span>{profile?.updated_at ? new Date(profile.updated_at).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }

            @keyframes spinning {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
            
            .profile-actions {
              display: flex;
              gap: 0.5rem;
            }
            
            .edit-profile-btn:hover,
            .save-profile-btn:hover,
            .cancel-edit-btn:hover {
              opacity: 0.9;
            }

            .profile-avatar-container {
              position: relative;
              display: flex;
              flex-direction: column;
              align-items: center;
              gap: 1rem;
            }

            .profile-avatar.large {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: var(--bg-light);
              border: 3px solid var(--border-color);
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              overflow: hidden;
            }

            .profile-avatar.large img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }

            .user-avatar img {
              width: 100%;
              height: 100%;
              object-fit: cover;
              border-radius: 50%;
            }

            .upload-overlay {
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              border-radius: 50%;
            }

            .upload-spinner {
              width: 24px;
              height: 24px;
              border: 2px solid #ffffff;
              border-top: 2px solid transparent;
              border-radius: 50%;
              animation: spin 1s linear infinite;
            }

            .change-picture-btn {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.5rem 1rem;
              background: var(--primary-color);
              color: white;
              border: none;
              border-radius: var(--radius-sm, 4px);
              cursor: pointer;
              font-size: 0.875rem;
              transition: all 0.2s ease;
            }

            .change-picture-btn:hover:not(:disabled) {
              background: var(--primary-dark);
              transform: translateY(-1px);
            }

            .change-picture-btn:disabled {
              opacity: 0.7;
              cursor: not-allowed;
            }

            .spinning {
              animation: spinning 1s linear infinite;
            }
            
            .inline-input {
              width: 100%;
              padding: 0.5rem;
              border: 1px solid var(--border-color);
              border-radius: var(--radius-sm, 4px);
              background-color: var(--bg-card);
              color: var(--text-dark);
              font-size: 1rem;
              font-weight: 600;
              transition: border-color 0.2s ease;
            }
            
            .inline-input:focus {
              outline: none;
              border-color: var(--primary-color);
            }
            
            .inline-input::placeholder {
              font-weight: normal;
              font-size: 0.9rem;
              color: var(--text-light);
            }

            .alert {
              padding: 1rem;
              border-radius: var(--radius-sm, 4px);
              margin-bottom: 1rem;
              font-weight: 500;
            }

            .alert-error {
              background: #fee;
              color: #c53030;
              border: 1px solid #fed7d7;
            }

            .alert-success {
              background: #f0fff4;
              color: #22543d;
              border: 1px solid #c6f6d5;
            }
          `}</style>
        </div>
      </main>
    </div>
  );
};

export default Profile;