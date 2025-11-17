import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  PaperAirplaneIcon,
  MoonIcon,
  SunIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

function Navbar() {
  const [toggleMenu, setToggleMenu] = useState(false);
  const location = useLocation();

  return (
    <div className="Navbar">
      <nav className="absolute top-4 left-1/2 transform -translate-x-1/2 w-[95%] max-w-7xl z-50">
        <div className="bg-white/95 backdrop-blur-md rounded-xl border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo on the left */}
            <div className="flex-shrink-0">
              <Link
                to="/"
                className="flex gap-2 font-bold text-gray-700 items-center hover:text-green-600 transition"
              >
                <PaperAirplaneIcon className="h-6 w-6 text-green-600" />
                <span className="text-lg">LazyBite</span>
              </Link>
            </div>

            {/* Navbar items in the center */}
            <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
              <Link
                to="/restaurants"
                className={`font-medium transition ${
                  location.pathname === '/restaurants'
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                Restaurants
              </Link>
              <Link
                to="/about"
                className={`font-medium transition ${
                  location.pathname === '/about'
                    ? 'text-green-600 font-semibold'
                    : 'text-gray-700 hover:text-green-600'
                }`}
              >
                About
              </Link>
            </div>

            {/* Login button on the right */}
            <div className="flex items-center gap-4 flex-shrink-0">
              <div className="hidden lg:flex items-center gap-2">
                <MoonIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition" />
                <SunIcon className="h-5 w-5 text-gray-600 hover:text-gray-800 cursor-pointer transition" />
              </div>
              <Link
                to="/login"
                className={`px-6 py-2 rounded-full font-semibold transition shadow-md ${
                  location.pathname === '/login'
                    ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white'
                    : 'bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700'
                }`}
              >
                Login
              </Link>
              {/* Mobile navigation toggle */}
              <div className="lg:hidden">
                <button onClick={() => setToggleMenu(!toggleMenu)}>
                  <Bars3Icon className="h-6 w-6 text-gray-700" />
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* mobile navigation */}
        <div
          className={`fixed z-40 top-20 left-1/2 transform -translate-x-1/2 w-[95%] max-w-md bg-white rounded-2xl shadow-xl overflow-hidden flex flex-col lg:hidden gap-12 origin-top duration-300 ${
            !toggleMenu ? "h-0 opacity-0" : "h-auto opacity-100 p-6"
          }`}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-800">Menu</h2>
            <button onClick={() => setToggleMenu(!toggleMenu)}>
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <div className="flex flex-col gap-4 font-medium">
            <Link
              to="/restaurants"
              className={`pl-4 py-2 text-gray-700 hover:text-green-600 transition ${
                location.pathname === '/restaurants' ? 'border-l-4 border-green-600' : ''
              }`}
              onClick={() => setToggleMenu(false)}
            >
              Restaurants
            </Link>
            <Link
              to="/about"
              className={`pl-4 py-2 text-gray-700 hover:text-green-600 transition ${
                location.pathname === '/about' ? 'border-l-4 border-green-600' : ''
              }`}
              onClick={() => setToggleMenu(false)}
            >
              About
            </Link>
            <Link
              to="/login"
              className={`pl-4 py-2 text-gray-700 hover:text-green-600 transition ${
                location.pathname === '/login' ? 'border-l-4 border-green-600' : ''
              }`}
              onClick={() => setToggleMenu(false)}
            >
              Login
            </Link>
          </div>
        </div>
      </nav>
    </div>
  );
}

export default Navbar;