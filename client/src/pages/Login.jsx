import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axios';

export default function Login() {
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

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

		try {
			const response = await axiosInstance.post('/api/auth/login', {
				email: formData.email,
				password: formData.password,
			});

			if (response.data.success) {
				// Store token and user data
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
				setError(response.data.message || 'Login failed');
			}
		} catch (err) {
			setError(
				err.response?.data?.message ||
					err.message ||
					'An error occurred during login'
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
							Login
						</h1>
						<p className="text-gray-600">Welcome back to NomNom</p>
					</div>

					{/* Error Message */}
					{error && (
						<div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
							{error}
						</div>
					)}

					{/* Login Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
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
								className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-green-400 focus:outline-none transition-all"
								placeholder="••••••••"
							/>
						</div>

						<div className="flex items-center justify-between">
							<label className="flex items-center">
								<input
									type="checkbox"
									className="rounded border-gray-300 text-green-500 focus:ring-green-400"
								/>
								<span className="ml-2 text-sm text-gray-600">
									Remember me
								</span>
							</label>
							<a
								href="#"
								className="text-sm text-green-500 hover:text-green-600 cursor-pointer"
							>
								Forgot password?
							</a>
						</div>

						<button
							type="submit"
							disabled={loading}
							className="w-full bg-gradient-to-r from-green-300 to-emerald-400 text-white py-3 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
						>
							{loading ? 'Logging in...' : 'Login'}
						</button>
					</form>

					{/* Sign Up Link */}
					<div className="mt-6 text-center">
						<p className="text-gray-600">
							Don't have an account?{' '}
							<Link
								to="/register"
								className="text-green-500 font-semibold hover:text-green-600 cursor-pointer"
							>
								Sign up
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
