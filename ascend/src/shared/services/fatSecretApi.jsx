class FatSecretAPI {
  constructor() {
    this.baseUrl = 'http://localhost:5000/api/fatsecret';
  }

  async searchFood(query, pageNumber = 0) {
    try {
      if (!query || query.trim() === '') {
        throw new Error('Search query is required');
      }

      const response = await fetch(`${this.baseUrl}/foods/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          query: query.trim(),
          pageNumber: pageNumber.toString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || data.message || `HTTP error! status: ${response.status}`);
      }

      // Check if the response has the expected structure
      if (!data.foods) {
        return { foods: { food: [] } };
      }

      return data;
    } catch (error) {
      console.error('Error searching foods:', error);
      // Return empty results instead of throwing
      return { foods: { food: [] } };
    }
  }
}

export default new FatSecretAPI();