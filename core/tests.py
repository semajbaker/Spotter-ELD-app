from django.test import TestCase
from django.contrib.auth.models import User
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta
from decimal import Decimal

from .models import Trip, Stop, DailyLog, LogEntry, RouteWaypoint
from .utils.route_calculator import RouteCalculator
from .utils.eld_calculator import ELDCalculator


class TripModelTestCase(TestCase):
    """Test cases for Trip model"""
    
    def setUp(self):
        """Set up test user and trip"""
        self.user = User.objects.create_user(
            username='testdriver',
            email='test@example.com',
            password='TestPass123!'
        )
        
        self.trip = Trip.objects.create(
            user=self.user,
            current_location='New York, NY',
            current_lat=Decimal('40.7128'),
            current_lng=Decimal('-74.0060'),
            pickup_location='Philadelphia, PA',
            pickup_lat=Decimal('39.9526'),
            pickup_lng=Decimal('-75.1652'),
            dropoff_location='Washington, DC',
            dropoff_lat=Decimal('38.9072'),
            dropoff_lng=Decimal('-77.0369'),
            current_cycle_used=Decimal('15.5'),
            total_distance=Decimal('225.5'),
            estimated_duration=Decimal('8.75'),
            status='PLANNED'
        )
    
    def test_trip_creation(self):
        """Test that trip is created correctly"""
        self.assertEqual(self.trip.user, self.user)
        self.assertEqual(self.trip.status, 'PLANNED')
        self.assertEqual(self.trip.current_cycle_used, Decimal('15.5'))
    
    def test_available_driving_hours(self):
        """Test available driving hours calculation"""
        available = self.trip.available_driving_hours
        self.assertEqual(available, 54.5)  # 70 - 15.5
    
    def test_trip_string_representation(self):
        """Test trip __str__ method"""
        expected = f"Trip {self.trip.id} - testdriver - PLANNED"
        self.assertEqual(str(self.trip), expected)


class StopModelTestCase(TestCase):
    """Test cases for Stop model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testdriver',
            password='TestPass123!'
        )
        
        self.trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        self.stop = Stop.objects.create(
            trip=self.trip,
            stop_type='FUEL',
            location='Fuel Station',
            latitude=Decimal('40.7128'),
            longitude=Decimal('-74.0060'),
            arrival_time=datetime.now(),
            departure_time=datetime.now() + timedelta(minutes=30),
            duration_minutes=30,
            sequence_order=0,
            distance_from_start=Decimal('100.5')
        )
    
    def test_stop_creation(self):
        """Test that stop is created correctly"""
        self.assertEqual(self.stop.stop_type, 'FUEL')
        self.assertEqual(self.stop.duration_minutes, 30)
    
    def test_duration_hours_property(self):
        """Test duration hours calculation"""
        self.assertEqual(self.stop.duration_hours, 0.5)


class DailyLogModelTestCase(TestCase):
    """Test cases for DailyLog model"""
    
    def setUp(self):
        """Set up test data"""
        self.user = User.objects.create_user(
            username='testdriver',
            password='TestPass123!'
        )
        
        self.trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        self.daily_log = DailyLog.objects.create(
            trip=self.trip,
            driver=self.user,
            log_date=datetime.now().date(),
            off_duty_hours=Decimal('10.0'),
            sleeper_berth_hours=Decimal('6.0'),
            driving_hours=Decimal('5.5'),
            on_duty_not_driving_hours=Decimal('2.5'),
            starting_odometer=1000,
            ending_odometer=1330
        )
    
    def test_daily_log_creation(self):
        """Test that daily log is created correctly"""
        self.assertEqual(self.daily_log.driver, self.user)
        self.assertEqual(self.daily_log.driving_hours, Decimal('5.5'))
    
    def test_calculate_totals(self):
        """Test totals calculation"""
        self.daily_log.calculate_totals()
        self.assertEqual(self.daily_log.total_hours, Decimal('24.0'))
        self.assertEqual(self.daily_log.total_miles, 330)


class TripAPITestCase(APITestCase):
    """Test cases for Trip API endpoints"""
    
    def setUp(self):
        """Set up test client and authentication"""
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testdriver',
            email='test@example.com',
            password='TestPass123!'
        )
        self.token = Token.objects.create(user=self.user)
        self.client.credentials(HTTP_AUTHORIZATION=f'Token {self.token.key}')
    
    def test_create_trip_authenticated(self):
        """Test creating a trip with authentication"""
        data = {
            'current_location': 'Los Angeles, CA',
            'pickup_location': 'San Francisco, CA',
            'dropoff_location': 'Seattle, WA',
            'current_cycle_used': 10.0
        }
        
        response = self.client.post('/api/trips/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Trip.objects.count(), 1)
        self.assertEqual(Trip.objects.first().user, self.user)
    
    def test_create_trip_unauthenticated(self):
        """Test creating a trip without authentication"""
        self.client.credentials()  # Remove authentication
        
        data = {
            'current_location': 'Los Angeles, CA',
            'pickup_location': 'San Francisco, CA',
            'dropoff_location': 'Seattle, WA',
            'current_cycle_used': 10.0
        }
        
        response = self.client.post('/api/trips/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_list_trips(self):
        """Test listing trips"""
        # Create test trips
        Trip.objects.create(
            user=self.user,
            current_location='Location 1',
            pickup_location='Pickup 1',
            dropoff_location='Dropoff 1',
            current_cycle_used=Decimal('10.0')
        )
        
        Trip.objects.create(
            user=self.user,
            current_location='Location 2',
            pickup_location='Pickup 2',
            dropoff_location='Dropoff 2',
            current_cycle_used=Decimal('15.0')
        )
        
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)
    
    def test_get_trip_detail(self):
        """Test getting trip details"""
        trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        response = self.client.get(f'/api/trips/{trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], trip.id)
    
    def test_update_trip(self):
        """Test updating a trip"""
        trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        data = {
            'current_location': 'Updated Location',
            'pickup_location': 'Pickup Location',
            'dropoff_location': 'Dropoff Location',
            'current_cycle_used': 15.0
        }
        
        response = self.client.put(f'/api/trips/{trip.id}/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        trip.refresh_from_db()
        self.assertEqual(trip.current_location, 'Updated Location')
        self.assertEqual(trip.current_cycle_used, Decimal('15.0'))
    
    def test_delete_trip(self):
        """Test deleting a trip"""
        trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        response = self.client.delete(f'/api/trips/{trip.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(Trip.objects.count(), 0)
    
    def test_filter_trips_by_user(self):
        """Test that users only see their own trips"""
        # Create another user
        other_user = User.objects.create_user(
            username='otherdriver',
            password='OtherPass123!'
        )
        
        # Create trip for current user
        Trip.objects.create(
            user=self.user,
            current_location='My Location',
            pickup_location='My Pickup',
            dropoff_location='My Dropoff',
            current_cycle_used=Decimal('10.0')
        )
        
        # Create trip for other user
        Trip.objects.create(
            user=other_user,
            current_location='Other Location',
            pickup_location='Other Pickup',
            dropoff_location='Other Dropoff',
            current_cycle_used=Decimal('15.0')
        )
        
        response = self.client.get('/api/trips/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['username'], 'testdriver')


class RouteCalculatorTestCase(TestCase):
    """Test cases for RouteCalculator utility"""
    
    def setUp(self):
        """Set up test data"""
        self.calculator = RouteCalculator()
        self.user = User.objects.create_user(
            username='testdriver',
            password='TestPass123!'
        )
        
        self.trip = Trip.objects.create(
            user=self.user,
            current_location='New York, NY',
            current_lat=Decimal('40.7128'),
            current_lng=Decimal('-74.0060'),
            pickup_location='Philadelphia, PA',
            pickup_lat=Decimal('39.9526'),
            pickup_lng=Decimal('-75.1652'),
            dropoff_location='Washington, DC',
            dropoff_lat=Decimal('38.9072'),
            dropoff_lng=Decimal('-77.0369'),
            current_cycle_used=Decimal('10.0')
        )
    
    def test_get_coordinates_from_lat_lng(self):
        """Test getting coordinates when lat/lng provided"""
        coords = self.calculator._get_coordinates(
            'Test Address',
            40.7128,
            -74.0060
        )
        self.assertEqual(coords, (40.7128, -74.0060))
    
    def test_calculate_segment_simple(self):
        """Test simple distance calculation"""
        start = (40.7128, -74.0060)  # New York
        end = (39.9526, -75.1652)    # Philadelphia
        
        result = self.calculator._calculate_segment_simple(start, end)
        
        self.assertIn('distance', result)
        self.assertIn('duration', result)
        self.assertGreater(result['distance'], 0)
        self.assertGreater(result['duration'], 0)


class ELDCalculatorTestCase(TestCase):
    """Test cases for ELDCalculator utility"""
    
    def setUp(self):
        """Set up test data"""
        self.calculator = ELDCalculator()
        self.user = User.objects.create_user(
            username='testdriver',
            password='TestPass123!'
        )
        
        self.trip = Trip.objects.create(
            user=self.user,
            current_location='Test Location',
            pickup_location='Pickup Location',
            dropoff_location='Dropoff Location',
            current_cycle_used=Decimal('10.0')
        )
        
        # Create some test stops
        now = datetime.now()
        
        Stop.objects.create(
            trip=self.trip,
            stop_type='PICKUP',
            location='Pickup Location',
            arrival_time=now + timedelta(hours=2),
            departure_time=now + timedelta(hours=3),
            duration_minutes=60,
            sequence_order=0,
            distance_from_start=Decimal('100.0')
        )
        
        Stop.objects.create(
            trip=self.trip,
            stop_type='DROPOFF',
            location='Dropoff Location',
            arrival_time=now + timedelta(hours=8),
            departure_time=now + timedelta(hours=9),
            duration_minutes=60,
            sequence_order=1,
            distance_from_start=Decimal('300.0')
        )
    
    def test_get_status_for_stop_type(self):
        """Test mapping stop types to ELD statuses"""
        self.assertEqual(
            self.calculator._get_status_for_stop_type('FUEL'),
            self.calculator.STATUS_ON_DUTY
        )
        self.assertEqual(
            self.calculator._get_status_for_stop_type('REST'),
            self.calculator.STATUS_OFF_DUTY
        )
        self.assertEqual(
            self.calculator._get_status_for_stop_type('DRIVING'),
            self.calculator.STATUS_DRIVING
        )
    
    def test_validate_hos_compliance(self):
        """Test HOS compliance validation"""
        # Create a compliant log
        compliant_log = {
            'date': datetime.now().date(),
            'driving_hours': 8.0,
            'on_duty_hours': 2.0,
            'off_duty_hours': 10.0,
            'sleeper_berth_hours': 4.0
        }
        
        result = self.calculator.validate_hos_compliance([compliant_log])
        self.assertTrue(result['compliant'])
        self.assertEqual(len(result['violations']), 0)
        
        # Create a non-compliant log (exceeds driving limit)
        non_compliant_log = {
            'date': datetime.now().date(),
            'driving_hours': 12.0,  # Exceeds 11-hour limit
            'on_duty_hours': 2.0,
            'off_duty_hours': 8.0,
            'sleeper_berth_hours': 2.0
        }
        
        result = self.calculator.validate_hos_compliance([non_compliant_log])
        self.assertFalse(result['compliant'])
        self.assertGreater(len(result['violations']), 0)
    
    def test_calculate_available_hours(self):
        """Test available hours calculation"""
        daily_logs = [
            {
                'date': datetime.now().date(),
                'driving_hours': 8.0,
                'on_duty_hours': 2.0,
                'off_duty_hours': 10.0,
                'sleeper_berth_hours': 4.0
            }
        ]
        
        result = self.calculator.calculate_available_hours(15.0, daily_logs)
        
        self.assertIn('available_cycle_hours', result)
        self.assertIn('available_driving_today', result)
        self.assertIn('available_on_duty_today', result)
        self.assertEqual(result['available_driving_today'], 3.0)  # 11 - 8


class ValidationTestCase(TestCase):
    """Test validation logic"""
    
    def test_cycle_hours_validation(self):
        """Test that cycle hours are validated correctly"""
        user = User.objects.create_user(
            username='testdriver',
            password='TestPass123!'
        )
        
        # Valid cycle hours
        trip = Trip.objects.create(
            user=user,
            current_location='Test',
            pickup_location='Pickup',
            dropoff_location='Dropoff',
            current_cycle_used=Decimal('50.0')
        )
        self.assertEqual(trip.current_cycle_used, Decimal('50.0'))
        
        # Test that we can't exceed 70 hours
        with self.assertRaises(Exception):
            Trip.objects.create(
                user=user,
                current_location='Test',
                pickup_location='Pickup',
                dropoff_location='Dropoff',
                current_cycle_used=Decimal('75.0')  # Exceeds max
            )