// frontend/src/components/TopBar.js

import { useState, useEffect } from 'react';
import * as fa from 'react-icons/fa';

const TopBar = ({ onLogout, onOpenSettings }) => {
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    const API_BASE = 'https://spotter-eld-app.onrender.com';

    // Fetch current user data
    useEffect(() => {
        const fetchCurrentUser = () => {
            fetch(`${API_BASE}/rest-auth/user/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            })
                .then(response => response.json())
                .then(data => {
                    setCurrentUser(data);
                })
                .catch(error => console.error('Error fetching user data:', error));
        };

        fetchCurrentUser();
    }, []);

    return (
        <nav className="dashboard-topbar bg-white dark:bg-gray-800 shadow-md px-6 py-4 fixed top-0 right-0 left-0 z-40 xl:left-[300px]">
            <div className="flex justify-between items-center">
                {/* Left side - Page title */}
                <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Admin Dashboard
                    </h2>
                </div>

                {/* Right side - User info & actions */}
                <div className="flex items-center gap-4">
                    {/* User greeting */}
                    <div className="hidden md:block text-right">
                        <p className="text-sm text-gray-600 dark:text-gray-400">Welcome back,</p>
                        <p className="font-semibold text-gray-900 dark:text-white">
                            {currentUser?.first_name || currentUser?.username}
                        </p>
                    </div>

                    {/* User menu dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                                {currentUser?.first_name ? currentUser.first_name.charAt(0) : currentUser?.username?.charAt(0) || 'A'}
                            </div>
                            <fa.FaChevronDown className="text-gray-600 dark:text-gray-400" />
                        </button>

                        {/* Dropdown menu */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-2">
                                <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                                    <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                        {currentUser?.username}
                                    </p>
                                    <p className="text-xs text-gray-600 dark:text-gray-400">
                                        {currentUser?.email}
                                    </p>
                                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                                        Administrator
                                    </p>
                                </div>
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        if (onOpenSettings) {
                                            onOpenSettings();
                                        }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <fa.FaCog className="inline mr-2" /> Settings
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUserMenu(false);
                                        if (onLogout) {
                                            onLogout();
                                        }
                                    }}
                                    className="w-full px-4 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <fa.FaSignOutAlt className="inline mr-2" /> Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default TopBar;