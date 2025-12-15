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
		vehicleType: '',
		// Restaurant location fields
		locationHouse: '',
		locationRoad: '',
		locationArea: '',
		locationCity: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const roles = [
		{
			id: 'customer',
			title: 'Customer',
			icon: '🛍️',
			description: 'Order food from curated kitchens',
			color: 'from-emerald-500 to-emerald-600',
		},
		{
			id: 'deliveryStaff',
			title: 'Delivery Staff',
			icon: '🏍️',
			description: 'Deliver on-time orders and earn',
			color: 'from-emerald-500 to-emerald-600',
		},
		{
			id: 'restaurant',
			title: 'Restaurant',
			icon: '🍽️',
			description: 'Manage your kitchen and menu',
			color: 'from-emerald-500 to-emerald-600',
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
			const payload = {
				name: formData.name,
				email: formData.email,
				phone: formData.phone,
				password: formData.password,
				role: formData.role,
			};

			// Add vehicle type for delivery staff
			if (formData.role === 'deliveryStaff') {
				payload.vehicleType = formData.vehicleType;
			}

			// Add location for restaurant
			if (formData.role === 'restaurant') {
				payload.location = {
					house: formData.locationHouse,
					road: formData.locationRoad,
					area: formData.locationArea,
					city: formData.locationCity,
				};
			}

			const response = await axiosInstance.post('/api/auth/register', payload);

			if (response.data.success) {
				// Store token and user in localStorage
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
		<div className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
			<div className="mx-auto max-w-lg">
				<div className="rounded-2xl bg-white p-10 shadow-lg ring-1 ring-gray-100">
					{/* Header */}
					<div className="text-center mb-8">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
							Start your plan
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-gray-900">
							Create an account
						</h1>
						<p className="text-gray-600">Choose your role and get cooking.</p>
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
												p-4 rounded-xl border-2 transition-all
												text-left flex flex-col items-center justify-center
												hover:shadow-md hover:-translate-y-0.5
												${
													isSelected
														? `bg-gradient-to-br ${role.color} text-white border-transparent shadow-md`
														: 'bg-gray-50 border-gray-200 text-gray-800 hover:border-emerald-200'
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

						{/* Full Name / Restaurant Name */}
						<div>
							<label
								htmlFor="name"
								className="block text-sm font-medium text-gray-700 mb-2"
							>
								{formData.role === 'restaurant'
									? 'Restaurant Name'
									: 'Full Name'}
							</label>
							<input
								type="text"
								id="name"
								name="name"
								value={formData.name}
								onChange={handleChange}
								required
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
								placeholder={
									formData.role === 'restaurant'
										? 'Restaurant Name'
										: 'John Doe'
								}
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
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
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
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
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
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
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

						{/* Restaurant Location Fields */}
						{formData.role === 'restaurant' && (
							<div className="space-y-4 rounded-xl border-2 border-emerald-100 bg-emerald-50 p-4">
								<h3 className="font-semibold text-gray-900">
									Restaurant Location
								</h3>

								<div>
									<label
										htmlFor="locationHouse"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										House Number
									</label>
									<input
										type="text"
										id="locationHouse"
										name="locationHouse"
										value={formData.locationHouse}
										onChange={handleChange}
										className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
										placeholder="House #123"
									/>
								</div>

								<div>
									<label
										htmlFor="locationRoad"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Road / Street (Optional)
									</label>
									<input
										type="text"
										id="locationRoad"
										name="locationRoad"
										value={formData.locationRoad}
										onChange={handleChange}
										className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
										placeholder="Main Street"
									/>
								</div>

								<div>
									<label
										htmlFor="locationArea"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										Area / District
									</label>
									<input
										type="text"
										id="locationArea"
										name="locationArea"
										value={formData.locationArea}
										onChange={handleChange}
										required
										className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
										placeholder="Downtown"
									/>
								</div>

								<div>
									<label
										htmlFor="locationCity"
										className="block text-sm font-medium text-gray-700 mb-2"
									>
										City
									</label>
									<input
										type="text"
										id="locationCity"
										name="locationCity"
										value={formData.locationCity}
										onChange={handleChange}
										required
										className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
										placeholder="New York"
									/>
								</div>
							</div>
						)}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
								className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
