import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Register() {
	const [formData, setFormData] = useState({
		name: '',
		email: '',
		password: '',
		confirmPassword: '',
	});

	const handleChange = (e) => {
		setFormData({
			...formData,
			[e.target.name]: e.target.value,
		});
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (formData.password !== formData.confirmPassword) {
			alert('Passwords do not match!');
			return;
		}
		// Handle registration logic here
		console.log('Register:', formData);
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

					{/* Registration Form */}
					<form onSubmit={handleSubmit} className="space-y-6">
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

						<div className="flex items-start">
							<input
								type="checkbox"
								id="terms"
								required
								className="mt-1 rounded border-gray-300 text-green-500 focus:ring-green-400"
							/>
							<label
								htmlFor="terms"
								className="ml-2 text-sm text-gray-600"
							>
								I agree to the{' '}
								<a
									href="#"
									className="text-green-500 hover:text-green-600 cursor-pointer"
								>
									Terms of Service
								</a>{' '}
								and{' '}
								<a
									href="#"
									className="text-green-500 hover:text-green-600 cursor-pointer"
								>
									Privacy Policy
								</a>
							</label>
						</div>

						<button
							type="submit"
							className="w-full bg-gradient-to-r from-green-300 to-emerald-400 text-white py-3 rounded-full font-semibold hover:from-green-400 hover:to-emerald-500 transition-all shadow-md hover:shadow-lg cursor-pointer"
						>
							Create Account
						</button>
					</form>

					{/* Divider */}
					<div className="my-6 flex items-center">
						<div className="flex-1 border-t border-gray-200"></div>
						<span className="px-4 text-sm text-gray-500">OR</span>
						<div className="flex-1 border-t border-gray-200"></div>
					</div>

					{/* Social Registration */}
					<div className="space-y-3">
						<button className="w-full border-2 border-gray-200 py-3 rounded-full font-medium hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2">
							<span>🔵</span>
							Sign up with Google
						</button>
						<button className="w-full border-2 border-gray-200 py-3 rounded-full font-medium hover:bg-gray-50 transition-all cursor-pointer flex items-center justify-center gap-2">
							<span>⚫</span>
							Sign up with Facebook
						</button>
					</div>

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
