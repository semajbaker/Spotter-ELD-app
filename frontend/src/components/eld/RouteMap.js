import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Move helper functions OUTSIDE the component
const getStopIconColor = (stopType) => {
    const colors = {
        'FUEL': '#F59E0B',
        'REST': '#8B5CF6',
        'SLEEPER': '#6366F1',
        'OFF_DUTY': '#EC4899',
        'PICKUP': '#10B981',
        'DROPOFF': '#EF4444'
    };
    return colors[stopType] || '#6B7280';
};

const getStopIcon = (stopType) => {
    const icons = {
        'FUEL': '⛽',
        'REST': '☕',
        'SLEEPER': '🛏️',
        'OFF_DUTY': '🏠',
        'PICKUP': '📦',
        'DROPOFF': '📍'
    };
    return icons[stopType] || '📍';
};

const createCustomIcon = (label, color) => {
    return L.divIcon({
        className: 'custom-map-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 3px solid white;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                font-weight: bold;
                color: white;
                font-size: 14px;
            ">
                ${label}
            </div>
        `,
        iconSize: [30, 30],
        iconAnchor: [15, 15],
    });
};

const createStopIcon = (stopType) => {
    const color = getStopIconColor(stopType);
    const emoji = getStopIcon(stopType);
    return L.divIcon({
        className: 'custom-stop-marker',
        html: `
            <div style="
                background-color: ${color};
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                border: 2px solid white;
                box-shadow: 0 2px 4px rgba(0,0,0,0.3);
                font-size: 12px;
            ">
                ${emoji}
            </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
    });
};

const RouteMap = ({ trip }) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylinesRef = useRef([]);

    useEffect(() => {
        if (!mapRef.current || mapInstanceRef.current) return;

        // Initialize map
        const map = L.map(mapRef.current).setView([39.8283, -98.5795], 4);

        // Add OpenStreetMap tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            maxZoom: 19,
        }).addTo(map);

        mapInstanceRef.current = map;

        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const map = mapInstanceRef.current;
        if (!map || !trip) return;

        // Clear existing markers and polylines
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        polylinesRef.current.forEach(polyline => polyline.remove());
        polylinesRef.current = [];

        const bounds = L.latLngBounds([]);

        // Main locations
        const locations = [
            {
                coords: [parseFloat(trip.current_lat), parseFloat(trip.current_lng)],
                label: 'A',
                color: '#3B82F6',
                title: 'Current Location',
                info: trip.current_location
            },
            {
                coords: [parseFloat(trip.pickup_lat), parseFloat(trip.pickup_lng)],
                label: 'B',
                color: '#10B981',
                title: 'Pickup Location',
                info: trip.pickup_location
            },
            {
                coords: [parseFloat(trip.dropoff_lat), parseFloat(trip.dropoff_lng)],
                label: 'C',
                color: '#EF4444',
                title: 'Dropoff Location',
                info: trip.dropoff_location
            }
        ];

        // Add main location markers
        locations.forEach(location => {
            if (location.coords[0] && location.coords[1] && 
                !isNaN(location.coords[0]) && !isNaN(location.coords[1])) {
                
                const marker = L.marker(location.coords, {
                    icon: createCustomIcon(location.label, location.color)
                }).addTo(map);

                marker.bindPopup(`
                    <div style="padding: 5px;">
                        <h3 style="font-weight: bold; margin-bottom: 5px; font-size: 14px;">
                            ${location.title}
                        </h3>
                        <p style="margin: 0; font-size: 12px;">${location.info}</p>
                    </div>
                `);

                markersRef.current.push(marker);
                bounds.extend(location.coords);
            }
        });

        // Add stop markers
        if (trip.stops && trip.stops.length > 0) {
            trip.stops.forEach(stop => {
                if (stop.latitude && stop.longitude) {
                    const stopCoords = [parseFloat(stop.latitude), parseFloat(stop.longitude)];
                    
                    const stopMarker = L.marker(stopCoords, {
                        icon: createStopIcon(stop.stop_type)
                    }).addTo(map);

                    stopMarker.bindPopup(`
                        <div style="padding: 5px; min-width: 200px;">
                            <h4 style="font-weight: bold; margin-bottom: 5px; font-size: 13px;">
                                ${getStopIcon(stop.stop_type)} ${stop.stop_type_display}
                            </h4>
                            <p style="margin: 3px 0; font-size: 11px;">
                                <strong>Location:</strong> ${stop.location}
                            </p>
                            <p style="margin: 3px 0; font-size: 11px;">
                                <strong>Duration:</strong> ${stop.duration_minutes} minutes
                            </p>
                            <p style="margin: 3px 0; font-size: 11px;">
                                <strong>Distance:</strong> ${stop.distance_from_start} mi from start
                            </p>
                            ${stop.notes ? `<p style="margin: 3px 0; font-size: 11px;">
                                <strong>Notes:</strong> ${stop.notes}
                            </p>` : ''}
                        </div>
                    `);

                    markersRef.current.push(stopMarker);
                    bounds.extend(stopCoords);
                }
            });
        }

        // Draw route polyline
        if (trip.waypoints && trip.waypoints.length > 0) {
            const routePath = trip.waypoints.map(waypoint => [
                parseFloat(waypoint.latitude),
                parseFloat(waypoint.longitude)
            ]);

            const polyline = L.polyline(routePath, {
                color: '#3B82F6',
                weight: 4,
                opacity: 0.8
            }).addTo(map);

            polylinesRef.current.push(polyline);
            routePath.forEach(coords => bounds.extend(coords));
        } else {
            // Draw simple line between locations
            const simplePath = locations
                .filter(loc => loc.coords[0] && loc.coords[1] && 
                        !isNaN(loc.coords[0]) && !isNaN(loc.coords[1]))
                .map(loc => loc.coords);

            if (simplePath.length > 1) {
                const polyline = L.polyline(simplePath, {
                    color: '#3B82F6',
                    weight: 3,
                    opacity: 0.6,
                    dashArray: '10, 10'
                }).addTo(map);

                polylinesRef.current.push(polyline);
            }
        }

        // Fit map to bounds
        if (bounds.isValid()) {
            map.fitBounds(bounds, { padding: [50, 50] });
        }

    }, [trip]); // Now no missing dependencies warning!

    return (
        <div className="space-y-4">
            {/* Map Container */}
            <div 
                ref={mapRef} 
                className="w-full h-96 rounded-lg shadow-lg border border-gray-300 dark:border-gray-600"
                style={{ minHeight: '400px', zIndex: 0 }}
            />

            {/* Legend */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Map Legend
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Current Location (A)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-green-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Pickup Location (B)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                        <span className="text-gray-700 dark:text-gray-300">Dropoff Location (C)</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">⛽</span>
                        <span className="text-gray-700 dark:text-gray-300">Fuel Stop</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">☕</span>
                        <span className="text-gray-700 dark:text-gray-300">Rest Break</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-lg">🏠</span>
                        <span className="text-gray-700 dark:text-gray-300">Off Duty</span>
                    </div>
                </div>
            </div>

            {/* Trip Summary */}
            <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-200 mb-2">
                    Route Summary
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <p className="text-blue-700 dark:text-blue-300">Total Distance</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {trip.total_distance || 'N/A'} mi
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-700 dark:text-blue-300">Est. Duration</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {trip.estimated_duration || 'N/A'} hrs
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-700 dark:text-blue-300">Total Stops</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {trip.stops?.length || 0}
                        </p>
                    </div>
                    <div>
                        <p className="text-blue-700 dark:text-blue-300">Waypoints</p>
                        <p className="text-lg font-bold text-blue-900 dark:text-blue-100">
                            {trip.waypoints?.length || 0}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RouteMap;