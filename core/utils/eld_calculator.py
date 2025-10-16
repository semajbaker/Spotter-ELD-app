"""
ELD Calculator Module
Generates Electronic Logging Device (ELD) daily log sheets
based on trip stops and timing
"""
from datetime import datetime, date
from django.utils import timezone as tz
from typing import Dict, List
from collections import defaultdict


class ELDCalculator:
    """
    Calculates and generates ELD daily log sheets for trips
    Following FMCSA Hours of Service regulations
    """
    
    # ELD Status codes
    STATUS_OFF_DUTY = 'OFF_DUTY'
    STATUS_SLEEPER = 'SLEEPER'
    STATUS_DRIVING = 'DRIVING'
    STATUS_ON_DUTY = 'ON_DUTY'
    
    # ELD Limits (hours)
    DRIVING_LIMIT = 11
    ON_DUTY_LIMIT = 14
    REQUIRED_REST = 10
    BREAK_AFTER_HOURS = 8
    BREAK_DURATION_MINUTES = 30
    
    def __init__(self):
        self.average_speed_mph = 60
    
    def calculate_logs(self, trip) -> List[Dict]:
        """
        Main method to generate daily log sheets for a trip
        
        Args:
            trip: Trip model instance with stops
            
        Returns:
            List of daily log dictionaries
        """
        if not trip.stops.exists():
            return []
        
        # Get all stops ordered by sequence
        stops = list(trip.stops.order_by('sequence_order'))
        
        # Group stops by date
        logs_by_date = self._group_stops_by_date(stops)
        
        # Generate log sheets for each date
        daily_logs = []
        for log_date, date_stops in sorted(logs_by_date.items()):
            log_data = self._generate_daily_log(
                log_date,
                date_stops,
                trip
            )
            daily_logs.append(log_data)
        
        return daily_logs
    
    def _group_stops_by_date(self, stops: List) -> Dict[date, List]:
        """
        Group stops by calendar date
        """
        stops_by_date = defaultdict(list)
        
        for stop in stops:
            stop_date = stop.arrival_time.date()
            stops_by_date[stop_date].append(stop)
        
        return dict(stops_by_date)
    
    def _generate_daily_log(self, log_date: date, stops: List, trip) -> Dict:
        """
        Generate a complete daily log sheet for a specific date
        """
        # Initialize log data
        log_data = {
            'date': log_date,
            'off_duty_hours': 0,
            'sleeper_berth_hours': 0,
            'driving_hours': 0,
            'on_duty_hours': 0,
            'starting_odometer': 0,
            'ending_odometer': 0,
            'starting_location': '',
            'ending_location': '',
            'entries': []
        }
        
        # Generate log entries for this day
        entries = self._generate_log_entries(log_date, stops)
        log_data['entries'] = entries
        
        # Calculate totals from entries
        for entry in entries:
            duration_hours = entry['duration_minutes'] / 60.0
            
            if entry['status'] == self.STATUS_OFF_DUTY:
                log_data['off_duty_hours'] += duration_hours
            elif entry['status'] == self.STATUS_SLEEPER:
                log_data['sleeper_berth_hours'] += duration_hours
            elif entry['status'] == self.STATUS_DRIVING:
                log_data['driving_hours'] += duration_hours
            elif entry['status'] == self.STATUS_ON_DUTY:
                log_data['on_duty_hours'] += duration_hours
        
        # Set odometer readings
        if entries:
            first_entry = entries[0]
            last_entry = entries[-1]
            
            log_data['starting_odometer'] = first_entry.get('start_odometer', 0)
            log_data['ending_odometer'] = last_entry.get('end_odometer', 0)
            log_data['starting_location'] = first_entry.get('location', '')
            log_data['ending_location'] = last_entry.get('location', '')
        
        # Round hours to 2 decimal places
        log_data['off_duty_hours'] = round(log_data['off_duty_hours'], 2)
        log_data['sleeper_berth_hours'] = round(log_data['sleeper_berth_hours'], 2)
        log_data['driving_hours'] = round(log_data['driving_hours'], 2)
        log_data['on_duty_hours'] = round(log_data['on_duty_hours'], 2)
        
        return log_data
    
    def _generate_log_entries(self, log_date: date, stops: List) -> List[Dict]:
        """
        Generate individual log entries for a day based on stops
        """
        entries = []
        sequence = 0
        
        # Get start and end times for this date (TIMEZONE-AWARE)
        day_start = tz.make_aware(datetime.combine(log_date, datetime.min.time()))
        day_end = tz.make_aware(datetime.combine(log_date, datetime.max.time()))
        
        # If this is the first day, start from the first stop's time
        if stops and stops[0].arrival_time.date() == log_date:
            current_time = stops[0].arrival_time
            if current_time.time() > datetime.min.time():
                # Add off-duty period from midnight to first activity
                entries.append({
                    'status': self.STATUS_OFF_DUTY,
                    'start_time': day_start,
                    'end_time': current_time,
                    'duration_minutes': int((current_time - day_start).total_seconds() / 60),
                    'location': 'Starting Location',
                    'latitude': None,
                    'longitude': None,
                    'start_odometer': 0,
                    'end_odometer': 0,
                    'sequence_order': sequence
                })
                sequence += 1
        else:
            current_time = day_start
        
        previous_stop = None
        
        for stop in stops:
            # Skip stops not on this date
            if stop.arrival_time.date() != log_date and stop.departure_time.date() != log_date:
                continue
            
            # If there's a gap between stops, add driving time
            if previous_stop and stop.arrival_time > previous_stop.departure_time:
                # Calculate driving duration
                driving_start = previous_stop.departure_time
                driving_end = stop.arrival_time
                
                # Make sure we don't go past the day boundary
                if driving_start.date() == log_date:
                    if driving_end.date() > log_date:
                        driving_end = day_end
                    
                    driving_minutes = int((driving_end - driving_start).total_seconds() / 60)
                    
                    # Calculate approximate distance driven
                    driving_hours = driving_minutes / 60.0
                    distance_driven = int(driving_hours * self.average_speed_mph)
                    
                    start_odo = previous_stop.distance_from_start if hasattr(previous_stop, 'distance_from_start') else 0
                    end_odo = start_odo + distance_driven
                    
                    entries.append({
                        'status': self.STATUS_DRIVING,
                        'start_time': driving_start,
                        'end_time': driving_end,
                        'duration_minutes': driving_minutes,
                        'location': f"En route to {stop.location}",
                        'latitude': stop.latitude,
                        'longitude': stop.longitude,
                        'start_odometer': int(start_odo),
                        'end_odometer': int(end_odo),
                        'sequence_order': sequence
                    })
                    sequence += 1
                    current_time = driving_end
            
            # Add stop entry if it falls on this date
            if stop.arrival_time.date() <= log_date <= stop.departure_time.date():
                stop_start = stop.arrival_time if stop.arrival_time.date() == log_date else day_start
                stop_end = stop.departure_time if stop.departure_time.date() == log_date else day_end
                
                duration_minutes = int((stop_end - stop_start).total_seconds() / 60)
                
                # Determine status based on stop type
                status = self._get_status_for_stop_type(stop.stop_type)
                
                entries.append({
                    'status': status,
                    'start_time': stop_start,
                    'end_time': stop_end,
                    'duration_minutes': duration_minutes,
                    'location': stop.location,
                    'latitude': stop.latitude,
                    'longitude': stop.longitude,
                    'start_odometer': int(stop.distance_from_start) if hasattr(stop, 'distance_from_start') else 0,
                    'end_odometer': int(stop.distance_from_start) if hasattr(stop, 'distance_from_start') else 0,
                    'sequence_order': sequence
                })
                sequence += 1
                current_time = stop_end
            
            previous_stop = stop
        
        # Fill remaining time until midnight with off-duty
        if current_time < day_end:
            entries.append({
                'status': self.STATUS_OFF_DUTY,
                'start_time': current_time,
                'end_time': day_end,
                'duration_minutes': int((day_end - current_time).total_seconds() / 60),
                'location': 'Rest Location',
                'latitude': None,
                'longitude': None,
                'start_odometer': 0,
                'end_odometer': 0,
                'sequence_order': sequence
            })
        
        return entries
    
    def _get_status_for_stop_type(self, stop_type: str) -> str:
        """
        Map stop type to ELD status
        """
        status_map = {
            'FUEL': self.STATUS_ON_DUTY,
            'REST': self.STATUS_OFF_DUTY,
            'SLEEPER': self.STATUS_SLEEPER,
            'OFF_DUTY': self.STATUS_OFF_DUTY,
            'PICKUP': self.STATUS_ON_DUTY,
            'DROPOFF': self.STATUS_ON_DUTY,
        }
        
        return status_map.get(stop_type, self.STATUS_ON_DUTY)
    
    def validate_hos_compliance(self, daily_logs: List[Dict]) -> Dict:
        """
        Validate Hours of Service compliance for generated logs
        
        Returns:
            Dictionary with compliance status and any violations
        """
        violations = []
        
        for log in daily_logs:
            # Check 11-hour driving limit
            if log['driving_hours'] > self.DRIVING_LIMIT:
                violations.append({
                    'date': log['date'],
                    'type': 'DRIVING_LIMIT_EXCEEDED',
                    'message': f"Driving time ({log['driving_hours']}h) exceeds 11-hour limit"
                })
            
            # Check 14-hour on-duty limit
            total_on_duty = log['driving_hours'] + log['on_duty_hours']
            if total_on_duty > self.ON_DUTY_LIMIT:
                violations.append({
                    'date': log['date'],
                    'type': 'ON_DUTY_LIMIT_EXCEEDED',
                    'message': f"On-duty time ({total_on_duty}h) exceeds 14-hour limit"
                })
            
            # Check for 10-hour rest requirement
            rest_time = log['off_duty_hours'] + log['sleeper_berth_hours']
            if rest_time < self.REQUIRED_REST:
                violations.append({
                    'date': log['date'],
                    'type': 'INSUFFICIENT_REST',
                    'message': f"Rest time ({rest_time}h) below required 10 hours"
                })
        
        return {
            'compliant': len(violations) == 0,
            'violations': violations
        }
    
    def calculate_available_hours(self, current_cycle_used: float, 
                                  daily_logs: List[Dict]) -> Dict:
        """
        Calculate available driving hours based on cycle and daily limits
        
        Args:
            current_cycle_used: Hours already used in 70-hour/8-day cycle
            daily_logs: List of daily log data
            
        Returns:
            Dictionary with available hours information
        """
        # Calculate total hours used in this trip
        trip_hours = sum(log['driving_hours'] + log['on_duty_hours'] for log in daily_logs)
        
        # Total cycle hours used
        total_cycle_hours = current_cycle_used + trip_hours
        
        # Available in cycle (70-hour limit)
        available_cycle = max(0, 70 - total_cycle_hours)
        
        # Available today (11-hour driving, 14-hour on-duty)
        if daily_logs:
            latest_log = daily_logs[-1]
            available_driving_today = max(0, self.DRIVING_LIMIT - latest_log['driving_hours'])
            available_on_duty_today = max(0, self.ON_DUTY_LIMIT - 
                                         (latest_log['driving_hours'] + latest_log['on_duty_hours']))
        else:
            available_driving_today = self.DRIVING_LIMIT
            available_on_duty_today = self.ON_DUTY_LIMIT
        
        return {
            'available_cycle_hours': round(available_cycle, 2),
            'available_driving_today': round(available_driving_today, 2),
            'available_on_duty_today': round(available_on_duty_today, 2),
            'total_cycle_hours_used': round(total_cycle_hours, 2),
            'trip_hours_used': round(trip_hours, 2)
        }