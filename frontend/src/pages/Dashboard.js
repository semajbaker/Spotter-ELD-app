// frontend/src/pages/admin/Dashboard.js
import { useDashboardData } from '../hooks/useDashboardData';
import { useState } from 'react';
import SideNav from "../components/SideNav";
import TopBar from "../components/TopBar";
import Table from "../components/Table";
import TripForm from "../components/eld/TripForm";
import TripDetailsModal from "../components/eld/TripDetailsModal";
import ProfileSettings from "../components/ProfileSettings";

const API_BASE = process.env.REACT_APP_API_URL;

const Dashboard = ({ handleModal }) => {

    // Get all data from the custom hook
    const {
        currentUser,
        users,
        tokens,
        emails,
        socialAccounts,
        trips,
        stops,
        dailyLogs,
        isLoading,
        invalidateAll,
        invalidateQueries,
        refetchCurrentUser
    } = useDashboardData();

    // UI state
    const [showTripForm, setShowTripForm] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showTripDetails, setShowTripDetails] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);

    // Search state
    const [searchQueries, setSearchQueries] = useState({
        trips: '',
        stops: '',
        dailyLogs: '',
        users: '',
        tokens: '',
        emails: '',
        socialAccounts: ''
    });

    // Selected items for bulk actions
    const [selectedItems, setSelectedItems] = useState({
        trips: [],
        stops: [],
        dailyLogs: [],
        users: [],
        tokens: [],
        emails: [],
        socialAccounts: []
    });

    // Dropdown state
    const [openDropdown, setOpenDropdown] = useState(null);

    // Search handler
    const handleSearch = (table, value) => {
        setSearchQueries(prev => ({ ...prev, [table]: value }));
    };

    // Filter function
    const filterData = (data, query, searchFields) => {
        if (!query) return data;
        return data.filter(item =>
            searchFields.some(field =>
                String(item[field]).toLowerCase().includes(query.toLowerCase())
            )
        );
    };

    // Checkbox handlers
    const handleSelectItem = (table, id) => {
        setSelectedItems(prev => ({
            ...prev,
            [table]: prev[table].includes(id)
                ? prev[table].filter(itemId => itemId !== id)
                : [...prev[table], id]
        }));
    };

    const handleSelectAll = (table, ids) => {
        setSelectedItems(prev => ({
            ...prev,
            [table]: prev[table].length === ids.length ? [] : ids
        }));
    };

    const handleDelete = async (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;

        const endpoints = {
            trip: `/api/trips/${id}/`,
            stop: `/api/stops/${id}/`,
            dailyLog: `/api/daily-logs/${id}/`,
            user: `/rest-auth/admin-user/${id}/`,
            token: `/rest-auth/admin-token/${id}/`,
            email: `/rest-auth/admin-email/${id}/`,
            socialAccount: `/rest-auth/admin-socialaccount/${id}/`
        };

        const queryKeyMap = {
            trip: 'trips',
            stop: 'stops',
            dailyLog: 'dailyLogs',
            user: 'users',
            token: 'tokens',
            email: 'emails',
            socialAccount: 'socialAccounts'
        };

        try {
            await fetch(`${API_BASE}${endpoints[type]}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            alert(`${type} deleted successfully!`);

            // Invalidate only the relevant query
            invalidateQueries([queryKeyMap[type]]);
        } catch (error) {
            console.error(`Error deleting ${type}:`, error);
        }
    };

    const handleBulkDelete = async (table) => {
        const items = selectedItems[table];
        if (items.length === 0) {
            alert('No items selected');
            return;
        }

        if (!window.confirm(`Delete ${items.length} selected items?`)) return;

        const typeMap = {
            trips: 'trip',
            stops: 'stop',
            dailyLogs: 'dailyLog',
            users: 'user',
            tokens: 'token',
            emails: 'email',
            socialAccounts: 'socialAccount'
        };

        try {
            await Promise.all(
                items.map(id => handleDelete(typeMap[table], id))
            );
            setSelectedItems(prev => ({ ...prev, [table]: [] }));
        } catch (error) {
            console.error('Error in bulk delete:', error);
        }
    };

    const handleViewTrip = async (tripId) => {
        try {
            const response = await fetch(`${API_BASE}/api/trips/${tripId}/`, {
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });
            const data = await response.json();
            setSelectedTrip(data);
            setShowTripDetails(true);
        } catch (error) {
            console.error('Error fetching trip details:', error);
        }
    };

    const handleRecalculateTrip = async (tripId) => {
        if (window.confirm('Recalculate route and logs for this trip?')) {
            try {
                await fetch(`${API_BASE}/api/trips/${tripId}/recalculate/`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${localStorage.getItem('token')}`
                    }
                });

                // Invalidate trips, stops, and dailyLogs since they might have changed
                invalidateQueries(['trips', 'stops', 'dailyLogs']);
                alert('Trip recalculated successfully!');
            } catch (error) {
                console.error('Error recalculating trip:', error);
                alert('Error recalculating trip');
            }
        }
    };

    const handleTripCreated = () => {
        // Refresh all data after trip creation
        invalidateAll();
        setShowTripForm(false);
    };

    // Dropdown toggle
    const toggleDropdown = (table) => {
        setOpenDropdown(openDropdown === table ? null : table);
    };

    // Render action dropdown
    const renderActionDropdown = (table) => (
        <div className="relative inline-block text-left">
            <button
                onClick={() => toggleDropdown(table)}
                className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                type="button"
            >
                Actions
                <svg className="w-2.5 h-2.5 ms-2.5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 10 6">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 4 4 4-4" />
                </svg>
            </button>

            {openDropdown === table && (
                <div className="absolute left-0 z-10 mt-2 w-44 bg-white rounded-lg shadow-lg dark:bg-gray-700">
                    <ul className="py-1 text-sm text-gray-700 dark:text-gray-200">
                        <li>
                            <button
                                onClick={() => handleBulkDelete(table)}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600 text-red-600"
                            >
                                Delete Selected ({selectedItems[table].length})
                            </button>
                        </li>
                        <li>
                            <button
                                onClick={() => setSelectedItems(prev => ({ ...prev, [table]: [] }))}
                                className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-600"
                            >
                                Clear Selection
                            </button>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );

    // Render search input
    const renderSearchInput = (table, placeholder) => (
        <div className="relative">
            <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                    <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                </svg>
            </div>
            <input
                type="text"
                value={searchQueries[table]}
                onChange={(e) => handleSearch(table, e.target.value)}
                className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                placeholder={placeholder}
            />
        </div>
    );

    // Filter data for each table
    const filteredTrips = filterData(trips, searchQueries.trips, ['id', 'username', 'current_location', 'pickup_location', 'dropoff_location', 'status']);
    const filteredStops = filterData(stops, searchQueries.stops, ['id', 'location', 'stop_type']);
    const filteredDailyLogs = filterData(dailyLogs, searchQueries.dailyLogs, ['id', 'driver_username', 'log_date']);
    const filteredUsers = filterData(users, searchQueries.users, ['id', 'username', 'email', 'first_name', 'last_name']);
    const filteredTokens = filterData(tokens, searchQueries.tokens, ['id', 'user', 'key']);
    const filteredEmails = filterData(emails, searchQueries.emails, ['id', 'email']);
    const filteredSocialAccounts = filterData(socialAccounts, searchQueries.socialAccounts, ['id', 'provider', 'uid']);

    // Trip Table Configuration
    const tripColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Driver</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Status</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">From</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Pickup</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Dropoff</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Distance (mi)</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Duration (hrs)</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Cycle Used</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Created</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Actions</th>
        </>
    );

    const tripRows = filteredTrips.map(trip => (
        <tr key={trip.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-trip-${trip.id}`}
                        type="checkbox"
                        checked={selectedItems.trips.includes(trip.id)}
                        onChange={() => handleSelectItem('trips', trip.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110"
                    />
                    <label htmlFor={`checkbox-trip-${trip.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{trip.id}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{trip.username}</td>
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                    trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                    }`}>
                    {trip.status_display}
                </span>
            </td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{trip.current_location}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{trip.pickup_location}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{trip.dropoff_location}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{trip.total_distance || 'N/A'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{trip.estimated_duration || 'N/A'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 font-medium">{trip.current_cycle_used} / 70</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(trip.created_at).toLocaleDateString()}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => handleViewTrip(trip.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                    >
                        View
                    </button>
                    <button
                        onClick={() => handleRecalculateTrip(trip.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors shadow-sm"
                    >
                        Recalc
                    </button>
                    <button
                        onClick={() => handleDelete('trip', trip.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    ));

    // Stop Table Configuration
    const stopColumns = (
        <>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Trip ID</th>
            <th scope="col" className="px-6 py-3">Type</th>
            <th scope="col" className="px-6 py-3">Location</th>
            <th scope="col" className="px-6 py-3">Arrival</th>
            <th scope="col" className="px-6 py-3">Departure</th>
            <th scope="col" className="px-6 py-3">Duration</th>
            <th scope="col" className="px-6 py-3">Distance</th>
            <th scope="col" className="px-6 py-3">Actions</th>
        </>
    );

    const stopRows = filteredStops.map(stop => (
        <tr key={stop.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-stop-${stop.id}`}
                        type="checkbox"
                        checked={selectedItems.stops.includes(stop.id)}
                        onChange={() => handleSelectItem('stops', stop.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor={`checkbox-stop-${stop.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4">{stop.id}</td>
            <td className="px-6 py-4">{stop.trip}</td>
            <td className="px-6 py-4">
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${stop.stop_type === 'FUEL' ? 'bg-yellow-100 text-yellow-800' :
                    stop.stop_type === 'REST' ? 'bg-blue-100 text-blue-800' :
                        stop.stop_type === 'OFF_DUTY' ? 'bg-purple-100 text-purple-800' :
                            'bg-green-100 text-green-800'
                    }`}>
                    {stop.stop_type_display}
                </span>
            </td>
            <td className="px-6 py-4">{stop.location}</td>
            <td className="px-6 py-4">{new Date(stop.arrival_time).toLocaleString()}</td>
            <td className="px-6 py-4">{new Date(stop.departure_time).toLocaleString()}</td>
            <td className="px-6 py-4">{stop.duration_minutes} min</td>
            <td className="px-6 py-4">{stop.distance_from_start} mi</td>
            <td className="px-6 py-4 flex gap-2">
                <button
                    onClick={() => handleDelete('stop', stop.id)}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    // Daily Log Table Configuration
    const dailyLogColumns = (
        <>
            <th scope="col" className="px-6 py-3">ID</th>
            <th scope="col" className="px-6 py-3">Trip ID</th>
            <th scope="col" className="px-6 py-3">Driver</th>
            <th scope="col" className="px-6 py-3">Date</th>
            <th scope="col" className="px-6 py-3">Driving</th>
            <th scope="col" className="px-6 py-3">On Duty</th>
            <th scope="col" className="px-6 py-3">Off Duty</th>
            <th scope="col" className="px-6 py-3">Sleeper</th>
            <th scope="col" className="px-6 py-3">Total Miles</th>
            <th scope="col" className="px-6 py-3">Violation</th>
            <th scope="col" className="px-6 py-3">Actions</th>
        </>
    );

    const dailyLogRows = filteredDailyLogs.map(log => (
        <tr key={log.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 border-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-log-${log.id}`}
                        type="checkbox"
                        checked={selectedItems.dailyLogs.includes(log.id)}
                        onChange={() => handleSelectItem('dailyLogs', log.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded-sm focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                    <label htmlFor={`checkbox-log-${log.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4">{log.id}</td>
            <td className="px-6 py-4">{log.trip}</td>
            <td className="px-6 py-4">{log.driver_username}</td>
            <td className="px-6 py-4">{new Date(log.log_date).toLocaleDateString()}</td>
            <td className="px-6 py-4">{log.driving_hours}h</td>
            <td className="px-6 py-4">{log.on_duty_not_driving_hours}h</td>
            <td className="px-6 py-4">{log.off_duty_hours}h</td>
            <td className="px-6 py-4">{log.sleeper_berth_hours}h</td>
            <td className="px-6 py-4">{log.total_miles}</td>
            <td className="px-6 py-4">
                {log.has_violation ? (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                        Yes
                    </span>
                ) : (
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                        No
                    </span>
                )}
            </td>
            <td className="px-6 py-4 flex gap-2">
                <button
                    onClick={() => handleDelete('dailyLog', log.id)}
                    className="font-medium text-red-600 dark:text-red-500 hover:underline"
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    // User Table Configuration
    const userColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Last Login</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Superuser</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Username</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">First Name</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Last Name</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Staff</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Active</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Date Joined</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Actions</th>
        </>
    );

    const userRows = filteredUsers.map(user => (
        <tr key={user.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-user-${user.id}`}
                        type="checkbox"
                        checked={selectedItems.users.includes(user.id)}
                        onChange={() => handleSelectItem('users', user.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110"
                    />
                    <label htmlFor={`checkbox-user-${user.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.id}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.last_login || 'Never'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.is_superuser ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{user.username}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.first_name}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.last_name}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.is_staff ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{user.is_active ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(user.date_joined).toLocaleDateString()}</td>
            <td className="px-6 py-4">
                <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm">
                        Edit
                    </button>
                    <button
                        onClick={() => handleDelete('user', user.id)}
                        className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                    >
                        Delete
                    </button>
                </div>
            </td>
        </tr>
    ));

    // Token Table Configuration
    const tokenColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">User</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Token</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Created</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Actions</th>
        </>
    );

    const tokenRows = filteredTokens.map(token => (
        <tr key={token.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-token-${token.id}`}
                        type="checkbox"
                        checked={selectedItems.tokens.includes(token.id)}
                        onChange={() => handleSelectItem('tokens', token.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110"
                    />
                    <label htmlFor={`checkbox-token-${token.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{token.id}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{token.user}</td>
            <td className="px-6 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">{token.key}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(token.created).toLocaleString()}</td>
            <td className="px-6 py-4">
                <button
                    onClick={() => handleDelete('token', token.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    // Email Table Configuration
    const emailColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Email</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Verified</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Primary</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Actions</th>
        </>
    );

    const emailRows = filteredEmails.map(email => (
        <tr key={email.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-email-${email.id}`}
                        type="checkbox"
                        checked={selectedItems.emails.includes(email.id)}
                        onChange={() => handleSelectItem('emails', email.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110"
                    />
                    <label htmlFor={`checkbox-email-${email.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{email.id}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{email.email}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{email.verified ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{email.primary ? 'Yes' : 'No'}</td>
            <td className="px-6 py-4">
                <button
                    onClick={() => handleDelete('email', email.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    // Social Account Table Configuration
    const socialAccountColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">User</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Provider</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">UID</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Last Login</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Date Joined</th>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">Actions</th>
        </>
    );

    const socialAccountRows = filteredSocialAccounts.map(account => (
        <tr key={account.id} className="bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
            <td className="w-4 p-4">
                <div className="flex items-center">
                    <input
                        id={`checkbox-social-${account.id}`}
                        type="checkbox"
                        checked={selectedItems.socialAccounts.includes(account.id)}
                        onChange={() => handleSelectItem('socialAccounts', account.id)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 cursor-pointer transition-all hover:scale-110"
                    />
                    <label htmlFor={`checkbox-social-${account.id}`} className="sr-only">checkbox</label>
                </div>
            </td>
            <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{account.id}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{account.user}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300 uppercase">{account.provider}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{account.uid}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{account.last_login ? new Date(account.last_login).toLocaleString() : 'Never'}</td>
            <td className="px-6 py-4 text-gray-700 dark:text-gray-300">{new Date(account.date_joined).toLocaleDateString()}</td>
            <td className="px-6 py-4">
                <button
                    onClick={() => handleDelete('socialAccount', account.id)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm"
                >
                    Delete
                </button>
            </td>
        </tr>
    ));

    return (
        <>
            <main id="main">
                <TopBar
                    onLogout={handleModal}
                    onOpenSettings={() => setShowProfileSettings(true)}
                />
                <SideNav onLogout={handleModal} />
                <section className="dashboard-content">
                    <div className="container mx-auto px-4">
                        {/* Loading Overlay */}
                        {isLoading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-700">Processing...</p>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Overview Section */}
                        <section id="trip-overview" className="mb-8 space-y-6">
                            {/* Welcome Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-xl p-8 shadow-lg text-white">
                                <h1 className="text-4xl font-bold mb-2">ELD Dashboard Overview</h1>
                                <p className="text-blue-100 dark:text-blue-200 text-lg">
                                    Welcome back! Here's what's happening with your fleet today.
                                </p>
                            </div>

                            {/* Statistics Cards Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {/* Total Trips Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full">
                                            +12%
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Trips</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{trips.length}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                        {trips.filter(t => t.status === 'IN_PROGRESS').length} active
                                    </p>
                                </div>

                                {/* Total Distance Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full">
                                            Total
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Distance</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {trips.reduce((sum, trip) => sum + (parseFloat(trip.total_distance) || 0), 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">miles driven</p>
                                </div>

                                {/* Active Drivers Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                                            Live
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Active Drivers</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {new Set(trips.filter(t => t.status === 'IN_PROGRESS').map(t => t.user)).size}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">currently on duty</p>
                                </div>

                                {/* HOS Violations Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-red-100 dark:bg-red-900 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900 px-2 py-1 rounded-full">
                                            Alert
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">HOS Violations</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {dailyLogs.filter(log => log.has_violation).length}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">need attention</p>
                                </div>
                            </div>

                            {/* Quick Actions & Recent Activity */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Quick Actions */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                                        Quick Actions
                                    </h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={() => setShowTripForm(true)}
                                            className="w-full flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded-lg transition-colors group"
                                        >
                                            <div className="bg-blue-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">New Trip</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Create a new trip</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => document.getElementById('all-daily-logs').scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors group"
                                        >
                                            <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">View Logs</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Check daily logs</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => document.getElementById('all-trips').scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group"
                                        >
                                            <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">All Trips</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Manage trips</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                        Recent Activity
                                    </h3>
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {trips.slice(0, 5).map((trip, index) => (
                                            <div key={trip.id} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${trip.status === 'COMPLETED' ? 'bg-green-500' :
                                                    trip.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                        trip.status === 'CANCELLED' ? 'bg-red-500' :
                                                            'bg-gray-500'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                            Trip #{trip.id} - {trip.username}
                                                        </p>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                                                            trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                                                                trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                                                                    'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                                                            }`}>
                                                            {trip.status_display}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                                        {trip.current_location} → {trip.dropoff_location}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                                                        {new Date(trip.created_at).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                        {trips.length === 0 && (
                                            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                                                <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p>No recent activity</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* System Status Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* Compliance Status */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Compliance Rate</h4>
                                        <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="relative pt-1">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-3xl font-bold text-gray-900 dark:text-white">
                                                {dailyLogs.length > 0 ? Math.round(((dailyLogs.length - dailyLogs.filter(l => l.has_violation).length) / dailyLogs.length) * 100) : 100}%
                                            </span>
                                            <span className="text-sm text-gray-600 dark:text-gray-400">
                                                {dailyLogs.length - dailyLogs.filter(l => l.has_violation).length}/{dailyLogs.length} logs
                                            </span>
                                        </div>
                                        <div className="overflow-hidden h-2 text-xs flex rounded-full bg-gray-200 dark:bg-gray-700">
                                            <div
                                                style={{ width: `${dailyLogs.length > 0 ? ((dailyLogs.length - dailyLogs.filter(l => l.has_violation).length) / dailyLogs.length) * 100 : 100}%` }}
                                                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500 transition-all duration-500"
                                            ></div>
                                        </div>
                                    </div>
                                </div>

                                {/* Fleet Status */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Fleet Status</h4>
                                        <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                            <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707l-2-2A1 1 0 0015 7h-1z" />
                                        </svg>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400">
                                                {trips.filter(t => t.status === 'IN_PROGRESS').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                                            <span className="font-bold text-green-600 dark:text-green-400">
                                                {trips.filter(t => t.status === 'COMPLETED').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600 dark:text-gray-400">Planned</span>
                                            <span className="font-bold text-gray-600 dark:text-gray-400">
                                                {trips.filter(t => t.status === 'PLANNED').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Total Stops */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="font-bold text-gray-900 dark:text-white">Total Stops</h4>
                                        <svg className="w-6 h-6 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{stops.length}</p>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Fuel Stops</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {stops.filter(s => s.stop_type === 'FUEL').length}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-600 dark:text-gray-400">Rest Breaks</span>
                                            <span className="font-semibold text-gray-900 dark:text-white">
                                                {stops.filter(s => s.stop_type === 'REST').length}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Trip Planning Section */}
                        <section id="trip-planning" className="mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        ELD Trip Planning System
                                    </h1>
                                    <button
                                        onClick={() => setShowTripForm(!showTripForm)}
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {showTripForm ? 'Hide Form' : 'Create New Trip'}
                                    </button>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Manage trips, view ELD logs, and ensure HOS compliance
                                </p>
                            </div>

                            {/* Trip Form */}
                            {showTripForm && (
                                <div className="mt-6">
                                    <TripForm onTripCreated={handleTripCreated} onCancel={() => setShowTripForm(false)} />
                                </div>
                            )}
                        </section>

                        {/* Trips Table */}
                        <section id="all-trips" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('trips')}
                                    {renderSearchInput('trips', 'Search trips...')}
                                </div>
                                <Table
                                    title="All Trips"
                                    subtitle={`Manage and monitor all trip records`}
                                    columns={tripColumns}
                                    rows={tripRows}
                                    onSelectAll={() => handleSelectAll('trips', filteredTrips.map(t => t.id))}
                                    allSelected={selectedItems.trips.length === filteredTrips.length && filteredTrips.length > 0}
                                    selectedCount={selectedItems.trips.length}
                                />
                            </div>
                        </section>

                        {/* Stops Table */}
                        <section id="all-stops" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('stops')}
                                    {renderSearchInput('stops', 'Search stops...')}
                                </div>
                                <Table
                                    title="All Stops"
                                    subtitle={`View all stop points along routes`}
                                    columns={stopColumns}
                                    rows={stopRows}
                                    onSelectAll={() => handleSelectAll('stops', filteredStops.map(s => s.id))}
                                    allSelected={selectedItems.stops.length === filteredStops.length && filteredStops.length > 0}
                                    selectedCount={selectedItems.stops.length}
                                />
                            </div>
                        </section>

                        {/* Daily Logs Table */}
                        <section id="all-daily-logs" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('dailyLogs')}
                                    {renderSearchInput('dailyLogs', 'Search logs...')}
                                </div>
                                <Table
                                    title="All Daily Logs"
                                    subtitle={`Track driver hours and compliance`}
                                    columns={dailyLogColumns}
                                    rows={dailyLogRows}
                                    onSelectAll={() => handleSelectAll('dailyLogs', filteredDailyLogs.map(l => l.id))}
                                    allSelected={selectedItems.dailyLogs.length === filteredDailyLogs.length && filteredDailyLogs.length > 0}
                                    selectedCount={selectedItems.dailyLogs.length}
                                />
                            </div>
                        </section>

                        {/* Original User Management Tables */}
                        <section id="user-management" className="mt-12 pt-8 border-t-2 border-gray-300">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                User & System Management
                            </h2>

                            {/* User Table */}
                            <div className="mb-8 relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('users')}
                                    {renderSearchInput('users', 'Search users...')}
                                </div>
                                <Table
                                    title="User Management"
                                    subtitle={`Manage system users and permissions`}
                                    columns={userColumns}
                                    rows={userRows}
                                    onSelectAll={() => handleSelectAll('users', filteredUsers.map(u => u.id))}
                                    allSelected={selectedItems.users.length === filteredUsers.length && filteredUsers.length > 0}
                                    selectedCount={selectedItems.users.length}
                                />
                            </div>

                            {/* Token Table */}
                            <div className="mb-8 relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('tokens')}
                                    {renderSearchInput('tokens', 'Search tokens...')}
                                </div>
                                <Table
                                    title="Token Management"
                                    subtitle={`Manage authentication tokens`}
                                    columns={tokenColumns}
                                    rows={tokenRows}
                                    onSelectAll={() => handleSelectAll('tokens', filteredTokens.map(t => t.id))}
                                    allSelected={selectedItems.tokens.length === filteredTokens.length && filteredTokens.length > 0}
                                    selectedCount={selectedItems.tokens.length}
                                />
                            </div>

                            {/* Email Table */}
                            <div className="mb-8 relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('emails')}
                                    {renderSearchInput('emails', 'Search emails...')}
                                </div>
                                <Table
                                    title="Email Management"
                                    subtitle={`Manage user email addresses`}
                                    columns={emailColumns}
                                    rows={emailRows}
                                    onSelectAll={() => handleSelectAll('emails', filteredEmails.map(e => e.id))}
                                    allSelected={selectedItems.emails.length === filteredEmails.length && filteredEmails.length > 0}
                                    selectedCount={selectedItems.emails.length}
                                />
                            </div>

                            {/* Social Account Table */}
                            <div className="mb-8 relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('socialAccounts')}
                                    {renderSearchInput('socialAccounts', 'Search accounts...')}
                                </div>
                                <Table
                                    title="Social Account Management"
                                    subtitle={`Manage social authentication accounts`}
                                    columns={socialAccountColumns}
                                    rows={socialAccountRows}
                                    onSelectAll={() => handleSelectAll('socialAccounts', filteredSocialAccounts.map(a => a.id))}
                                    allSelected={selectedItems.socialAccounts.length === filteredSocialAccounts.length && filteredSocialAccounts.length > 0}
                                    selectedCount={selectedItems.socialAccounts.length}
                                />
                            </div>
                        </section>
                    </div>
                </section>
            </main>

            {/* Trip Details Modal */}
            {showTripDetails && selectedTrip && (
                <TripDetailsModal
                    trip={selectedTrip}
                    onClose={() => {
                        setShowTripDetails(false);
                        setSelectedTrip(null);
                    }}
                />
            )}

            {/* Profile Settings Modal */}
            {showProfileSettings && currentUser && (
                <ProfileSettings
                    user={currentUser}
                    onClose={() => setShowProfileSettings(false)}
                    onUpdate={refetchCurrentUser}
                />
            )}
        </>
    );
}

export default Dashboard;