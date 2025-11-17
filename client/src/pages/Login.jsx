import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Login() {
	const [formData, setFormData] = useState({
		email: '',
		password: '',
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		// Handle login logic here
		console.log('Login:', formData);
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
							className="w-full bg-gradient-to-r from-green-300 to-emerald-400 text-white py-3 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg cursor-pointer"
						>
							Login
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
