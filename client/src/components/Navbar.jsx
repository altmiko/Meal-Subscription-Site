import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

export default function Navbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [user, setUser] = useState(null);
	const location = useLocation();
	const navigate = useNavigate();
	const activePath = location.pathname;

	// Check if user is logged in and update state
	useEffect(() => {
		const checkUser = () => {
			const userData = localStorage.getItem('user');
			if (userData) {
				try {
					setUser(JSON.parse(userData));
				} catch (err) {
					console.error('Error parsing user data:', err);
					localStorage.removeItem('user');
					localStorage.removeItem('token');
					setUser(null);
				}
			} else {
				setUser(null);
			}
		};

		checkUser();

		// Listen for storage changes (when user logs in/out in another tab)
		window.addEventListener('storage', checkUser);

		// Listen for custom event when user logs in/out
		window.addEventListener('userLogin', checkUser);

		return () => {
			window.removeEventListener('storage', checkUser);
			window.removeEventListener('userLogin', checkUser);
		};
	}, [location.pathname]); // Re-check when route changes

	const navLinks = [
		{ name: 'Home', path: '/' },
		{ name: 'About', path: '/about' },
		{ name: 'Restaurants', path: '/restaurants' },
	];

	const handleNavClick = () => {
		setIsOpen(false);
	};

	const handleDashboardClick = () => {
		if (!user) return;

		const role = user.role;
		if (role === 'customer') {
			navigate('/dashboard/customer');
		} else if (role === 'restaurant') {
			navigate('/dashboard/restaurant');
		} else if (role === 'deliveryStaff') {
			navigate('/dashboard/delivery-staff');
		}
		setIsOpen(false);
	};

	return (
		<div className="Navbar">
			<nav className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50">
				<div className="bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-gray-200/50 px-6 py-4">
					<div className="flex items-center justify-between">
						{/* Logo on the left */}
						<div className="flex-shrink-0">
							<Link
								to="/"
								onClick={handleNavClick}
								className="flex gap-2 font-bold text-gray-800 items-center hover:text-green-500 transition-colors cursor-pointer"
							>
								<div className="w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-400 rounded-lg flex items-center justify-center">
									<span className="text-white font-bold text-sm">
										N
									</span>
								</div>
								<span className="text-xl">NomNom</span>
							</Link>
						</div>

						{/* Navbar items centered */}
						<div className="hidden lg:flex items-center gap-10 flex-1 justify-center">
							{navLinks.map((link) => (
								<Link
									key={link.path}
									to={link.path}
									onClick={handleNavClick}
									className={`text-sm font-medium transition-all duration-200 relative cursor-pointer ${
										activePath === link.path
											? 'text-green-500'
											: 'text-gray-700 hover:text-green-500'
									}`}
								>
									{link.name}
									{activePath === link.path && (
										<span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-green-500 rounded-full"></span>
									)}
								</Link>
							))}
						</div>

						{/* User menu or Login/Register button on the right */}
						<div className="flex items-center gap-4 flex-shrink-0">
							{user ? (
								<div className="flex items-center gap-3">
									<button
										onClick={handleDashboardClick}
										className="flex items-center gap-2 px-4 py-2.5 rounded-full font-semibold hover:bg-gray-100 transition-all text-sm cursor-pointer text-gray-700"
									>
										<div className="w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center">
											<span className="text-white font-bold text-xs">
												{user.name
													?.charAt(0)
													.toUpperCase() || 'U'}
											</span>
										</div>
										<span className="hidden sm:inline">
											{user.name}
										</span>
									</button>
								</div>
							) : (
								<button
									onClick={() => navigate('/login')}
									className="bg-gradient-to-r from-green-300 to-emerald-400 text-white px-6 py-2.5 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg text-sm cursor-pointer"
								>
									Login / Register
								</button>
							)}
							{/* Mobile navigation toggle */}
							<div className="lg:hidden">
								<button
									onClick={() => setIsOpen(!isOpen)}
									className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
								>
									{isOpen ? (
										<XMarkIcon className="h-6 w-6" />
									) : (
										<Bars3Icon className="h-6 w-6" />
									)}
								</button>
							</div>
						</div>
					</div>
				</div>

				{/* Mobile Navigation */}
				{isOpen && (
					<div className="fixed z-40 top-20 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:hidden mt-2">
						<div className="p-6">
							<div className="flex flex-col gap-3">
								{navLinks.map((link) => (
									<Link
										key={link.path}
										to={link.path}
										onClick={handleNavClick}
										className={`w-full text-left px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
											activePath === link.path
												? 'bg-green-50 text-green-500 border-l-4 border-green-500'
												: 'text-gray-700 hover:bg-gray-50'
										}`}
									>
										{link.name}
									</Link>
								))}
								{user ? (
									<>
										<button
											onClick={() => {
												handleDashboardClick();
											}}
											className="w-full text-left px-4 py-3 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all cursor-pointer flex items-center gap-2"
										>
											<div className="w-8 h-8 bg-gradient-to-br from-green-300 to-emerald-400 rounded-full flex items-center justify-center">
												<span className="text-white font-bold text-xs">
													{user.name
														?.charAt(0)
														.toUpperCase() || 'U'}
												</span>
											</div>
											<span>{user.name}</span>
										</button>
									</>
								) : (
									<button
										onClick={() => {
											navigate('/login');
											handleNavClick();
										}}
										className="w-full bg-gradient-to-r from-green-300 to-emerald-400 text-white px-4 py-3 rounded-lg text-sm font-semibold hover:from-green-400 hover:to-emerald-500 transition-all mt-2 shadow-md cursor-pointer"
									>
										Login / Register
									</button>
								)}
							</div>
						</div>
					</div>
				)}
			</nav>
		</div>
	);
}
