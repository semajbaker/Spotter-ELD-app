from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.models import User, Group
from allauth.account.models import EmailAddress
from rest_framework.authtoken.models import Token
from django.conf import settings
from allauth.account.forms import ResetPasswordForm
from dj_rest_auth.serializers import PasswordResetSerializer
from allauth.socialaccount.models import SocialAccount
from .models import Trip, Stop, DailyLog, LogEntry, RouteWaypoint


# Existing serializers from your original file
user_model = get_user_model()


class UserLoginSerializer(serializers.Serializer):
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
    
    def validate(self, data):
        from django.contrib.auth import authenticate
        user = authenticate(**data)
        if user and user.is_active:
            return user
        raise serializers.ValidationError("Incorrect Credentials")


class UserSignupSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(style={'input_type': 'password'}, write_only=True)

    class Meta:
        model = user_model
        fields = ['username', 'email', 'password', 'password2']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def validate_email(self, email):
        if user_model.objects.filter(email=email).exists():
            raise serializers.ValidationError("Email already exists")
        return email

    def validate_username(self, username):
        if user_model.objects.filter(username=username).exists():
            raise serializers.ValidationError("Username Already Exists")
        return username

    def validate(self, data):
        password = data.get('password')
        password2 = data.get('password2')

        if password != password2:
            raise serializers.ValidationError("Passwords do not match")
        if len(password) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long")
        if not any(char.isupper() for char in password):
            raise serializers.ValidationError("Password must contain at least one uppercase letter")
        if not any(char.isdigit() for char in password):
            raise serializers.ValidationError("Password must contain at least one digit")
        if not any(char in '()[\]{}|\\`~!@#$%^&*_\-+=;:\'",<>./?' for char in password):
            raise serializers.ValidationError("Password must contain at least one symbol")

        return data
    
    def create(self, validated_data):
        users = user_model.objects.create(
            email=validated_data['email'],
            username=validated_data['username']
        )
        users.set_password(validated_data['password'])
        users.save()
        return users


class CustomPasswordResetSerializer(PasswordResetSerializer):
    password_reset_form_class = ResetPasswordForm

    def get_users(self, email):
        UserModel = get_user_model()
        return UserModel.objects.filter(email__iexact=email)

    def save(self):
        request = self.context.get('request')
        opts = {
            'use_https': request.is_secure(),
            'from_email': getattr(settings, 'DEFAULT_FROM_EMAIL'),
            'request': request,
        }
        self.reset_form.save(**opts)


class UserSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email',
                  'last_login', 'is_staff', 'is_active', 'date_joined']


class GroupSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField()
    
    class Meta:
        model = Group
        fields = ['id', 'name']


class TokenSerializer(serializers.ModelSerializer):
    id = serializers.ReadOnlyField(source='user.id')
    user = serializers.StringRelatedField()
    key = serializers.ReadOnlyField()

    class Meta:
        model = Token
        fields = ['id', 'user', 'key', 'created']


class EmailAddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmailAddress
        fields = ['id', 'email', 'verified', 'primary']


class SocialAccountSerializer(serializers.ModelSerializer):
    class Meta:
        model = SocialAccount
        fields = ['id', 'user', 'provider', 'uid', 'last_login', 'date_joined', 'extra_data']


# New ELD Trip Serializers

class RouteWaypointSerializer(serializers.ModelSerializer):
    """Serializer for route waypoints"""
    
    class Meta:
        model = RouteWaypoint
        fields = [
            'id', 'latitude', 'longitude', 'sequence_order',
            'distance_from_start', 'time_from_start'
        ]
        read_only_fields = ['id']


class StopSerializer(serializers.ModelSerializer):
    """Serializer for stops along the route"""
    duration_hours = serializers.ReadOnlyField()
    stop_type_display = serializers.CharField(source='get_stop_type_display', read_only=True)
    
    class Meta:
        model = Stop
        fields = [
            'id', 'trip', 'stop_type', 'stop_type_display', 'location',
            'latitude', 'longitude', 'arrival_time', 'departure_time',
            'duration_minutes', 'duration_hours', 'sequence_order',
            'distance_from_start', 'notes'
        ]
        read_only_fields = ['id']


class LogEntrySerializer(serializers.ModelSerializer):
    """Serializer for individual log entries"""
    duration_hours = serializers.ReadOnlyField()
    miles_driven = serializers.ReadOnlyField()
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = LogEntry
        fields = [
            'id', 'daily_log', 'status', 'status_display', 'start_time',
            'end_time', 'duration_minutes', 'duration_hours', 'location',
            'latitude', 'longitude', 'start_odometer', 'end_odometer',
            'miles_driven', 'notes', 'sequence_order'
        ]
        read_only_fields = ['id', 'duration_hours', 'miles_driven']


class DailyLogSerializer(serializers.ModelSerializer):
    """Serializer for daily ELD logs"""
    entries = LogEntrySerializer(many=True, read_only=True)
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    
    class Meta:
        model = DailyLog
        fields = [
            'id', 'trip', 'driver', 'driver_username', 'log_date',
            'off_duty_hours', 'sleeper_berth_hours', 'driving_hours',
            'on_duty_not_driving_hours', 'total_hours', 'total_miles',
            'starting_odometer', 'ending_odometer', 'starting_location',
            'ending_location', 'remarks', 'has_violation',
            'violation_description', 'entries', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DailyLogListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing daily logs without entries"""
    driver_username = serializers.CharField(source='driver.username', read_only=True)
    
    class Meta:
        model = DailyLog
        fields = [
            'id', 'trip', 'driver', 'driver_username', 'log_date',
            'off_duty_hours', 'sleeper_berth_hours', 'driving_hours',
            'on_duty_not_driving_hours', 'total_hours', 'total_miles',
            'starting_location', 'ending_location', 'has_violation'
        ]
        read_only_fields = ['id']


class TripSerializer(serializers.ModelSerializer):
    """Full serializer for Trip with all related data"""
    stops = StopSerializer(many=True, read_only=True)
    daily_logs = DailyLogSerializer(many=True, read_only=True)  # ← CHANGE THIS LINE
    waypoints = RouteWaypointSerializer(many=True, read_only=True)
    available_driving_hours = serializers.ReadOnlyField()
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Trip
        fields = [
            'id', 'user', 'username', 'current_location', 'current_lat',
            'current_lng', 'pickup_location', 'pickup_lat', 'pickup_lng',
            'dropoff_location', 'dropoff_lat', 'dropoff_lng',
            'current_cycle_used', 'available_driving_hours', 'total_distance',
            'estimated_duration', 'status', 'status_display', 'start_time',
            'end_time', 'created_at', 'updated_at', 'stops', 'daily_logs',
            'waypoints'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'available_driving_hours']


class TripListSerializer(serializers.ModelSerializer):
    """Simplified serializer for listing trips without related data"""
    username = serializers.CharField(source='user.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    available_driving_hours = serializers.ReadOnlyField()
    
    class Meta:
        model = Trip
        fields = [
            'id', 'user', 'username', 'current_location', 'pickup_location',
            'dropoff_location', 'current_cycle_used', 'available_driving_hours',
            'total_distance', 'estimated_duration', 'status', 'status_display',
            'created_at'
        ]
        read_only_fields = ['id', 'created_at']


class TripCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating a new trip"""
    
    class Meta:
        model = Trip
        fields = [
            'current_location', 'current_lat', 'current_lng',
            'pickup_location', 'pickup_lat', 'pickup_lng',
            'dropoff_location', 'dropoff_lat', 'dropoff_lng',
            'current_cycle_used'
        ]
    
    def validate_current_cycle_used(self, value):
        if value < 0 or value > 70:
            raise serializers.ValidationError("Current cycle used must be between 0 and 70 hours")
        return value
    
    def create(self, validated_data):
        # Set the user from the request context
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)