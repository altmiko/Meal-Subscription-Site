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
				const user = response.data.data.user;
				const role = user.role;
				if (role === 'customer') {
					navigate('/dashboard/customer');
				} else if (role === 'restaurant') {
					navigate('/dashboard/restaurant');
				} else if (role === 'deliveryStaff') {
					navigate('/dashboard/delivery-staff');
				} else if (role === 'admin' && user.isSuperAdmin === true) {
					navigate('/dashboard/admin');
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
		<div className="min-h-screen bg-gray-50 px-4 pb-16 pt-28">
			<div className="mx-auto max-w-md">
				<div className="rounded-2xl bg-white p-10 shadow-lg ring-1 ring-gray-100">
					{/* Header */}
					<div className="text-center mb-8">
						<p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
							Welcome back
						</p>
						<h1 className="mt-3 text-3xl font-semibold text-gray-900">
							Sign in to continue
						</h1>
						<p className="text-gray-600">
							Minimal steps to your next meal.
						</p>
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
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
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
								className="w-full rounded-lg border-2 border-gray-200 px-4 py-3 transition-all focus:border-emerald-500 focus:outline-none"
								placeholder="••••••••"
							/>
						</div>

						{/* <div className="flex items-center justify-between">
							<label className="flex items-center">
								<input
									type="checkbox"
								className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
								/>
								<span className="ml-2 text-sm text-gray-600">
									Remember me
								</span>
							</label>
							<a
								href="#"
								className="text-sm text-emerald-700 hover:text-emerald-800 cursor-pointer"
							>
								Forgot password?
							</a>
						</div> */}

						<button
							type="submit"
							disabled={loading}
							className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
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
								className="font-semibold text-emerald-700 hover:text-emerald-800 cursor-pointer"
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
