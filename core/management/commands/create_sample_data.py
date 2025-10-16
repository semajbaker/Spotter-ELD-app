"""
Django management command to create sample ELD trip data

Directory structure:
core/
├── management/
│   ├── __init__.py
│   └── commands/
│       ├── __init__.py
│       └── create_sample_data.py

Run with: python manage.py create_sample_data
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from datetime import datetime, timedelta
from decimal import Decimal
from core.models import Trip, Stop, DailyLog, LogEntry, RouteWaypoint


class Command(BaseCommand):
    help = 'Creates sample ELD trip data for testing'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--trips',
            type=int,
            default=3,
            help='Number of sample trips to create'
        )
        
        parser.add_argument(
            '--username',
            type=str,
            default='testdriver',
            help='Username for the test driver'
        )
    
    def handle(self, *args, **options):
        trips_count = options['trips']
        username = options['username']
        
        # Create or get test user
        user, created = User.objects.get_or_create(
            username=username,
            defaults={
                'email': f'{username}@example.com',
                'first_name': 'Test',
                'last_name': 'Driver'
            }
        )
        
        if created:
            user.set_password('TestPass123!')
            user.save()
            self.stdout.write(
                self.style.SUCCESS(f'Created user: {username}')
            )
        else:
            self.stdout.write(
                self.style.WARNING(f'User {username} already exists')
            )
        
        # Sample trip configurations
        sample_trips = [
            {
                'current_location': 'Los Angeles, CA',
                'current_lat': Decimal('34.0522'),
                'current_lng': Decimal('-118.2437'),
                'pickup_location': 'San Francisco, CA',
                'pickup_lat': Decimal('37.7749'),
                'pickup_lng': Decimal('-122.4194'),
                'dropoff_location': 'Seattle, WA',
                'dropoff_lat': Decimal('47.6062'),
                'dropoff_lng': Decimal('-122.3321'),
                'distance': 1135.0,
                'duration': 18.5
            },
            {
                'current_location': 'New York, NY',
                'current_lat': Decimal('40.7128'),
                'current_lng': Decimal('-74.0060'),
                'pickup_location': 'Philadelphia, PA',
                'pickup_lat': Decimal('39.9526'),
                'pickup_lng': Decimal('-75.1652'),
                'dropoff_location': 'Washington, DC',
                'dropoff_lat': Decimal('38.9072'),
                'dropoff_lng': Decimal('-77.0369'),
                'distance': 225.5,
                'duration': 4.5
            },
            {
                'current_location': 'Chicago, IL',
                'current_lat': Decimal('41.8781'),
                'current_lng': Decimal('-87.6298'),
                'pickup_location': 'Indianapolis, IN',
                'pickup_lat': Decimal('39.7684'),
                'pickup_lng': Decimal('-86.1581'),
                'dropoff_location': 'Nashville, TN',
                'dropoff_lat': Decimal('36.1627'),
                'dropoff_lng': Decimal('-86.7816'),
                'distance': 472.0,
                'duration': 8.0
            },
            {
                'current_location': 'Dallas, TX',
                'current_lat': Decimal('32.7767'),
                'current_lng': Decimal('-96.7970'),
                'pickup_location': 'Houston, TX',
                'pickup_lat': Decimal('29.7604'),
                'pickup_lng': Decimal('-95.3698'),
                'dropoff_location': 'Austin, TX',
                'dropoff_lat': Decimal('30.2672'),
                'dropoff_lng': Decimal('-97.7431'),
                'distance': 385.0,
                'duration': 6.5
            },
            {
                'current_location': 'Miami, FL',
                'current_lat': Decimal('25.7617'),
                'current_lng': Decimal('-80.1918'),
                'pickup_location': 'Orlando, FL',
                'pickup_lat': Decimal('28.5383'),
                'pickup_lng': Decimal('-81.3792'),
                'dropoff_location': 'Atlanta, GA',
                'dropoff_lat': Decimal('33.7490'),
                'dropoff_lng': Decimal('-84.3880'),
                'distance': 665.0,
                'duration': 11.0
            }
        ]
        
        created_count = 0
        
        for i in range(trips_count):
            trip_config = sample_trips[i % len(sample_trips)]
            
            # Create trip
            trip = Trip.objects.create(
                user=user,
                current_location=trip_config['current_location'],
                current_lat=trip_config['current_lat'],
                current_lng=trip_config['current_lng'],
                pickup_location=trip_config['pickup_location'],
                pickup_lat=trip_config['pickup_lat'],
                pickup_lng=trip_config['pickup_lng'],
                dropoff_location=trip_config['dropoff_location'],
                dropoff_lat=trip_config['dropoff_lat'],
                dropoff_lng=trip_config['dropoff_lng'],
                current_cycle_used=Decimal(str(10.0 + (i * 5))),
                total_distance=Decimal(str(trip_config['distance'])),
                estimated_duration=Decimal(str(trip_config['duration'])),
                status='PLANNED'
            )
            
            self.stdout.write(
                self.style.SUCCESS(
                    f'Created trip {trip.id}: {trip.current_location} → '
                    f'{trip.pickup_location} → {trip.dropoff_location}'
                )
            )
            
            # Create sample stops
            self._create_sample_stops(trip, trip_config)
            
            # Create sample daily logs WITH ENTRIES
            self._create_sample_daily_logs(trip, trip_config)
            
            # Create sample waypoints
            self._create_sample_waypoints(trip, trip_config)
            
            created_count += 1
        
        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully created {created_count} sample trips!'
            )
        )
    
    def _create_sample_stops(self, trip, config):
        """Create sample stops for the trip"""
        now = datetime.now()
        stops = []
        
        # Calculate segments
        segment1_distance = config['distance'] * 0.4
        segment2_distance = config['distance'] * 0.6
        
        segment1_duration = config['duration'] * 0.4
        segment2_duration = config['duration'] * 0.6
        
        cumulative_distance = 0
        cumulative_time = 0
        sequence = 0
        
        # Add fuel stop if long trip
        if config['distance'] > 500:
            cumulative_distance += segment1_distance * 0.3
            cumulative_time += segment1_duration * 0.3
            
            stops.append(Stop(
                trip=trip,
                stop_type='FUEL',
                location='Fuel Station',
                latitude=config['current_lat'],
                longitude=config['current_lng'],
                arrival_time=now + timedelta(hours=cumulative_time),
                departure_time=now + timedelta(hours=cumulative_time + 0.5),
                duration_minutes=30,
                sequence_order=sequence,
                distance_from_start=Decimal(str(round(cumulative_distance, 2))),
                notes='Fuel stop'
            ))
            sequence += 1
            cumulative_time += 0.5
        
        # Pickup stop
        cumulative_distance += segment1_distance
        cumulative_time += segment1_duration
        
        stops.append(Stop(
            trip=trip,
            stop_type='PICKUP',
            location=config['pickup_location'],
            latitude=config['pickup_lat'],
            longitude=config['pickup_lng'],
            arrival_time=now + timedelta(hours=cumulative_time),
            departure_time=now + timedelta(hours=cumulative_time + 1),
            duration_minutes=60,
            sequence_order=sequence,
            distance_from_start=Decimal(str(round(cumulative_distance, 2))),
            notes='Pickup - 1 hour for loading'
        ))
        sequence += 1
        cumulative_time += 1
        
        # Add rest stop if needed (for long trips)
        if config['duration'] > 10:
            cumulative_distance += segment2_distance * 0.5
            cumulative_time += segment2_duration * 0.5
            
            stops.append(Stop(
                trip=trip,
                stop_type='OFF_DUTY',
                location='Rest Area',
                latitude=config['pickup_lat'],
                longitude=config['pickup_lng'],
                arrival_time=now + timedelta(hours=cumulative_time),
                departure_time=now + timedelta(hours=cumulative_time + 10),
                duration_minutes=600,
                sequence_order=sequence,
                distance_from_start=Decimal(str(round(cumulative_distance, 2))),
                notes='10-hour rest period'
            ))
            sequence += 1
            cumulative_time += 10
        
        # Dropoff stop
        cumulative_distance += segment2_distance
        cumulative_time += segment2_duration
        
        stops.append(Stop(
            trip=trip,
            stop_type='DROPOFF',
            location=config['dropoff_location'],
            latitude=config['dropoff_lat'],
            longitude=config['dropoff_lng'],
            arrival_time=now + timedelta(hours=cumulative_time),
            departure_time=now + timedelta(hours=cumulative_time + 1),
            duration_minutes=60,
            sequence_order=sequence,
            distance_from_start=Decimal(str(round(cumulative_distance, 2))),
            notes='Dropoff - 1 hour for unloading'
        ))
        
        Stop.objects.bulk_create(stops)
        self.stdout.write(f'  Created {len(stops)} stops')
    
    def _create_sample_daily_logs(self, trip, config):
        """Create sample daily logs WITH LOG ENTRIES for the trip"""
        log_date = datetime.now().date()
        base_time = datetime.combine(log_date, datetime.min.time())
        
        driving_hours = min(config['duration'], 11.0)
        on_duty_hours = 2.0
        off_duty_hours = 10.0
        sleeper_hours = max(0, 24.0 - driving_hours - on_duty_hours - off_duty_hours)
        
        # Create the daily log
        daily_log = DailyLog.objects.create(
            trip=trip,
            driver=trip.user,
            log_date=log_date,
            off_duty_hours=Decimal(str(off_duty_hours)),
            sleeper_berth_hours=Decimal(str(sleeper_hours)),
            driving_hours=Decimal(str(driving_hours)),
            on_duty_not_driving_hours=Decimal(str(on_duty_hours)),
            starting_odometer=10000,
            ending_odometer=int(10000 + config['distance']),
            starting_location=config['current_location'],
            ending_location=config['dropoff_location']
        )
        
        # Create log entries to match the hours
        entries = []
        sequence = 0
        current_time = base_time
        
        # 1. Off duty at start (part of the 10 hours)
        off_duty_start = 4.0  # 4 hours off duty at start
        entries.append(LogEntry(
            daily_log=daily_log,
            status='OFF_DUTY',
            start_time=current_time,
            end_time=current_time + timedelta(hours=off_duty_start),
            duration_minutes=int(off_duty_start * 60),
            location=config['current_location'],
            latitude=config['current_lat'],
            longitude=config['current_lng'],
            start_odometer=10000,
            end_odometer=10000,
            sequence_order=sequence,
            notes='Rest before trip'
        ))
        current_time += timedelta(hours=off_duty_start)
        sequence += 1
        
        # 2. On duty (pre-trip inspection)
        on_duty_start = 1.0
        entries.append(LogEntry(
            daily_log=daily_log,
            status='ON_DUTY',
            start_time=current_time,
            end_time=current_time + timedelta(hours=on_duty_start),
            duration_minutes=int(on_duty_start * 60),
            location=config['current_location'],
            latitude=config['current_lat'],
            longitude=config['current_lng'],
            start_odometer=10000,
            end_odometer=10000,
            sequence_order=sequence,
            notes='Pre-trip inspection and paperwork'
        ))
        current_time += timedelta(hours=on_duty_start)
        sequence += 1
        
        # 3. Driving (main driving period)
        odometer_after_driving = 10000 + int(config['distance'] * 0.8)
        entries.append(LogEntry(
            daily_log=daily_log,
            status='DRIVING',
            start_time=current_time,
            end_time=current_time + timedelta(hours=driving_hours),
            duration_minutes=int(driving_hours * 60),
            location=f"En route to {config['dropoff_location']}",
            latitude=config['dropoff_lat'],
            longitude=config['dropoff_lng'],
            start_odometer=10000,
            end_odometer=odometer_after_driving,
            sequence_order=sequence,
            notes='Driving to destination'
        ))
        current_time += timedelta(hours=driving_hours)
        sequence += 1
        
        # 4. On duty (unloading)
        on_duty_end = on_duty_hours - on_duty_start
        entries.append(LogEntry(
            daily_log=daily_log,
            status='ON_DUTY',
            start_time=current_time,
            end_time=current_time + timedelta(hours=on_duty_end),
            duration_minutes=int(on_duty_end * 60),
            location=config['dropoff_location'],
            latitude=config['dropoff_lat'],
            longitude=config['dropoff_lng'],
            start_odometer=odometer_after_driving,
            end_odometer=odometer_after_driving,
            sequence_order=sequence,
            notes='Unloading and post-trip inspection'
        ))
        current_time += timedelta(hours=on_duty_end)
        sequence += 1
        
        # 5. Sleeper berth (if any)
        if sleeper_hours > 0:
            entries.append(LogEntry(
                daily_log=daily_log,
                status='SLEEPER',
                start_time=current_time,
                end_time=current_time + timedelta(hours=sleeper_hours),
                duration_minutes=int(sleeper_hours * 60),
                location=config['dropoff_location'],
                latitude=config['dropoff_lat'],
                longitude=config['dropoff_lng'],
                start_odometer=odometer_after_driving,
                end_odometer=odometer_after_driving,
                sequence_order=sequence,
                notes='Sleeper berth rest'
            ))
            current_time += timedelta(hours=sleeper_hours)
            sequence += 1
        
        # 6. Off duty at end (remainder of 10 hours)
        off_duty_end = off_duty_hours - off_duty_start
        if off_duty_end > 0:
            entries.append(LogEntry(
                daily_log=daily_log,
                status='OFF_DUTY',
                start_time=current_time,
                end_time=current_time + timedelta(hours=off_duty_end),
                duration_minutes=int(off_duty_end * 60),
                location=config['dropoff_location'],
                latitude=config['dropoff_lat'],
                longitude=config['dropoff_lng'],
                start_odometer=odometer_after_driving,
                end_odometer=int(10000 + config['distance']),
                sequence_order=sequence,
                notes='End of day rest'
            ))
        
        # Bulk create all entries
        LogEntry.objects.bulk_create(entries)
        
        # Recalculate totals
        daily_log.calculate_totals()
        
        self.stdout.write(f'  Created daily log for {log_date} with {len(entries)} entries')
    
    def _create_sample_waypoints(self, trip, config):
        """Create sample waypoints for the route"""
        waypoints = [
            RouteWaypoint(
                trip=trip,
                latitude=config['current_lat'],
                longitude=config['current_lng'],
                sequence_order=0,
                distance_from_start=Decimal('0'),
                time_from_start=Decimal('0')
            ),
            RouteWaypoint(
                trip=trip,
                latitude=config['pickup_lat'],
                longitude=config['pickup_lng'],
                sequence_order=1,
                distance_from_start=Decimal(str(config['distance'] * 0.4)),
                time_from_start=Decimal(str(config['duration'] * 0.4))
            ),
            RouteWaypoint(
                trip=trip,
                latitude=config['dropoff_lat'],
                longitude=config['dropoff_lng'],
                sequence_order=2,
                distance_from_start=Decimal(str(config['distance'])),
                time_from_start=Decimal(str(config['duration']))
            )
        ]
        
        RouteWaypoint.objects.bulk_create(waypoints)
        self.stdout.write(f'  Created {len(waypoints)} waypoints')