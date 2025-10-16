import { useState } from 'react';
import RouteMap from './RouteMap';
import ELDLogGraph from './ELDLogGraph';

const TripDetailsModal = ({ trip, onClose }) => {
    const [activeTab, setActiveTab] = useState('overview');

    if (!trip) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                            Trip Details - #{trip.id}
                        </h2>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            Driver: {trip.username} | Status: {trip.status_display}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Tabs */}
                <div className="border-b border-gray-200 dark:border-gray-700">
                    <nav className="flex px-6 -mb-px">
                        <button
                            onClick={() => setActiveTab('overview')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'overview'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Overview
                        </button>
                        <button
                            onClick={() => setActiveTab('stops')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'stops'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Stops ({trip.stops?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('logs')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'logs'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Daily Logs ({trip.daily_logs?.length || 0})
                        </button>
                        <button
                            onClick={() => setActiveTab('route')}
                            className={`py-4 px-6 font-medium text-sm border-b-2 transition-colors ${
                                activeTab === 'route'
                                    ? 'border-blue-600 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                        >
                            Route Map
                        </button>
                    </nav>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {activeTab === 'overview' && <OverviewTab trip={trip} />}
                    {activeTab === 'stops' && <StopsTab stops={trip.stops || []} />}
                    {activeTab === 'logs' && <DailyLogsTab logs={trip.daily_logs || []} />}
                    {activeTab === 'route' && <RouteMap trip={trip} />}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

const OverviewTab = ({ trip }) => {
    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 dark:text-blue-200">Total Distance</p>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {trip.total_distance || 'N/A'} mi
                    </p>
                </div>
                <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg">
                    <p className="text-sm font-medium text-green-900 dark:text-green-200">Estimated Duration</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {trip.estimated_duration || 'N/A'} hrs
                    </p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg">
                    <p className="text-sm font-medium text-purple-900 dark:text-purple-200">Cycle Used</p>
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {trip.current_cycle_used} / 70
                    </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg">
                    <p className="text-sm font-medium text-orange-900 dark:text-orange-200">Available Hours</p>
                    <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {trip.available_driving_hours} hrs
                    </p>
                </div>
            </div>

            {/* Route Information */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    Route Information
                </h3>
                <div className="space-y-4">
                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 dark:text-blue-400 font-bold">A</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Starting Point</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.current_location}</p>
                            {trip.current_lat && trip.current_lng && (
                                <p className="text-xs text-gray-500">{trip.current_lat}, {trip.current_lng}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                            <span className="text-green-600 dark:text-green-400 font-bold">B</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Pickup Location</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.pickup_location}</p>
                            {trip.pickup_lat && trip.pickup_lng && (
                                <p className="text-xs text-gray-500">{trip.pickup_lat}, {trip.pickup_lng}</p>
                            )}
                        </div>
                    </div>

                    <div className="flex items-start">
                        <div className="flex-shrink-0 w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                            <span className="text-red-600 dark:text-red-400 font-bold">C</span>
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Dropoff Location</p>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.dropoff_location}</p>
                            {trip.dropoff_lat && trip.dropoff_lng && (
                                <p className="text-xs text-gray-500">{trip.dropoff_lat}, {trip.dropoff_lng}</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Trip Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Trip Status
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Status:</span>
                            <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                                trip.status === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                                trip.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' :
                                trip.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                                {trip.status_display}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Created:</span>
                            <span className="text-gray-900 dark:text-white">
                                {new Date(trip.created_at).toLocaleString()}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                            <span className="text-gray-900 dark:text-white">
                                {new Date(trip.updated_at).toLocaleString()}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Driver Information
                    </h3>
                    <div className="space-y-2">
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">Driver:</span>
                            <span className="text-gray-900 dark:text-white font-semibold">{trip.username}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600 dark:text-gray-400">User ID:</span>
                            <span className="text-gray-900 dark:text-white">{trip.user}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StopsTab = ({ stops }) => {
    if (!stops || stops.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No stops found for this trip.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {stops.map((stop, index) => (
                <div key={stop.id} className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                    <div className="flex items-start justify-between">
                        <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 font-bold">{index + 1}</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        {stop.location}
                                    </h4>
                                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                        stop.stop_type === 'FUEL' ? 'bg-yellow-100 text-yellow-800' :
                                        stop.stop_type === 'REST' ? 'bg-blue-100 text-blue-800' :
                                        stop.stop_type === 'OFF_DUTY' ? 'bg-purple-100 text-purple-800' :
                                        'bg-green-100 text-green-800'
                                    }`}>
                                        {stop.stop_type_display}
                                    </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Arrival:</p>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {new Date(stop.arrival_time).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Departure:</p>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {new Date(stop.departure_time).toLocaleString()}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Duration:</p>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {stop.duration_minutes} minutes ({stop.duration_hours} hours)
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-600 dark:text-gray-400">Distance from start:</p>
                                        <p className="text-gray-900 dark:text-white font-medium">
                                            {stop.distance_from_start} miles
                                        </p>
                                    </div>
                                </div>
                                {stop.notes && (
                                    <div className="mt-3 text-sm">
                                        <p className="text-gray-600 dark:text-gray-400">Notes:</p>
                                        <p className="text-gray-900 dark:text-white">{stop.notes}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

const DailyLogsTab = ({ logs }) => {
    if (!logs || logs.length === 0) {
        return (
            <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">No daily logs found for this trip.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {logs.map((log) => (
                <div key={log.id} className="space-y-4">
                    {/* Log Header Card */}
                    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div>
                                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {new Date(log.log_date).toLocaleDateString('en-US', { 
                                        weekday: 'long', 
                                        year: 'numeric', 
                                        month: 'long', 
                                        day: 'numeric' 
                                    })}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Driver: {log.driver_username}
                                </p>
                            </div>
                            {log.has_violation && (
                                <span className="px-3 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                    ⚠️ HOS Violation
                                </span>
                            )}
                        </div>

                        {/* Hours Breakdown */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
                                <p className="text-xs text-blue-900 dark:text-blue-200">Driving</p>
                                <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                                    {log.driving_hours}h
                                </p>
                            </div>
                            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
                                <p className="text-xs text-green-900 dark:text-green-200">On Duty</p>
                                <p className="text-xl font-bold text-green-600 dark:text-green-400">
                                    {log.on_duty_not_driving_hours}h
                                </p>
                            </div>
                            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-lg">
                                <p className="text-xs text-purple-900 dark:text-purple-200">Off Duty</p>
                                <p className="text-xl font-bold text-purple-600 dark:text-purple-400">
                                    {log.off_duty_hours}h
                                </p>
                            </div>
                            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
                                <p className="text-xs text-orange-900 dark:text-orange-200">Sleeper</p>
                                <p className="text-xl font-bold text-orange-600 dark:text-orange-400">
                                    {log.sleeper_berth_hours}h
                                </p>
                            </div>
                        </div>

                        {/* Additional Info */}
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Total Hours:</p>
                                <p className="text-gray-900 dark:text-white font-medium">{log.total_hours} hours</p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Total Miles:</p>
                                <p className="text-gray-900 dark:text-white font-medium">{log.total_miles} miles</p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Starting Location:</p>
                                <p className="text-gray-900 dark:text-white font-medium">{log.starting_location || 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-gray-600 dark:text-gray-400">Ending Location:</p>
                                <p className="text-gray-900 dark:text-white font-medium">{log.ending_location || 'N/A'}</p>
                            </div>
                        </div>
                    </div>

                    {/* ELD Visual Graph - THE NEW COMPONENT */}
                    <ELDLogGraph dailyLog={log} />
                </div>
            ))}
        </div>
    );
};

export default TripDetailsModal;