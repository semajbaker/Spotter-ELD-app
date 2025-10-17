// frontend/src/pages/driver/Dashboard.js

import { useEffect, useState } from 'react';
import SideNav from "../../components/driver/SideNav";
import TopBar from "../../components/driver/TopBar";
import Table from "../../components/Table";
import TripForm from "../../components/eld/TripForm";
import TripDetailsModal from "../../components/eld/TripDetailsModal";
import ProfileSettings from "../../components/ProfileSettings";

const DriverDashboard = (props) => {
    // User state
    const [currentUser, setCurrentUser] = useState(null);
    
    // ELD Trip state
    const [trips, setTrips] = useState([]);
    const [stops, setStops] = useState([]);
    const [dailyLogs, setDailyLogs] = useState([]);
    
    // UI state
    const [showTripForm, setShowTripForm] = useState(false);
    const [selectedTrip, setSelectedTrip] = useState(null);
    const [showTripDetails, setShowTripDetails] = useState(false);
    const [showProfileSettings, setShowProfileSettings] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Search state
    const [searchQueries, setSearchQueries] = useState({
        trips: '',
        stops: '',
        dailyLogs: ''
    });
    
    // Selected items for bulk actions
    const [selectedItems, setSelectedItems] = useState({
        trips: [],
        stops: [],
        dailyLogs: []
    });
    
    // Dropdown state
    const [openDropdown, setOpenDropdown] = useState(null);

    const API_BASE = 'https://spotter-eld-app.onrender.com';

    // Fetch Current User Profile
    useEffect(() => {
        fetchCurrentUser();
    }, []);

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

    // Fetch User's Trips
    useEffect(() => {
        fetchTrips();
    }, []);

    const fetchTrips = () => {
        fetch(`${API_BASE}/api/trips/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.results)) {
                    setTrips(data.results);
                } else if (Array.isArray(data)) {
                    setTrips(data);
                }
            })
            .catch(error => console.error('Error fetching trips data:', error));
    };

    // Fetch User's Stops
    useEffect(() => {
        fetchStops();
    }, []);

    const fetchStops = () => {
        fetch(`${API_BASE}/api/stops/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.results)) {
                    setStops(data.results);
                } else if (Array.isArray(data)) {
                    setStops(data);
                }
            })
            .catch(error => console.error('Error fetching stops data:', error));
    };

    // Fetch User's Daily Logs
    useEffect(() => {
        fetchDailyLogs();
    }, []);

    const fetchDailyLogs = () => {
        fetch(`${API_BASE}/api/daily-logs/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                if (Array.isArray(data.results)) {
                    setDailyLogs(data.results);
                } else if (Array.isArray(data)) {
                    setDailyLogs(data);
                }
            })
            .catch(error => console.error('Error fetching daily logs data:', error));
    };

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

    // Delete handlers
    const handleDelete = (type, id) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) return;
        
        const endpoints = {
            trip: `/api/trips/${id}/`,
            stop: `/api/stops/${id}/`,
            dailyLog: `/api/daily-logs/${id}/`
        };

        fetch(`${API_BASE}${endpoints[type]}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(() => {
                alert(`${type} deleted successfully!`);
                switch(type) {
                    case 'trip': 
                        fetchTrips(); 
                        break;
                    case 'stop': 
                        fetchStops(); 
                        break;
                    case 'dailyLog': 
                        fetchDailyLogs(); 
                        break;
                    default:
                        break;
                }
            })
            .catch(error => console.error(`Error deleting ${type}:`, error));
    };

    // Bulk delete handler
    const handleBulkDelete = (table) => {
        const items = selectedItems[table];
        if (items.length === 0) {
            alert('No items selected');
            return;
        }
        
        if (!window.confirm(`Delete ${items.length} selected items?`)) return;
        
        setLoading(true);
        const typeMap = {
            trips: 'trip',
            stops: 'stop',
            dailyLogs: 'dailyLog'
        };
        
        Promise.all(
            items.map(id => handleDelete(typeMap[table], id))
        ).finally(() => {
            setSelectedItems(prev => ({ ...prev, [table]: [] }));
            setLoading(false);
        });
    };

    // Trip handlers
    const handleViewTrip = (tripId) => {
        setLoading(true);
        fetch(`${API_BASE}/api/trips/${tripId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        })
            .then(response => response.json())
            .then(data => {
                setSelectedTrip(data);
                setShowTripDetails(true);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error fetching trip details:', error);
                setLoading(false);
            });
    };

    const handleRecalculateTrip = (tripId) => {
        if (window.confirm('Recalculate route and logs for this trip?')) {
            setLoading(true);
            fetch(`${API_BASE}/api/trips/${tripId}/recalculate/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            })
                .then(response => response.json())
                .then(() => {
                    fetchTrips();
                    alert('Trip recalculated successfully!');
                    setLoading(false);
                })
                .catch(error => {
                    console.error('Error recalculating trip:', error);
                    alert('Error recalculating trip');
                    setLoading(false);
                });
        }
    };

    const handleTripCreated = () => {
        fetchTrips();
        fetchDailyLogs();
        
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

    // Trip Table Configuration (same as admin)
    const tripColumns = (
        <>
            <th scope="col" className="px-6 py-4 text-gray-700 dark:text-gray-300 font-semibold tracking-wider">ID</th>
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
            <td className="px-6 py-4">
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full shadow-sm ${
                    trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
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
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    stop.stop_type === 'FUEL' ? 'bg-yellow-100 text-yellow-800' :
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

    return (
        <>
            <main id="main">
                <TopBar 
                    currentUser={currentUser} 
                    onLogout={props.onLogout}
                    onOpenSettings={() => setShowProfileSettings(true)}
                />
                <SideNav onLogout={props.onLogout} />
                <section className="dashboard-content">
                    <div className="container mx-auto px-4">
                        {/* Loading Overlay */}
                        {loading && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                                <div className="bg-white p-6 rounded-lg">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                                    <p className="mt-4 text-gray-700">Processing...</p>
                                </div>
                            </div>
                        )}

                        {/* Dashboard Overview Section */}
                        <section id="driver-overview" className="mb-8 space-y-6">
                            {/* Welcome Header */}
                            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 dark:from-blue-800 dark:to-indigo-900 rounded-xl p-8 shadow-lg text-white">
                                <h1 className="text-4xl font-bold mb-2">
                                    Welcome, {currentUser?.first_name || currentUser?.username}!
                                </h1>
                                <p className="text-blue-100 dark:text-blue-200 text-lg">
                                    Track your trips, monitor your hours, and stay compliant with HOS regulations.
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
                                            My Trips
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
                                            Miles
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Total Distance</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {trips.reduce((sum, trip) => sum + (parseFloat(trip.total_distance) || 0), 0).toLocaleString()}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">miles driven</p>
                                </div>

                                {/* Hours Available Card */}
                                <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700 hover:shadow-xl transition-shadow">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                            <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                        <span className="text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900 px-2 py-1 rounded-full">
                                            HOS
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Driving Hours</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {dailyLogs.reduce((sum, log) => sum + parseFloat(log.driving_hours || 0), 0).toFixed(1)}h
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">total logged</p>
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
                                            Alerts
                                        </span>
                                    </div>
                                    <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">Violations</h3>
                                    <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {dailyLogs.filter(log => log.has_violation).length}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">need review</p>
                                </div>
                            </div>

                            {/* Quick Actions & Profile */}
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
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Plan a new route</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => document.getElementById('my-trips').scrollIntoView({ behavior: 'smooth' })}
                                            className="w-full flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 rounded-lg transition-colors group"
                                        >
                                            <div className="bg-green-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">View Trips</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">See all my trips</p>
                                            </div>
                                        </button>

                                        <button
                                            onClick={() => setShowProfileSettings(true)}
                                            className="w-full flex items-center gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/40 rounded-lg transition-colors group"
                                        >
                                            <div className="bg-purple-600 p-2 rounded-lg group-hover:scale-110 transition-transform">
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                            </div>
                                            <div className="text-left">
                                                <p className="font-semibold text-gray-900 dark:text-white">Settings</p>
                                                <p className="text-xs text-gray-600 dark:text-gray-400">Update profile</p>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                {/* Recent Activity */}
                                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                        <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                                        Recent Trips
                                    </h3>
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {trips.slice(0, 5).map((trip, index) => (
                                            <div key={trip.id} className="flex items-start gap-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                                                    trip.status === 'COMPLETED' ? 'bg-green-500' :
                                                    trip.status === 'IN_PROGRESS' ? 'bg-blue-500' :
                                                    trip.status === 'CANCELLED' ? 'bg-red-500' :
                                                    'bg-gray-500'
                                                }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate">
                                                            Trip #{trip.id}
                                                        </p>
                                                        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                                                            trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
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
                                                <p>No trips yet. Create your first trip!</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Trip Planning Section */}
                        <section id="trip-planning" className="mb-8">
                            <div className="bg-blue-50 dark:bg-blue-900 p-6 rounded-lg">
                                <div className="flex justify-between items-center mb-4">
                                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        Plan Your Trip
                                    </h1>
                                    <button
                                        onClick={() => setShowTripForm(!showTripForm)}
                                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        {showTripForm ? 'Hide Form' : 'Create New Trip'}
                                    </button>
                                </div>
                                <p className="text-gray-700 dark:text-gray-300">
                                    Create and manage your trips with automatic HOS compliance calculations
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
                        <section id="my-trips" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('trips')}
                                    {renderSearchInput('trips', 'Search my trips...')}
                                </div>
                                <Table 
                                    title="My Trips" 
                                    subtitle={`All your trip records`}
                                    columns={tripColumns} 
                                    rows={tripRows}
                                    onSelectAll={() => handleSelectAll('trips', filteredTrips.map(t => t.id))}
                                    allSelected={selectedItems.trips.length === filteredTrips.length && filteredTrips.length > 0}
                                    selectedCount={selectedItems.trips.length}
                                />
                            </div>
                        </section>

                        {/* Stops Table */}
                        <section id="my-stops" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('stops')}
                                    {renderSearchInput('stops', 'Search stops...')}
                                </div>
                                <Table 
                                    title="My Stops" 
                                    subtitle={`View all stop points along your routes`}
                                    columns={stopColumns} 
                                    rows={stopRows}
                                    onSelectAll={() => handleSelectAll('stops', filteredStops.map(s => s.id))}
                                    allSelected={selectedItems.stops.length === filteredStops.length && filteredStops.length > 0}
                                    selectedCount={selectedItems.stops.length}
                                />
                            </div>
                        </section>

                        {/* Daily Logs Table */}
                        <section id="my-logs" className="mb-8">
                            <div className="relative overflow-x-auto">
                                <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 px-2">
                                    {renderActionDropdown('dailyLogs')}
                                    {renderSearchInput('dailyLogs', 'Search logs...')}
                                </div>
                                <Table 
                                    title="My Daily Logs" 
                                    subtitle={`Track your hours and stay compliant`}
                                    columns={dailyLogColumns} 
                                    rows={dailyLogRows}
                                    onSelectAll={() => handleSelectAll('dailyLogs', filteredDailyLogs.map(l => l.id))}
                                    allSelected={selectedItems.dailyLogs.length === filteredDailyLogs.length && filteredDailyLogs.length > 0}
                                    selectedCount={selectedItems.dailyLogs.length}
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
                    onUpdate={fetchCurrentUser}
                />
            )}
        </>
    );
}

export default DriverDashboard;