"""
Route Calculator Module
Handles route calculations using OpenStreetMap (Nominatim) for geocoding
"""
import requests
from datetime import datetime, timedelta
from typing import Dict, List, Tuple
from time import sleep
from django.utils import timezone


class RouteCalculator:
    """
    Calculates routes, distances, and generates stops based on ELD requirements
    Uses OpenStreetMap's Nominatim API (free, no API key required)
    """
    
    def __init__(self):
        self.average_speed_mph = 60  # Average highway speed
        self.nominatim_url = "https://nominatim.openstreetmap.org"
        # User agent required by Nominatim usage policy
        self.user_agent = "ELD-Trip-Planner/1.0"
        
    def calculate_route(self, trip) -> Dict:
        """
        Main method to calculate complete route with all stops
        
        Returns:
            Dictionary containing:
            - total_distance: float (miles)
            - estimated_duration: float (hours)
            - stops: list of stop dictionaries
            - waypoints: list of waypoint dictionaries
        """
        # Get coordinates for locations
        current_coords = self._get_coordinates(
            trip.current_location,
            trip.current_lat,
            trip.current_lng
        )
        pickup_coords = self._get_coordinates(
            trip.pickup_location,
            trip.pickup_lat,
            trip.pickup_lng
        )
        dropoff_coords = self._get_coordinates(
            trip.dropoff_location,
            trip.dropoff_lat,
            trip.dropoff_lng
        )
        
        # Calculate route segments using Haversine formula
        segment1 = self._calculate_segment(current_coords, pickup_coords)
        segment2 = self._calculate_segment(pickup_coords, dropoff_coords)
        
        total_distance = segment1['distance'] + segment2['distance']
        base_duration = segment1['duration'] + segment2['duration']
        
        # Generate stops based on ELD rules and distance
        stops = self._generate_stops(
            trip,
            current_coords,
            pickup_coords,
            dropoff_coords,
            total_distance,
            base_duration
        )
        
        # Calculate total duration including stops
        total_stop_duration = sum(stop['duration_minutes'] for stop in stops) / 60.0
        estimated_duration = base_duration + total_stop_duration
        
        # Generate waypoints for map display
        waypoints = self._generate_waypoints(
            current_coords,
            pickup_coords,
            dropoff_coords,
            total_distance
        )
        
        return {
            'total_distance': round(total_distance, 2),
            'estimated_duration': round(estimated_duration, 2),
            'stops': stops,
            'waypoints': waypoints
        }
    
    def _get_coordinates(self, address: str, lat: float = None, lng: float = None) -> Tuple[float, float]:
        """
        Get coordinates for an address, either from provided lat/lng or geocoding
        """
        if lat is not None and lng is not None:
            return (float(lat), float(lng))
        
        # Geocode the address using OpenStreetMap Nominatim
        return self._geocode_address(address)
    
    def _geocode_address(self, address: str) -> Tuple[float, float]:
        """
        Geocode an address to coordinates using OpenStreetMap Nominatim API (FREE)
        
        Nominatim Usage Policy:
        - Maximum 1 request per second
        - Must provide User-Agent header
        - Free for low-volume usage
        """
        try:
            # Sleep to respect rate limit (1 request per second)
            sleep(1)
            
            url = f"{self.nominatim_url}/search"
            params = {
                'q': address,
                'format': 'json',
                'limit': 1
            }
            headers = {
                'User-Agent': self.user_agent
            }
            
            response = requests.get(url, params=params, headers=headers, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            if data and len(data) > 0:
                location = data[0]
                lat = float(location['lat'])
                lon = float(location['lon'])
                print(f"Geocoded '{address}' to ({lat}, {lon})")
                return (lat, lon)
            else:
                print(f"Geocoding failed for '{address}': No results found")
                
        except requests.exceptions.RequestException as e:
            print(f"Geocoding error for '{address}': {str(e)}")
        except (KeyError, ValueError, IndexError) as e:
            print(f"Geocoding parse error for '{address}': {str(e)}")
        
        # Return default coordinates (center of USA) if geocoding fails
        print(f"Using default coordinates for '{address}'")
        return (39.8283, -98.5795)
    
    def _calculate_segment(self, start_coords: Tuple[float, float], 
                          end_coords: Tuple[float, float]) -> Dict:
        """
        Calculate distance and duration for a route segment using Haversine formula
        """
        from math import radians, cos, sin, asin, sqrt
        
        lat1, lon1 = start_coords
        lat2, lon2 = end_coords
        
        # Haversine formula for great-circle distance
        lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
        dlon = lon2 - lon1
        dlat = lat2 - lat1
        a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
        c = 2 * asin(sqrt(a))
        
        # Earth's radius in miles
        r = 3956
        distance = c * r
        
        # Estimate duration based on average highway speed
        duration = distance / self.average_speed_mph
        
        return {
            'distance': distance,
            'duration': duration
        }
    
    def _generate_stops(self, trip, current_coords: Tuple, pickup_coords: Tuple,
                       dropoff_coords: Tuple, total_distance: float, 
                       base_duration: float) -> List[Dict]:
        """
        Generate required stops based on ELD rules and trip requirements
        """
        stops = []
        sequence = 0
        cumulative_distance = 0
        cumulative_time = 0
        current_driving_hours = 0
        start_time = timezone.now()
        
        # Calculate segment distances
        segment1_data = self._calculate_segment(current_coords, pickup_coords)
        segment2_data = self._calculate_segment(pickup_coords, dropoff_coords)
        
        segment1_distance = segment1_data['distance']
        segment1_duration = segment1_data['duration']
        
        # Drive to pickup with potential stops
        stops_to_pickup = self._add_driving_stops(
            current_coords,
            pickup_coords,
            segment1_distance,
            segment1_duration,
            start_time,
            current_driving_hours,
            sequence,
            cumulative_distance
        )
        
        stops.extend(stops_to_pickup)
        
        if stops_to_pickup:
            last_stop = stops_to_pickup[-1]
            sequence = last_stop['sequence_order'] + 1
            cumulative_distance = last_stop['distance_from_start']
            cumulative_time = (last_stop['departure_time'] - start_time).total_seconds() / 3600.0
            current_driving_hours = self._calculate_driving_hours(stops)
        else:
            cumulative_distance = segment1_distance
            cumulative_time = segment1_duration
            current_driving_hours = segment1_duration
        
        # Pickup stop (1 hour)
        pickup_arrival = start_time + timedelta(hours=cumulative_time)
        pickup_departure = pickup_arrival + timedelta(hours=1)
        
        stops.append({
            'type': 'PICKUP',
            'location': trip.pickup_location,
            'latitude': pickup_coords[0],
            'longitude': pickup_coords[1],
            'arrival_time': pickup_arrival,
            'departure_time': pickup_departure,
            'duration_minutes': 60,
            'sequence_order': sequence,
            'distance_from_start': cumulative_distance,
            'notes': 'Pickup location - 1 hour for loading'
        })
        
        sequence += 1
        cumulative_time += 1  # Add pickup time
        
        # Drive to dropoff with potential stops
        stops_to_dropoff = self._add_driving_stops(
            pickup_coords,
            dropoff_coords,
            segment2_data['distance'],
            segment2_data['duration'],
            pickup_departure,
            current_driving_hours,
            sequence,
            cumulative_distance
        )
        
        stops.extend(stops_to_dropoff)
        
        if stops_to_dropoff:
            last_stop = stops_to_dropoff[-1]
            sequence = last_stop['sequence_order'] + 1
            cumulative_distance = last_stop['distance_from_start']
            cumulative_time = (last_stop['departure_time'] - start_time).total_seconds() / 3600.0
        else:
            cumulative_distance += segment2_data['distance']
            cumulative_time += segment2_data['duration']
        
        # Dropoff stop (1 hour)
        dropoff_arrival = start_time + timedelta(hours=cumulative_time)
        dropoff_departure = dropoff_arrival + timedelta(hours=1)
        
        stops.append({
            'type': 'DROPOFF',
            'location': trip.dropoff_location,
            'latitude': dropoff_coords[0],
            'longitude': dropoff_coords[1],
            'arrival_time': dropoff_arrival,
            'departure_time': dropoff_departure,
            'duration_minutes': 60,
            'sequence_order': sequence,
            'distance_from_start': cumulative_distance,
            'notes': 'Dropoff location - 1 hour for unloading'
        })
        
        return stops
    
    def _add_driving_stops(self, start_coords: Tuple, end_coords: Tuple,
                          distance: float, duration: float, start_time: datetime,
                          current_driving_hours: float, sequence: int,
                          cumulative_distance: float) -> List[Dict]:
        """
        Add required stops during a driving segment based on ELD rules
        
        ELD Rules:
        - 11-hour driving limit
        - 14-hour on-duty limit
        - 30-minute break required after 8 hours driving
        - 10 hours off-duty before next shift
        - Fuel stop every 1000 miles
        """
        stops = []
        remaining_distance = distance
        remaining_duration = duration
        distance_offset = cumulative_distance
        
        # Calculate when breaks are needed
        hours_until_break = 8 - current_driving_hours if current_driving_hours < 8 else 0
        hours_until_daily_limit = 11 - current_driving_hours
        
        current_time = start_time
        
        while remaining_duration > 0:
            # Check for fuel stop (every 1000 miles)
            if (distance_offset > 0 and distance_offset % 1000 < 200 and 
                remaining_distance > 100):
                
                # Add fuel stop
                fuel_arrival = current_time
                fuel_departure = fuel_arrival + timedelta(minutes=30)
                
                stops.append({
                    'type': 'FUEL',
                    'location': 'Fuel Station',
                    'latitude': start_coords[0],  # Simplified - use start coords
                    'longitude': start_coords[1],
                    'arrival_time': fuel_arrival,
                    'departure_time': fuel_departure,
                    'duration_minutes': 30,
                    'sequence_order': sequence,
                    'distance_from_start': distance_offset,
                    'notes': 'Fuel stop'
                })
                
                sequence += 1
                current_time = fuel_departure
            
            # Check for 30-minute break after 8 hours
            if hours_until_break > 0 and remaining_duration > hours_until_break:
                # Drive until break needed
                drive_time = min(hours_until_break, remaining_duration)
                current_time += timedelta(hours=drive_time)
                distance_offset += (drive_time / duration) * distance
                remaining_duration -= drive_time
                remaining_distance -= (drive_time / duration) * distance
                
                if remaining_duration > 0:
                    # Add 30-minute break
                    break_arrival = current_time
                    break_departure = break_arrival + timedelta(minutes=30)
                    
                    stops.append({
                        'type': 'REST',
                        'location': 'Rest Area',
                        'latitude': start_coords[0],
                        'longitude': start_coords[1],
                        'arrival_time': break_arrival,
                        'departure_time': break_departure,
                        'duration_minutes': 30,
                        'sequence_order': sequence,
                        'distance_from_start': distance_offset,
                        'notes': '30-minute break after 8 hours driving'
                    })
                    
                    sequence += 1
                    current_time = break_departure
                    hours_until_break = 8  # Reset break timer
            
            # Check for 11-hour daily driving limit
            elif hours_until_daily_limit > 0 and remaining_duration > hours_until_daily_limit:
                # Drive until daily limit
                drive_time = min(hours_until_daily_limit, remaining_duration)
                current_time += timedelta(hours=drive_time)
                distance_offset += (drive_time / duration) * distance
                remaining_duration -= drive_time
                remaining_distance -= (drive_time / duration) * distance
                
                if remaining_duration > 0:
                    # Add 10-hour off-duty period
                    rest_arrival = current_time
                    rest_departure = rest_arrival + timedelta(hours=10)
                    
                    stops.append({
                        'type': 'OFF_DUTY',
                        'location': 'Rest Location',
                        'latitude': start_coords[0],
                        'longitude': start_coords[1],
                        'arrival_time': rest_arrival,
                        'departure_time': rest_departure,
                        'duration_minutes': 600,
                        'sequence_order': sequence,
                        'distance_from_start': distance_offset,
                        'notes': '10-hour off-duty rest period'
                    })
                    
                    sequence += 1
                    current_time = rest_departure
                    hours_until_daily_limit = 11  # Reset daily limit
                    hours_until_break = 8  # Reset break timer
            else:
                # Drive the remaining duration
                current_time += timedelta(hours=remaining_duration)
                distance_offset += remaining_distance
                remaining_duration = 0
                remaining_distance = 0
        
        return stops
    
    def _calculate_driving_hours(self, stops: List[Dict]) -> float:
        """Calculate total driving hours from stops"""
        # This is a simplified calculation
        # In a real implementation, you'd track actual driving time
        return 0
    
    def _generate_waypoints(self, current_coords: Tuple, pickup_coords: Tuple,
                           dropoff_coords: Tuple, total_distance: float) -> List[Dict]:
        """
        Generate waypoints for map display
        """
        waypoints = []
        
        # Start waypoint
        waypoints.append({
            'latitude': current_coords[0],
            'longitude': current_coords[1],
            'sequence_order': 0,
            'distance_from_start': 0,
            'time_from_start': 0
        })
        
        # Pickup waypoint
        segment1 = self._calculate_segment(current_coords, pickup_coords)
        waypoints.append({
            'latitude': pickup_coords[0],
            'longitude': pickup_coords[1],
            'sequence_order': 1,
            'distance_from_start': segment1['distance'],
            'time_from_start': segment1['duration']
        })
        
        # Dropoff waypoint
        waypoints.append({
            'latitude': dropoff_coords[0],
            'longitude': dropoff_coords[1],
            'sequence_order': 2,
            'distance_from_start': total_distance,
            'time_from_start': total_distance / self.average_speed_mph
        })
        
        return waypoints