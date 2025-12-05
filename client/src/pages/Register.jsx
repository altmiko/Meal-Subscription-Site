import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function Register() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		role: '',
		name: '',
		email: '',
		phone: '',
		password: '',
		confirmPassword: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const roles = [
		{
			id: 'customer',
			title: 'Customer',
			icon: '🛍️',
			description: 'Order food from your favorite restaurants',
			color: 'from-blue-400 to-blue-600',
		},
		{
			id: 'deliveryStaff',
			title: 'Delivery Staff',
			icon: '🏍️',
			description: 'Deliver orders and earn money',
			color: 'from-green-400 to-green-600',
		},
		{
			id: 'restaurant',
			title: 'Restaurant',
			icon: '🍽️',
			description: 'Manage your restaurant and menu',
			color: 'from-orange-400 to-orange-600',
		},
	];

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
		setError('');
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError('');
		setLoading(true);

		// Validate role is selected
		if (!formData.role) {
			setError('Please select a role');
			setLoading(false);
			return;
		}

		// Validate passwords match
		if (formData.password !== formData.confirmPassword) {
			setError('Passwords do not match!');
			setLoading(false);
			return;
		}

		// Validate password length
		if (formData.password.length < 6) {
			setError('Password must be at least 6 characters long');
			setLoading(false);
			return;
		}

		try {
			const response = await axiosInstance.post('/api/auth/register', {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				role: formData.role,
			});

			if (response.data.success) {
				// Store token in localStorage
				localStorage.setItem('token', response.data.data.token);
				localStorage.setItem(
					'user',
					JSON.stringify(response.data.data.user)
				);

				// Notify Navbar of login
				window.dispatchEvent(new Event('userLogin'));

				// Redirect based on role
				const role = response.data.data.user.role;
				if (role === 'customer') {
					navigate('/dashboard/customer');
				} else if (role === 'restaurant') {
					navigate('/dashboard/restaurant');
				} else if (role === 'deliveryStaff') {
					navigate('/dashboard/delivery-staff');
				} else {
					navigate('/');
				}
			} else {
				setError(response.data.message || 'Registration failed');
			}
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.message ||
					'An error occurred during registration'
			);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen pt-24 px-4 pb-12">
			<div className="max-w-md mx-auto">
				<div className="bg-white rounded-xl shadow-lg p-8">
					{/* Header */}
					<div className="text-center mb-8">
						<h1 className="text-3xl font-bold text-gray-800 mb-2">
							Create Account
						</h1>
						<p className="text-gray-600">Join NomNom today</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
							{error}
						</div>
					)}

					{/* Registration Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Role Selector */}
						<div>
							<label className="block text-sm font-medium text-gray-700 mb-3">
								I want to register as
							</label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-3">
								{roles.map((role) => {
									const isSelected =
										formData.role === role.id;
									return (
										<button
											key={role.id}
											type="button"
											onClick={() => {
												setFormData({
													...formData,
													role: role.id,
												});
												setError('');
											}}
											className={`
												p-4 rounded-lg border-2 transition-all
												text-left flex flex-col items-center justify-center
												hover:shadow-lg transform hover:-translate-y-1
												${
													isSelected
														? `bg-gradient-to-br ${role.color} text-white border-transparent shadow-md`
														: 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
												}
											`}
										>
											<span className="text-3xl mb-2">
												{role.icon}
											</span>
											<span
												className={`font-semibold text-sm ${
													isSelected
														? 'text-white'
														: 'text-gray-800'
												}`}
											>
												{role.title}
											</span>
										</button>
									);
								})}
							</div>
							{formData.role && (
								<p className="mt-3 text-sm text-gray-600 text-center">
									{
										roles.find(
											(r) => r.id === formData.role
										)?.description
									}
								</p>
							)}
						</div>

						{/* Full Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Full Name
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="John Doe"
							/>
						</div>

						<div>
							<label
								htmlFor="email"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Email
							</label>
							<input
								type="email"
								id="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="your@email.com"
							/>
						</div>

						<div>
							<label
								htmlFor="phone"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Phone
							</label>
							<input
								type="tel"
								id="phone"
								name="phone"
								value={formData.phone}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="01234567890"
							/>
						</div>

						<div>
							<label
								htmlFor="password"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Password
							</label>
							<input
								type="password"
								id="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								required
								minLength={6}
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="••••••••"
							/>
							<p className="mt-1 text-xs text-gray-500">
								Must be at least 6 characters
							</p>
						</div>

						<div>
							<label
								htmlFor="confirmPassword"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								Confirm Password
							</label>
							<input
								type="password"
								id="confirmPassword"
								name="confirmPassword"
								value={formData.confirmPassword}
								onChange={handleChange}
								required
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="••••••••"
							/>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-green-300 to-emerald-400 text-white py-3 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Creating Account...' : 'Create Account'}
						</button>
					</form>

					{/* Login Link */}
					<div className="mt-6 text-center">
						<p className="text-gray-600">
							Already have an account?{' '}
							<Link
								to="/login"
								className="text-green-500 font-semibold hover:text-green-600 cursor-pointer"
							>
								Log in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
