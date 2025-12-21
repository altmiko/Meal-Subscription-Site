import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Logo from './Logo';

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
		} else if (role === 'admin' && user.isSuperAdmin === true) {
			navigate('/dashboard/admin');
		}
		setIsOpen(false);
	};

	return (
		<header className="Navbar sticky top-0 z-40 border-b border-gray-200 bg-white/95 backdrop-blur">
			<nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 lg:px-8">
				{/* Logo + brand */}
				<Link
					to="/"
					onClick={handleNavClick}
					className="flex items-center gap-2 text-gray-900 font-semibold tracking-tight"
				>
					<Logo />
					<span className="text-xl">NomNom</span>
				</Link>

				{/* Desktop links */}
				<div className="hidden lg:flex items-center gap-8">
					{navLinks.map((link) => (
						<Link
							key={link.path}
							to={link.path}
							onClick={handleNavClick}
							className={`relative text-sm font-medium transition-colors ${
								activePath === link.path
									? 'text-emerald-700'
									: 'text-gray-700 hover:text-emerald-700'
							}`}
						>
							{link.name}
							{activePath === link.path && (
								<span className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-emerald-600" />
							)}
						</Link>
					))}
				</div>

				{/* Actions */}
				<div className="flex items-center gap-3">
					{user ? (
						<button
							onClick={handleDashboardClick}
							className="flex items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-900 hover:border-emerald-200 hover:bg-emerald-50 transition"
						>
							<div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-bold">
								{user.name?.charAt(0).toUpperCase() || 'U'}
							</div>
							<span className="hidden sm:inline">{user.name}</span>
						</button>
					) : (
						<button
							onClick={() => navigate('/login')}
							className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
						>
							Login / Register
						</button>
					)}

					{/* Mobile toggle */}
					<button
						onClick={() => setIsOpen(!isOpen)}
						className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 lg:hidden"
					>
						{isOpen ? (
							<XMarkIcon className="h-6 w-6" />
						) : (
							<Bars3Icon className="h-6 w-6" />
						)}
					</button>
				</div>
			</nav>

			{/* Mobile menu */}
			{isOpen && (
				<div className="border-t border-gray-200 bg-white lg:hidden">
					<div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4">
						{navLinks.map((link) => (
							<Link
								key={link.path}
								to={link.path}
								onClick={handleNavClick}
								className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
									activePath === link.path
										? 'bg-emerald-50 text-emerald-700'
										: 'text-gray-800 hover:bg-gray-50'
								}`}
							>
								{link.name}
							</Link>
						))}

						{user ? (
							<button
								onClick={handleDashboardClick}
								className="mt-2 flex items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-900 hover:border-emerald-200 hover:bg-emerald-50 transition"
							>
								<div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white text-sm font-bold">
									{user.name?.charAt(0).toUpperCase() || 'U'}
								</div>
								<span>{user.name}</span>
							</button>
						) : (
							<button
								onClick={() => {
									navigate('/login');
									handleNavClick();
								}}
								className="mt-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
							>
								Login / Register
							</button>
						)}
					</div>
				</div>
			)}
		</header>
	);
}
