"use client";
import { useState } from "react";
import Link from "next/link";
import { Menu, X, User, LogOut } from "lucide-react";
import Image from "next/image";
import logo2 from '@/public/assets/flaglogo.gif';

function Nav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = isMenuOpen ? "unset" : "hidden";
  };

  const status = typeof window !== 'undefined' ? localStorage.getItem('loginstatus') : null;

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = "unset";
  };

  const handleLogout = () => {
    localStorage.setItem('loginstatus', 'false');
  };

  const navItems = [
    { href: "/home", label: "Home" },
    { href: "/movies", label: "Movies" },
    { href: "/top-airing", label: "Top Airing" },
    { href: "/genre", label: "Explore" },
    { href: "/most-popular", label: "Most Popular" },
    { href: "/anime-list", label: "List of Anime" },
  ];

  return (
    <div className="bg-black shadow-lg border-b border-gray-800">
      <div className="mx-auto px-10">
        <div className="flex items-center h-16 lg:h-20">
          {/* Menu button on far left */}
          <button
            onClick={toggleMenu}
            className={`rounded-lg text-gray-400 transition duration-200 ${isMenuOpen
              ? 'hover:text-white bg-transparent'
              : 'hover:text-white hover:bg-transparent'
              } focus:outline-none focus:ring-2`}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? (
              <X className="w-7 h-7" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>

          {/* Logo centered between menu and nav items */}
          <div className="flex-1 flex justify-center lg:justify-start lg:ml-8">
            <Link href="/" className="flex items-center space-x-1">
              <span className="text-2xl font-bold text-white tracking-tight hover:text-gray-300 transition duration-200">
                <Image src={logo2} alt="logo" width={70} height={70} />
              </span>
            </Link>
          </div>

          {/* Navigation items on the right */}
          <nav className="hidden lg:flex items-center justify-end">
            <ul className="flex space-x-6 items-center">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <button
                      className="px-4 py-2 font-extrabold text-[20px] text-white hover:text-gray-300 hover:bg-gray-800 rounded-lg transition duration-200"
                    >
                      {item.label}
                    </button>
                  </Link>
                </li>
              ))}
              {status === "true" ? (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                    className="flex items-center space-x-2 px-4 py-2 text-white hover:bg-gray-800 rounded-lg transition duration-200"
                  >
                    <User className="w-6 h-6" />
                  </button>
                  {isProfileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-gray-900 rounded-lg shadow-lg py-2 z-50">
                      <Link href="/ui/profile">
                        <button
                          onClick={() => setIsProfileDropdownOpen(false)}
                          className="flex items-center w-full px-4 py-2 text-white hover:bg-gray-800"
                        >
                          <User className="w-4 h-4 mr-2" />
                          Profile
                        </button>
                      </Link>
                      <Link href="/">
                        <button
                          onClick={handleLogout}
                          className="flex items-center w-full px-4 py-2 text-white hover:bg-gray-800"
                        >
                          <LogOut className="w-4 h-4 mr-2" />
                          Logout
                        </button>
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                <li>
                  <Link href="/login">
                    <button
                      className="px-4 py-2 font-extrabold text-[20px] text-white hover:text-gray-300 hover:bg-gray-800 rounded-lg transition duration-200"
                    >
                      Login
                    </button>
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>

      {/* Mobile menu overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
          onClick={closeMenu}
        >
          <div
            className="absolute inset-y-0 left-0 w-72 backdrop-blur-sm transform transition-transform duration-300 ease-in-out"
            onClick={(e) => e.stopPropagation()}
          >
            <nav className="flex-1 py-6 space-y-1 ml-5 mt-10">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <button
                    onClick={closeMenu}
                    className="block mx-3 px-2 py-2 text-base font-bold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200 w-full text-left"
                  >
                    {item.label}
                  </button>
                </Link>
              ))}
              {status === "true" ? (
                <>
                  <Link href="/profile">
                    <button
                      onClick={closeMenu}
                      className="block mx-3 px-2 py-2 text-base font-bold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200 w-full text-left"
                    >
                      Profile
                    </button>
                  </Link>
                  <Link href="/">
                    <button
                      onClick={() => {
                        handleLogout();
                        closeMenu();
                      }}
                      className="block mx-3 px-2 py-2 text-base font-bold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200 w-full text-left"
                    >
                      Logout
                    </button>
                  </Link>
                </>
              ) : (
                <Link href="/login">
                  <button
                    onClick={closeMenu}
                    className="block mx-3 px-2 py-2 text-base font-bold text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition duration-200 w-full text-left"
                  >
                    Login
                  </button>
                </Link>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

export default Nav;

