import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Car, User, LogOut, Settings, Calendar, Shield, Menu, X } from 'lucide-react';
import { useAuth } from '../App';
import axios from 'axios';
import { toast } from 'react-toastify';

const Navbar = () => {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      logout();
      toast.success('Logged out successfully');
      setShowProfileDropdown(false);
    } catch (error) {
      console.error('Logout error:', error);
      logout(); // Force logout even if API call fails
    }
  };

  const isActiveLink = (path) => {
    return location.pathname === path;
  };

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/cars', label: 'Cars' },
  ];

  const authLinks = [
    { path: '/bookings', label: 'My Bookings', icon: Calendar },
    { path: '/profile', label: 'Profile', icon: User },
  ];

  const adminLinks = [
    { path: '/admin', label: 'Admin', icon: Shield },
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <Car size={24} />
          CarRental
        </Link>

        {/* Desktop Navigation */}
        <ul className="navbar-nav">
          {navLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={isActiveLink(link.path) ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {isAuthenticated && authLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={isActiveLink(link.path) ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}

          {isAdmin && adminLinks.map((link) => (
            <li key={link.path}>
              <Link
                to={link.path}
                className={location.pathname.startsWith(link.path) ? 'active' : ''}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* User Actions */}
        <div className="navbar-profile">
          {isAuthenticated ? (
            <div className="relative" ref={dropdownRef}>
              <button
                className="navbar-profile-btn"
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
              >
                <User size={20} />
                <span className="font-medium">{user?.name}</span>
              </button>

              {showProfileDropdown && (
                <div className="profile-dropdown">
                  <Link
                    to="/profile"
                    className="profile-dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <User size={16} />
                    Profile
                  </Link>
                  
                  <Link
                    to="/bookings"
                    className="profile-dropdown-item"
                    onClick={() => setShowProfileDropdown(false)}
                  >
                    <Calendar size={16} />
                    My Bookings
                  </Link>

                  {isAdmin && (
                    <Link
                      to="/admin"
                      className="profile-dropdown-item"
                      onClick={() => setShowProfileDropdown(false)}
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Link>
                  )}

                  <div className="profile-dropdown-divider" />
                  
                  <button
                    className="profile-dropdown-item"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn btn-outline btn-sm">
                Login
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="navbar-mobile-toggle"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="mobile-menu">
          <div className="mobile-menu-links">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-menu-link ${isActiveLink(link.path) ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                {link.label}
              </Link>
            ))}

            {isAuthenticated && authLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-menu-link ${isActiveLink(link.path) ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {isAdmin && adminLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`mobile-menu-link ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
                onClick={() => setShowMobileMenu(false)}
              >
                <link.icon size={16} />
                {link.label}
              </Link>
            ))}

            {!isAuthenticated && (
              <div className="mobile-menu-auth">
                <Link
                  to="/login"
                  className="btn btn-outline"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="btn btn-primary"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {isAuthenticated && (
              <button
                className="mobile-menu-link text-error"
                onClick={() => {
                  handleLogout();
                  setShowMobileMenu(false);
                }}
              >
                <LogOut size={16} />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;