import { useState } from 'react';

const TripForm = ({ onTripCreated, onCancel }) => {
    const [formData, setFormData] = useState({
        current_location: '',
        current_lat: '',
        current_lng: '',
        pickup_location: '',
        pickup_lat: '',
        pickup_lng: '',
        dropoff_location: '',
        dropoff_lat: '',
        dropoff_lng: '',
        current_cycle_used: '0'
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('https://spotter-eld-app-backend.onrender.com/api/trips/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    current_location: formData.current_location,
                    current_lat: formData.current_lat || null,
                    current_lng: formData.current_lng || null,
                    pickup_location: formData.pickup_location,
                    pickup_lat: formData.pickup_lat || null,
                    pickup_lng: formData.pickup_lng || null,
                    dropoff_location: formData.dropoff_location,
                    dropoff_lat: formData.dropoff_lat || null,
                    dropoff_lng: formData.dropoff_lng || null,
                    current_cycle_used: parseFloat(formData.current_cycle_used)
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(JSON.stringify(errorData));
            }

            const data = await response.json();
            setSuccess(true);
            
            // Reset form
            setFormData({
                current_location: '',
                current_lat: '',
                current_lng: '',
                pickup_location: '',
                pickup_lat: '',
                pickup_lng: '',
                dropoff_location: '',
                dropoff_lat: '',
                dropoff_lng: '',
                current_cycle_used: '0'
            });

            // Call parent callback
            setTimeout(() => {
                onTripCreated(data);
            }, 1500);

        } catch (err) {
            setError(err.message || 'Failed to create trip');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Create New Trip
                </h2>
                {onCancel && (
                    <button
                        onClick={onCancel}
                        className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
                    <strong>Error:</strong> {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                    <strong>Success!</strong> Trip created successfully. Route and logs are being calculated...
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Current Location Section */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Current Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="current_location"
                                value={formData.current_location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., New York, NY"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Latitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="current_lat"
                                value={formData.current_lat}
                                onChange={handleChange}
                                placeholder="40.7128"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Longitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="current_lng"
                                value={formData.current_lng}
                                onChange={handleChange}
                                placeholder="-74.0060"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Pickup Location Section */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Pickup Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="pickup_location"
                                value={formData.pickup_location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Philadelphia, PA"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Latitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="pickup_lat"
                                value={formData.pickup_lat}
                                onChange={handleChange}
                                placeholder="39.9526"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Longitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="pickup_lng"
                                value={formData.pickup_lng}
                                onChange={handleChange}
                                placeholder="-75.1652"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Dropoff Location Section */}
                <div className="border-b pb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Dropoff Location
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-3">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Address *
                            </label>
                            <input
                                type="text"
                                name="dropoff_location"
                                value={formData.dropoff_location}
                                onChange={handleChange}
                                required
                                placeholder="e.g., Washington, DC"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Latitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="dropoff_lat"
                                value={formData.dropoff_lat}
                                onChange={handleChange}
                                placeholder="38.9072"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Longitude (optional)
                            </label>
                            <input
                                type="number"
                                step="any"
                                name="dropoff_lng"
                                value={formData.dropoff_lng}
                                onChange={handleChange}
                                placeholder="-77.0369"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                        </div>
                    </div>
                </div>

                {/* Cycle Hours Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                        Driver Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Current Cycle Hours Used (0-70) *
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max="70"
                                name="current_cycle_used"
                                value={formData.current_cycle_used}
                                onChange={handleChange}
                                required
                                placeholder="15.5"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                            />
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                Hours already used in the current 8-day cycle (70-hour limit)
                            </p>
                        </div>
                        <div className="flex items-center">
                            <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg w-full">
                                <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
                                    Available Hours
                                </p>
                                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                                    {(70 - parseFloat(formData.current_cycle_used || 0)).toFixed(2)}
                                </p>
                                <p className="text-xs text-blue-700 dark:text-blue-300">
                                    out of 70 hours
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 px-6 py-3 rounded-lg font-semibold text-white transition-colors ${
                            loading
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                        }`}
                    >
                        {loading ? (
                            <span className="flex items-center justify-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Creating Trip...
                            </span>
                        ) : (
                            'Create Trip'
                        )}
                    </button>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </div>

                {/* Info Box */}
                <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                        ℹ️ Note:
                    </h4>
                    <ul className="text-sm text-yellow-800 dark:text-yellow-300 space-y-1">
                        <li>• The system will automatically calculate the route and generate ELD logs</li>
                        <li>• Stops will be added based on HOS regulations (fuel, rest, breaks)</li>
                        <li>• If you don't provide coordinates, addresses will be geocoded automatically</li>
                        <li>• Daily logs will be generated showing compliance with 70-hour/8-day rules</li>
                    </ul>
                </div>
            </form>
        </div>
    );
};

export default TripForm;