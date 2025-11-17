function Login() {
  return (
    <div className="min-h-screen pt-24">
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">Login</h1>
        <p className="text-xl text-gray-600 mb-8">Sign in to your account</p>
        <form className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your email"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              placeholder="Enter your password"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-700 transition shadow-md"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  )
}

export default Login

