import React, { useState } from 'react';
import { X } from 'lucide-react';

const ManualFoodInput = ({ onAddFood, onClose }) => {
  const [foodData, setFoodData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fats: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFoodData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const numericData = {
      ...foodData,
      calories: parseFloat(foodData.calories) || 0,
      protein: parseFloat(foodData.protein) || 0,
      carbs: parseFloat(foodData.carbs) || 0,
      fats: parseFloat(foodData.fats) || 0
    };

    onAddFood({
      id: Date.now(), // Generate temporary ID
      ...numericData,
      imageUrl: `https://via.placeholder.com/150?text=${encodeURIComponent(foodData.name)}`
    });
  };

  return (
    <div className="manual-food-input">
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label htmlFor="name">Food Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={foodData.name}
            onChange={handleChange}
            placeholder="Enter food name"
            required
          />
        </div>

        <div className="input-grid">
          <div className="input-group">
            <label htmlFor="calories">Calories</label>
            <input
              type="number"
              id="calories"
              name="calories"
              value={foodData.calories}
              onChange={handleChange}
              placeholder="kcal"
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="protein">Protein</label>
            <input
              type="number"
              id="protein"
              name="protein"
              value={foodData.protein}
              onChange={handleChange}
              placeholder="g"
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="carbs">Carbs</label>
            <input
              type="number"
              id="carbs"
              name="carbs"
              value={foodData.carbs}
              onChange={handleChange}
              placeholder="g"
              min="0"
              required
            />
          </div>

          <div className="input-group">
            <label htmlFor="fats">Fats</label>
            <input
              type="number"
              id="fats"
              name="fats"
              value={foodData.fats}
              onChange={handleChange}
              placeholder="g"
              min="0"
              required
            />
          </div>
        </div>

        <button type="submit" className="add-manual-food-btn">
          Add Food
        </button>
      </form>
    </div>
  );
};

export default ManualFoodInput;