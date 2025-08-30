import React, { useState, useEffect } from 'react';
import { Bell, Menu, Search, X, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabase';
import './styles/Home.css';
import './styles/Nutrition.css';
import Sidebar from './Sidebar';
import fatSecretApi from '../shared/services/fatSecretApi';
import ManualFoodInput from './ManualFoodInput';

const Nutrition = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profilePictureUrl, setProfilePictureUrl] = useState(null);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedFood, setSelectedFood] = useState(null);
  const [isManualInput, setIsManualInput] = useState(false);

  // New state variables
  const [isMealSelectionOpen, setIsMealSelectionOpen] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const [servingSize, setServingSize] = useState(100);
  const [isMealEntriesModalOpen, setIsMealEntriesModalOpen] = useState(false);

  // Mock nutrition data
const [nutritionData, setNutritionData] = useState({
  dailyCalories: 2100,
  caloriesConsumed: 0,
  caloriesRemaining: 2100,
  meals: [
    { id: 1, name: 'Breakfast', calories: 0, time: '8:00 AM', items: [] },
    { id: 2, name: 'Lunch', calories: 0, time: '12:30 PM', items: [] },
    { id: 3, name: 'Snack', calories: 0, time: '3:00 PM', items: [] },
    { id: 4, name: 'Dinner', calories: 0, time: '7:00 PM', items: [] }
  ],
  macros: {
    carbs: 45,
    protein: 30,
    fats: 25
  }
});

  const [mealPlans, setMealPlans] = useState([
    {
      id: 1,
      name: 'Weight Loss Plan',
      calories: 1800,
      meals: [
        { name: 'Breakfast', suggestion: 'Oatmeal with protein powder', calories: 350 },
        { name: 'Lunch', suggestion: 'Grilled chicken salad', calories: 450 },
        { name: 'Dinner', suggestion: 'Baked salmon with vegetables', calories: 550 }
      ]
    },
    {
      id: 2,
      name: 'Muscle Gain Plan',
      calories: 2800,
      meals: [
        { name: 'Breakfast', suggestion: 'Protein pancakes with eggs', calories: 600 },
        { name: 'Lunch', suggestion: 'Turkey rice bowl', calories: 700 },
        { name: 'Dinner', suggestion: 'Steak with sweet potato', calories: 800 }
      ]
    }
  ]);

  const [foodDatabase, setFoodDatabase] = useState([
    { id: 1, name: 'Oatmeal', calories: 150, carbs: 27, protein: 6, fats: 3 },
    { id: 2, name: 'Chicken Breast', calories: 165, carbs: 0, protein: 31, fats: 3.6 },
    { id: 3, name: 'Sweet Potato', calories: 103, carbs: 24, protein: 2, fats: 0 }
  ]);

useEffect(() => {
  getCurrentUser();
}, []);

useEffect(() => {
  if (user) {
    fetchTodaysMeals();
  }
}, [user]); // Add this useEffect

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
      await loadProfilePicture(user.id, true);
      await getUserProfile(user.id);
      
    } catch (error) {
      console.error('Error in getCurrentUser:', error);
      navigate('/login');
    } finally {
      setLoading(false);
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

      if (error) {
        console.error('Error loading profile picture:', error);
        return;
      }

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
      console.error('Unexpected error loading profile picture:', err);
    }
  };

  const getUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      if (data) {
        setUserProfile(data);
      }
    } catch (error) {
      console.error('Error in getUserProfile:', error);
    }
  };

  const getDisplayName = () => {
    if (userProfile?.first_name) {
      return userProfile.first_name;
    }
    return user?.email ? user.email.split('@')[0] : 'User';
  };

  const calculateProgress = (current, goal) => {
    return (current / goal) * 100;
  };

  // Update the searchFoodItems function
 const searchFoodItems = async (query) => {
  try {
    const results = await fatSecretApi.searchFood(query);
    if (results?.foods?.food) {
      const foods = Array.isArray(results.foods.food) 
        ? results.foods.food 
        : [results.foods.food];
      
      const transformedResults = foods.map(food => {
        // Extract the numeric calories value
        const caloriesMatch = food.food_description.split('|')[0].match(/\d+/);
        const calories = caloriesMatch ? parseInt(caloriesMatch[0]) : 0;
        
        return {
          id: food.food_id,
          name: food.food_name,
          calories: calories,
          carbs: parseFloat(food.food_description.match(/Carbs: ([\d.]+)g/)?.[1] || '0'),
          protein: parseFloat(food.food_description.match(/Prot: ([\d.]+)g/)?.[1] || '0'),
          fats: parseFloat(food.food_description.match(/Fat: ([\d.]+)g/)?.[1] || '0'),
          imageUrl: food.food_image || `https://via.placeholder.com/150?text=${encodeURIComponent(food.food_name)}`
        };
      });

      setSearchResults(transformedResults);
    } else {
      setSearchResults([]);
    }
  } catch (error) {
    console.error('Error searching foods:', error);
    setSearchResults([]);
  }
};
  // Add a function to fetch food details
  const fetchFoodDetails = async (foodId) => {
    try {
      const details = await fatSecretApi.getFoodDetails(foodId);
      if (details?.food) {
        const food = details.food;
        setSelectedFood({
          ...food,
          id: food.food_id,
          name: food.food_name,
          calories: food.calories,
          carbs: food.carbohydrate,
          protein: food.protein,
          fats: food.fat,
          imageUrl: food.food_image || `https://via.placeholder.com/150?text=${encodeURIComponent(food.food_name)}`
        });
      }
    } catch (error) {
      console.error('Error fetching food details:', error);
    }
  };

  // Update the handleSearch function to include debouncing
  const [searchTimeout, setSearchTimeout] = useState(null);

  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Clear any existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Set new timeout
    const timeoutId = setTimeout(() => {
      if (query.length >= 2) {
        searchFoodItems(query);
      } else {
        setSearchResults([]);
      }
    }, 500); // Wait 500ms after user stops typing

    setSearchTimeout(timeoutId);
  };

  // New functions for meal selection
  const handleAddToMeals = () => {
    setIsMealSelectionOpen(true);
  };

const handleMealSelection = async (mealType) => {
  try {
    if (!user || !selectedFood) return;

    // First, insert the food entry
    const foodEntry = {
      user_id: user.id,
      date: new Date().toISOString().split('T')[0],
      food_id: selectedFood.id.toString(),
      food_name: selectedFood.name,
      serving_size: servingSize,
      calories: Math.round(selectedFood.calories * (servingSize / 100)), // Make sure calories is a number
      protein: Math.round((selectedFood.protein || 0) * (servingSize / 100)),
      carbs: Math.round((selectedFood.carbs || 0) * (servingSize / 100)),
      fat: Math.round((selectedFood.fats || 0) * (servingSize / 100)),
      serving_description: `${servingSize}g`
    };

    console.log('Adding food entry:', foodEntry); // Debug log

    const { data: foodData, error: foodError } = await supabase
      .from('food_entries')
      .insert([foodEntry])
      .select()
      .single();

    if (foodError) {
      console.error('Food entry error:', foodError);
      throw foodError;
    }

    // Get the meal type ID
    const { data: mealTypeData, error: mealTypeError } = await supabase
      .from('meal_types')
      .select('id')
      .eq('name', mealType)
      .single();

    if (mealTypeError) {
      console.error('Meal type error:', mealTypeError);
      throw mealTypeError;
    }

    // Create the user meal entry
    const mealEntry = {
      user_id: user.id,
      meal_type_id: mealTypeData.id,
      food_entry_id: foodData.id,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0]
    };

    const { error: mealError } = await supabase
      .from('user_meals')
      .insert([mealEntry]);

    if (mealError) {
      console.error('Meal entry error:', mealError);
      throw mealError;
    }

    // Refresh the meals display
    await fetchTodaysMeals();

    setIsMealSelectionOpen(false);
    setSelectedFood(null);
    setSearchQuery(''); // Clear search query
    setSearchResults([]); // Clear search results
    
    alert('Food added successfully!');

  } catch (error) {
    console.error('Error adding food to meals:', error);
    alert('Failed to add food to meals: ' + error.message);
  }
};
const fetchTodaysMeals = async () => {
  try {
    const today = new Date().toISOString().split('T')[0];
    console.log('Fetching meals for date:', today);
    
    // First, let's get all meal entries for today
    const { data: mealEntries, error } = await supabase
      .from('user_meals')
      .select(`
        id,
        meal_types (
          id,
          name,
          default_time
        ),
        food_entries (
          id,
          food_name,
          calories,
          serving_size,
          protein,
          carbs,
          fat
        )
      `)
      .eq('user_id', user.id)
      .eq('date', today);

    if (error) {
      console.error('Supabase query error:', error);
      throw error;
    }

    // Initialize meals with default structure
    const updatedMeals = [
      { id: 1, name: 'Breakfast', calories: 0, time: '8:00 AM', items: [], entries: [] },
      { id: 2, name: 'Lunch', calories: 0, time: '12:30 PM', items: [], entries: [] },
      { id: 3, name: 'Snack', calories: 0, time: '3:00 PM', items: [], entries: [] },
      { id: 4, name: 'Dinner', calories: 0, time: '7:00 PM', items: [], entries: [] }
    ];

    // Process each meal entry
    if (mealEntries && mealEntries.length > 0) {
      mealEntries.forEach(entry => {
        const mealIndex = updatedMeals.findIndex(
          meal => meal.name.toLowerCase() === entry.meal_types.name.toLowerCase()
        );

        if (mealIndex !== -1 && entry.food_entries) {
          const meal = updatedMeals[mealIndex];
          meal.calories += Math.round(entry.food_entries.calories);
          meal.items.push(
            `${entry.food_entries.food_name} (${entry.food_entries.serving_size}g)`
          );
          // Store the IDs needed for deletion
          meal.entries.push({
            mealEntryId: entry.id,
            foodEntryId: entry.food_entries.id
          });
        }
      });
    }

    // Update state with new data
    setNutritionData(prev => ({
      ...prev,
      meals: updatedMeals,
      caloriesConsumed: updatedMeals.reduce((sum, meal) => sum + meal.calories, 0),
      caloriesRemaining: prev.dailyCalories - updatedMeals.reduce((sum, meal) => sum + meal.calories, 0)
    }));

  } catch (error) {
    console.error('Error fetching meals:', error);
  }
};
// Add delete meal entry function
const deleteMealEntry = async (mealEntryId, foodEntryId) => {
  try {
    if (!user) return;

    // Show confirmation dialog
    if (!window.confirm('Are you sure you want to delete this meal entry?')) {
      return;
    }

    // Delete the user meal entry first
    const { error: mealError } = await supabase
      .from('user_meals')
      .delete()
      .eq('id', mealEntryId)
      .eq('user_id', user.id); // Extra security check

    if (mealError) {
      console.error('Error deleting meal entry:', mealError);
      throw mealError;
    }

    // Delete the associated food entry
    const { error: foodError } = await supabase
      .from('food_entries')
      .delete()
      .eq('id', foodEntryId)
      .eq('user_id', user.id); // Extra security check

    if (foodError) {
      console.error('Error deleting food entry:', foodError);
      throw foodError;
    }

    // Refresh the meals display
    await fetchTodaysMeals();
    
    alert('Meal entry deleted successfully!');

  } catch (error) {
    console.error('Error deleting meal entry:', error);
    alert('Failed to delete meal entry: ' + error.message);
  }
};

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading nutrition data...</p>
      </div>
    );
  }

  const renderContent = () => {
    return (
      <div className="dashboard-content">
        <div className="user-summary-card">
          <div className="greeting-section">
            <h2>Nutrition Overview</h2>
            <p>Track your daily nutrition and meals</p>
          </div>
        </div>

        {/* Calories and Macros Summary */}
        <div className="progress-summary">
          <div className="summary-card">
            <h3>Daily Calories</h3>
            <div className="progress-container">
              <div 
                className="progress-bar" 
                style={{ width: `${calculateProgress(nutritionData.caloriesConsumed, nutritionData.dailyCalories)}%` }}
              ></div>
            </div>
            <div className="progress-stats">
              <span>{nutritionData.caloriesConsumed} / {nutritionData.dailyCalories} kcal</span>
              <button className="quick-add-btn" onClick={() => setIsAddFoodModalOpen(true)}>+ Add Food</button>
            </div>
          </div>

          <div className="summary-card">
            <h3>Macronutrients</h3>
            <div className="macros-chart">
              <div className="macro-bar">
                <div style={{ width: `${nutritionData.macros.carbs}%` }} className="carbs">
                  Carbs {nutritionData.macros.carbs}%
                </div>
                <div style={{ width: `${nutritionData.macros.protein}%` }} className="protein">
                  Protein {nutritionData.macros.protein}%
                </div>
                <div style={{ width: `${nutritionData.macros.fats}%` }} className="fats">
                  Fats {nutritionData.macros.fats}%
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Today's Meals Section */}
        <div className="dashboard-cards">
          <div className="card">
            <div className="card-header">
              <h2>Today's Meals</h2>
              <button className="view-all" onClick={() => setIsMealEntriesModalOpen(true)}>View All</button>
            </div>
          {/* Today's Meals Section */}
<div className="meals-list">
  {nutritionData.meals.map((meal) => (
    <div key={meal.id} className={`meal-item ${!meal.items.length ? 'empty' : ''}`}>
      <div className="meal-info">
        <h3>{meal.name}</h3>
        <p>{meal.time}</p>
      </div>
      <div className="meal-calories">
        <span>{meal.calories}</span>
        <span className="calorie-unit">kcal</span>
      </div>
    </div>
  ))}
</div>
          </div>
        </div>
{/* Add Food Modal */}
{isAddFoodModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content">
      <div className="modal-header">
        <h2>Add Food</h2>
        <button 
          className="modal-close"
          onClick={() => setIsAddFoodModalOpen(false)}
        >
          <X size={24} />
        </button>
      </div>

      <div className="search-type-switch">
        <button 
          className={`switch-button ${!isManualInput ? 'active' : ''}`}
          onClick={() => setIsManualInput(false)}
        >
          Search Food
        </button>
        <button 
          className={`switch-button ${isManualInput ? 'active' : ''}`}
          onClick={() => setIsManualInput(true)}
        >
          Manual Input
        </button>
      </div>

      {isManualInput ? (
        <ManualFoodInput 
          onAddFood={(foodData) => {
            setSelectedFood(foodData);
            setIsAddFoodModalOpen(false);
          }}
          onClose={() => setIsAddFoodModalOpen(false)}
        />
      ) : (
        <>
          <div className="search-container">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search foods..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="search-input"
            />
          </div>
          <div className="search-results">
            {(searchQuery ? searchResults : foodDatabase).map((food) => (
              <div key={food.id} className="search-result-item">
                <div className="food-info" onClick={() => {
                  setSelectedFood(food);
                  setIsAddFoodModalOpen(false);
                }}>
                  <h3>{food.name}</h3>
                  <p>{food.calories} kcal</p>
                </div>
                <div className="food-macros">
                  <span>C: {food.carbs}g</span>
                  <span>P: {food.protein}g</span>
                  <span>F: {food.fats}g</span>
                </div>
                <button 
                  className="add-item-btn"
                  onClick={() => {
                    setSelectedFood(food);
                    setIsAddFoodModalOpen(false);
                  }}
                >
                  Add
                </button>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  </div>
)}

        {/* Food Details Modal */}
        {selectedFood && (
          <div className="modal-overlay">
            <div className="modal-content food-details-modal">
              <div className="modal-header">
                <h2>{selectedFood.name}</h2>
                <button 
                  className="modal-close"
                  onClick={() => setSelectedFood(null)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="food-details-content">
                <div className="food-image-section">
                  {selectedFood.imageUrl ? (
                    <img 
                      src={selectedFood.imageUrl} 
                      alt={selectedFood.name}
                      onError={(e) => {
                        e.target.parentElement.innerHTML = `
                          <div class="food-image-placeholder">
                            <span>${selectedFood.name}</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div className="food-image-placeholder">
                      <span>{selectedFood.name}</span>
                    </div>
                  )}
                </div>

                <div className="food-info-section">
                  <div>
                    <h3 className="food-title">{selectedFood.name}</h3>
                    <p className="food-description">
                      A healthy and nutritious serving of {selectedFood.name.toLowerCase()}.
                    </p>
                  </div>

                  <div className="nutrition-grid">
                    <div className="nutrition-item">
                      <div className="nutrition-item-label">Calories</div>
                      <div className="nutrition-item-value">{selectedFood.calories} kcal</div>
                    </div>
                    <div className="nutrition-item">
                      <div className="nutrition-item-label">Carbohydrates</div>
                      <div className="nutrition-item-value">{selectedFood.carbs}g</div>
                    </div>
                    <div className="nutrition-item">
                      <div className="nutrition-item-label">Protein</div>
                      <div className="nutrition-item-value">{selectedFood.protein}g</div>
                    </div>
                    <div className="nutrition-item">
                      <div className="nutrition-item-label">Fats</div>
                      <div className="nutrition-item-value">{selectedFood.fats}g</div>
                    </div>
                  </div>

                  <div className="macro-details">
                    <div className="macro-detail-item">
                      <div className="macro-label">Carbs</div>
                      <div className="macro-value">{selectedFood.carbs}g</div>
                      <div className="macro-bar">
                        <div 
                          className="macro-fill carbs"
                          style={{ width: `${(selectedFood.carbs / (selectedFood.carbs + selectedFood.protein + selectedFood.fats)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="macro-detail-item">
                      <div className="macro-label">Protein</div>
                      <div className="macro-value">{selectedFood.protein}g</div>
                      <div className="macro-bar">
                        <div 
                          className="macro-fill protein"
                          style={{ width: `${(selectedFood.protein / (selectedFood.carbs + selectedFood.protein + selectedFood.fats)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="macro-detail-item">
                      <div className="macro-label">Fats</div>
                      <div className="macro-value">{selectedFood.fats}g</div>
                      <div className="macro-bar">
                        <div 
                          className="macro-fill fats"
                          style={{ width: `${(selectedFood.fats / (selectedFood.carbs + selectedFood.protein + selectedFood.fats)) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>

                  <div className="food-actions">
                    <button className="primary-btn" onClick={handleAddToMeals}>
                      Add to Today's Meals
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Meal Selection Modal */}
        {isMealSelectionOpen && (
          <div className="modal-overlay">
            <div className="modal-content meal-selection-modal">
              <div className="modal-header">
                <h2>Select Meal</h2>
                <button 
                  className="modal-close"
                  onClick={() => setIsMealSelectionOpen(false)}
                >
                  <X size={24} />
                </button>
              </div>
              
              <div className="meal-selection-content">
                <div className="serving-size-control">
                  <label htmlFor="serving-size">Serving Size (g):</label>
                  <input
                    type="number"
                    id="serving-size"
                    value={servingSize}
                    onChange={(e) => setServingSize(Number(e.target.value))}
                    min="0"
                    step="10"
                  />
                </div>

                <div className="nutrition-preview">
                  <h3>Nutrition for {servingSize}g serving:</h3>
                  <div className="nutrition-values">
                    <div>Calories: {Math.round(selectedFood.calories * (servingSize / 100))}</div>
                    <div>Protein: {Math.round(selectedFood.protein * (servingSize / 100))}g</div>
                    <div>Carbs: {Math.round(selectedFood.carbs * (servingSize / 100))}g</div>
                    <div>Fat: {Math.round(selectedFood.fats * (servingSize / 100))}g</div>
                  </div>
                </div>

                <div className="meal-options">
                  {nutritionData.meals.map((meal) => (
                    <button
                      key={meal.id}
                      className="meal-option-btn"
                      onClick={() => handleMealSelection(meal.name)}
                    >
                      Add to {meal.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
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
            <h1>Nutrition</h1>
            <p>Manage your daily nutrition and meals</p>
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
                    />
                  ) : (
                    getDisplayName().charAt(0).toUpperCase()
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-area">
          {renderContent()}
        </div>

     {/* Meal Entries Modal */}
{isMealEntriesModalOpen && (
  <div className="modal-overlay">
    <div className="modal-content meal-entries-modal">
      <div className="modal-header">
        <h2>Today's Meals</h2>
        <button 
          className="modal-close"
          onClick={() => setIsMealEntriesModalOpen(false)}
        >
          <X size={24} />
        </button>
      </div>
      
      <div className="meal-entries-content">
        {nutritionData.meals.map((meal) => (
          <div key={meal.id} className="meal-entries-section">
            <h3>{meal.name}</h3>
            {meal.items.length > 0 ? (
              <div className="meal-entry-list">
                {meal.items.map((item, index) => (
                  <div key={index} className="meal-entry-item">
                    <div className="meal-entry-info">
                      <span className="meal-entry-name">{item}</span>
                      <button 
                        className="delete-entry-btn"
                        onClick={() => deleteMealEntry(meal.entries[index].mealEntryId, meal.entries[index].foodEntryId)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-entries-message">No meals logged yet</p>
            )}
          </div>
        ))}
      </div>
    </div>
  </div>
)}
      </main>
    </div>
  );
};

export default Nutrition;