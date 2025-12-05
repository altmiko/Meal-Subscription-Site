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

function App() {
	return (
		<Router>
			<div className="min-h-screen">
				<Navbar />
				<Routes>
					<Route path="/" element={<Home />} />
					<Route path="/about" element={<About />} />
					<Route path="/restaurants" element={<Restaurants />} />
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
				</Routes>
			</div>
		</Router>
	);
}

export default App;
