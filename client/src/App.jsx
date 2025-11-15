import { useState } from 'react'
import Navbar from './components/Navbar'

function MealCard({ title, description, price, image, popular }) {
  return (
    
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden transform transition hover:scale-105 hover:shadow-2xl relative">
      {popular && (
        <div className="absolute top-4 right-4 bg-gradient-to-r from-orange-500 to-pink-500 text-white px-4 py-1 rounded-full text-sm font-bold z-10">
          Popular
          
        </div>
      )}
      <div className="h-56 overflow-hidden bg-gradient-to-br from-orange-100 to-pink-100">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex items-center justify-between">
          <div>
            <span className="text-3xl font-bold text-green-600">${price}</span>
            <span className="text-gray-500 text-sm">/week</span>
          </div>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-lg">
            Subscribe
          </button>
        </div>
      </div>
    </div>
  )
}

function App() {
  const meals = [
    {
      id: 1,
      title: "Healthy Balance",
      description: "Perfect mix of proteins, carbs and veggies",
      price: 49,
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
      popular: false
    },
    {
      id: 2,
      title: "Protein Power",
      description: "High protein meals for muscle building",
      price: 59,
      image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=80",
      popular: true
    },
    {
      id: 3,
      title: "Vegan Delight",
      description: "100% plant-based delicious meals",
      price: 45,
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
      popular: false
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-green-50">
    <Navbar />
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Fresh Meals, Delivered Daily
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-green-100">
            Healthy, delicious, and convenient meal subscriptions
          </p>
          <button className="bg-white text-green-600 px-8 py-4 rounded-full text-lg font-bold hover:bg-green-50 transition shadow-xl">
            Get Started Today
          </button>
        </div>
      </div>

      {/* Meal Plans Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-800 mb-4">
            Choose Your Plan
          </h2>
          <p className="text-xl text-gray-600">
            Select the perfect meal plan for your lifestyle
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {meals.map(meal => (
            <MealCard key={meal.id} {...meal} />
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-white py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Why Choose Us?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🍃</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Fresh Ingredients</h3>
              <p className="text-gray-600">Locally sourced, organic produce delivered fresh daily</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🍳</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Chef Prepared</h3>
              <p className="text-gray-600">Expertly crafted by professional chefs</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🚚</span>
              </div>
              <h3 className="text-xl font-bold mb-2">Fast Delivery</h3>
              <p className="text-gray-600">Delivered to your door within hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App