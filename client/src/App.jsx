import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Restaurants from './pages/Restaurants';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import RestaurantDashboard from './pages/RestaurantDashboard';
import DeliveryStaffDashboard from './pages/DeliveryStaffDashboard';
import KitchenProfile from './pages/KitchenProfile';
import ManageMenu from './pages/ManageMenu';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/Orders';
import CustomerOrders from "./pages/CustomerOrders";
import ReviewSection from './pages/ReviewSection';
import ViewReview from './pages/ViewReview'; 

function App() {
	return (
		<Router>
			<div className="min-h-screen">
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/restaurants" element={<Restaurants />} />
					<Route path="/restaurants/:id" element={<KitchenProfile />} />
					<Route path="/login" element={<Login />} />
					<Route path="/register" element={<Register />} />
					<Route
						path="/dashboard/customer"
						element={<CustomerDashboard />}
					/>
					<Route
						path="/dashboard/restaurant"
						element={<RestaurantDashboard />}
					/>
					<Route
						path="/dashboard/delivery-staff"
						element={<DeliveryStaffDashboard />}
					/>
					<Route
						path="/restaurant/manage-menu"
						element={<ManageMenu />}
					/>

					<Route 
						path="/cart" 
						element={<CartPage />} />

					<Route 
						path="/orders" 
						element={<OrdersPage />} />
					<Route 
						path="/my-orders" 
						element={<CustomerOrders />} />
					
					<Route 
						path="/restaurants/:id/add-review" 
						element={<ReviewSection />} />
					<Route 
						path="/restaurants/:id/reviews" 
						element={<ViewReview />} />

				</Routes>
			</div>
		</Router>
	);
}

export default App;
