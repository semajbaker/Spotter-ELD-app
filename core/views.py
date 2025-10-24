import jwt
import os
import logging
from time import time, sleep
from datetime import datetime, timedelta
from django.shortcuts import render
from django.utils import timezone
from rest_framework.permissions import AllowAny
from rest_framework.generics import (
    GenericAPIView, CreateAPIView, ListCreateAPIView,
    RetrieveUpdateDestroyAPIView, ListAPIView
)
from rest_framework.views import APIView
from rest_framework import status, viewsets
from rest_framework.authentication import SessionAuthentication, TokenAuthentication
from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from rest_framework.decorators import action
from django.contrib.auth import get_user_model, login
from django.contrib.auth.models import User, Group
from allauth.account.models import EmailAddress
from allauth.socialaccount.models import SocialAccount
from allauth.socialaccount.providers.google.views import GoogleOAuth2Adapter
from allauth.socialaccount.providers.github.views import GitHubOAuth2Adapter
from allauth.socialaccount.providers.facebook.views import FacebookOAuth2Adapter
from allauth.socialaccount.providers.oauth2.client import OAuth2Client
from allauth.account.views import PasswordResetFromKeyView
from dj_rest_auth.registration.views import SocialLoginView
from dj_rest_auth.views import PasswordResetView
from allauth.account.utils import send_email_confirmation
from .serializers import (
    UserSignupSerializer, UserLoginSerializer, UserSerializer, GroupSerializer,
    TokenSerializer, EmailAddressSerializer, SocialAccountSerializer,
    CustomPasswordResetSerializer, TripSerializer, TripListSerializer,
    TripCreateSerializer, StopSerializer, DailyLogSerializer,
    DailyLogListSerializer, LogEntrySerializer, RouteWaypointSerializer
)
from .models import Trip, Stop, DailyLog, LogEntry, RouteWaypoint
from .utils.route_calculator import RouteCalculator
from .utils.eld_calculator import ELDCalculator

logger = logging.getLogger(__name__)
# Original auth views
user = get_user_model()
FRONTEND_URL = os.getenv('FRONTEND_URL')

def index(request):
    return render(request, 'index.html')


class SignUp(CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSignupSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Send verification email
        try:
            send_email_confirmation(request, user)
            return Response(
                {
                    'detail': 'Verification email sent. Please check your email to activate your account.',
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )
        except Exception as e:
            # If email fails, still return success but log the error
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Failed to send verification email: {str(e)}")
            
            return Response(
                {
                    'detail': 'Account created but verification email could not be sent. Please contact support.',
                    'email': user.email
                },
                status=status.HTTP_201_CREATED
            )


class Login(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserLoginSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.validated_data
            
            # Check if email is verified
            if not user.is_active:
                return Response(
                    {
                        'detail': 'Please verify your email address before logging in.',
                        'email': user.email,
                        'needs_verification': True
                    },
                    status=status.HTTP_403_FORBIDDEN
                )
            
            token, created = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'is_superuser': user.is_superuser  # Add this for consistency
                }
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ResendVerificationEmail(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        email = request.data.get('email')
        
        if not email:
            return Response(
                {'detail': 'Email is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            user = User.objects.get(email=email)
            
            if user.is_active:
                return Response(
                    {'detail': 'Email is already verified.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            send_email_confirmation(request, user)
            return Response(
                {'detail': 'Verification email has been resent.'},
                status=status.HTTP_200_OK
            )
            
        except User.DoesNotExist:
            # Don't reveal if email exists or not (security)
            return Response(
                {'detail': 'If this email exists, a verification email has been sent.'},
                status=status.HTTP_200_OK
            )
class GoogleOAuth2IatValidationAdapter(GoogleOAuth2Adapter):
    def complete_login(self, request, app, token, response, **kwargs):
        try:
            delta_time = (
                jwt.decode(
                    response.get("id_token"),
                    options={"verify_signature": False},
                    algorithms=["RS256"],
                )["iat"]
                - time()
            )
        except jwt.PyJWTError as e:
            logger.error(f"Invalid id_token during 'iat' validation: {e}")
            raise OAuth2Error("Invalid id_token during 'iat' validation") from e
        except KeyError as e:
            logger.error(f"Failed to get 'iat' from id_token: {e}")
            raise OAuth2Error("Failed to get 'iat' from id_token") from e

        if delta_time > 0 and delta_time <= 30:
            sleep(delta_time)

        return super().complete_login(request, app, token, response, **kwargs)


class GoogleLogin(SocialLoginView):
    adapter_class = GoogleOAuth2IatValidationAdapter
    client_class = OAuth2Client
    callback_url = f"{FRONTEND_URL}/"  # Changed to class attribute
    
    def post(self, request, *args, **kwargs):
        logger.info(f"Google login request received")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Callback URL: {self.callback_url}")
        
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(f"Google login successful")
            return response
        except Exception as e:
            logger.error(f"Google login failed: {str(e)}")
            logger.exception(e)
            raise


class GithubLogin(SocialLoginView):
    adapter_class = GitHubOAuth2Adapter
    client_class = OAuth2Client
    callback_url = f"{FRONTEND_URL}/"  # Changed to class attribute
    
    def post(self, request, *args, **kwargs):
        logger.info(f"GitHub login request received")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Callback URL: {self.callback_url}")
        
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(f"GitHub login successful")
            return response
        except Exception as e:
            logger.error(f"GitHub login failed: {str(e)}")
            logger.exception(e)
            raise


class FacebookLogin(SocialLoginView):
    adapter_class = FacebookOAuth2Adapter
    client_class = OAuth2Client
    callback_url = f"{FRONTEND_URL}/"  # Changed to class attribute
    
    def post(self, request, *args, **kwargs):
        logger.info(f"Facebook login request received")
        logger.info(f"Request data: {request.data}")
        logger.info(f"Callback URL: {self.callback_url}")
        
        try:
            response = super().post(request, *args, **kwargs)
            logger.info(f"Facebook login successful")
            return response
        except Exception as e:
            logger.error(f"Facebook login failed: {str(e)}")
            logger.exception(e)
            raise


class UserViewSet(viewsets.ModelViewSet):
    """API endpoint for admin users to manage all users"""
    queryset = User.objects.all().order_by('-date_joined')
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserView(viewsets.ModelViewSet):
    """API endpoint for users to view their own profile"""
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        return User.objects.filter(id=user.id)


class GroupViewSet(viewsets.ModelViewSet):
    """API endpoint for managing groups"""
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
    permission_classes = [permissions.IsAuthenticated]


class TokenList(ListCreateAPIView):
    queryset = Token.objects.all()
    serializer_class = TokenSerializer
    permission_classes = [permissions.IsAuthenticated]


class TokenDetail(RetrieveUpdateDestroyAPIView):
    queryset = User.objects.all()
    serializer_class = TokenSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmailAddressList(ListCreateAPIView):
    queryset = EmailAddress.objects.all()
    serializer_class = EmailAddressSerializer
    permission_classes = [permissions.IsAuthenticated]


class EmailAddressDetail(RetrieveUpdateDestroyAPIView):
    queryset = EmailAddress.objects.all()
    serializer_class = EmailAddressSerializer
    permission_classes = [permissions.IsAuthenticated]


class CustomPasswordResetView(PasswordResetView):
    serializer_class = CustomPasswordResetSerializer


class CustomPasswordResetFromKeyView(PasswordResetFromKeyView):
    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['uidb64'] = self.kwargs.get('uidb64')
        context['token'] = self.kwargs.get('token')
        return context


class SocialAccountList(ListCreateAPIView):
    queryset = SocialAccount.objects.all()
    serializer_class = SocialAccountSerializer
    permission_classes = [permissions.IsAuthenticated]


# New ELD Trip Views

class TripViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing trips with ELD calculations
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TripListSerializer
        elif self.action == 'create':
            return TripCreateSerializer
        return TripSerializer
    
    def get_queryset(self):
        """Filter trips by the authenticated user"""
        user = self.request.user
        if user.is_staff:
            return Trip.objects.all()
        return Trip.objects.filter(user=user)
    
    def perform_create(self, serializer):
        """Create trip and calculate route/stops"""
        trip = serializer.save(user=self.request.user)
        
        try:
            print(f"\n{'='*60}")
            print(f"[DEBUG] Starting route calculation for Trip #{trip.id}")
            print(f"[DEBUG] Route: {trip.current_location} → {trip.pickup_location} → {trip.dropoff_location}")
            print(f"{'='*60}\n")
            
            # Calculate route
            route_calculator = RouteCalculator()
            route_data = route_calculator.calculate_route(trip)
            
            print(f"[DEBUG] ✅ Route calculation complete:")
            print(f"  - Total Distance: {route_data.get('total_distance')} miles")
            print(f"  - Estimated Duration: {route_data.get('estimated_duration')} hours")
            print(f"  - Generated Stops: {len(route_data.get('stops', []))}")
            print(f"  - Generated Waypoints: {len(route_data.get('waypoints', []))}")
            
            # Update trip with calculated data
            trip.total_distance = route_data.get('total_distance')
            trip.estimated_duration = route_data.get('estimated_duration')
            trip.save()
            print(f"[DEBUG] ✅ Trip updated with distance and duration")
            
            # Create stops
            stops_data = route_data.get('stops', [])
            if stops_data:
                self._create_stops(trip, stops_data)
                stops_in_db = Stop.objects.filter(trip=trip).count()
                print(f"[DEBUG] ✅ Created {stops_in_db} stops in database")
            else:
                print(f"[WARNING] ⚠️  No stops generated by route calculator!")
            
            # Create waypoints
            waypoints_data = route_data.get('waypoints', [])
            if waypoints_data:
                self._create_waypoints(trip, waypoints_data)
                waypoints_in_db = RouteWaypoint.objects.filter(trip=trip).count()
                print(f"[DEBUG] ✅ Created {waypoints_in_db} waypoints in database")
            else:
                print(f"[WARNING] ⚠️  No waypoints generated!")
            
            # ⭐ CRITICAL FIX: Refresh trip to see newly created stops
            print(f"[DEBUG] 🔄 Refreshing trip object from database...")
            trip.refresh_from_db()
            
            # Verify stops are accessible
            stops_count = trip.stops.count()
            print(f"[DEBUG] ✅ Trip now shows {stops_count} stops after refresh")
            
            if stops_count == 0:
                print(f"[ERROR] ❌ No stops found after creation! Cannot generate logs.")
                print(f"[ERROR] Stopping here. Trip created but without stops/logs.")
                return
            
            # Calculate and create daily logs
            print(f"\n[DEBUG] 📊 Starting ELD log calculation...")
            eld_calculator = ELDCalculator()
            daily_logs = eld_calculator.calculate_logs(trip)
            print(f"[DEBUG] ✅ ELD calculator returned {len(daily_logs)} daily log(s)")
            
            if not daily_logs:
                print(f"[ERROR] ❌ ELD calculator returned empty list!")
                print(f"[DEBUG] Debug info:")
                print(f"  - trip.stops.exists() = {trip.stops.exists()}")
                print(f"  - trip.stops.count() = {trip.stops.count()}")
                return
            
            # Create daily logs and entries
            self._create_daily_logs(trip, daily_logs)
            
            # Final verification
            log_count = DailyLog.objects.filter(trip=trip).count()
            entry_count = LogEntry.objects.filter(daily_log__trip=trip).count()
            
            print(f"\n{'='*60}")
            print(f"[SUCCESS] ✅ Trip #{trip.id} created successfully!")
            print(f"[SUCCESS] Final counts:")
            print(f"  - Stops: {stops_count}")
            print(f"  - Waypoints: {waypoints_in_db if waypoints_data else 0}")
            print(f"  - Daily Logs: {log_count}")
            print(f"  - Log Entries: {entry_count}")
            print(f"{'='*60}\n")
            
        except Exception as e:
            print(f"\n{'='*60}")
            print(f"[ERROR] ❌ Route calculation failed for Trip #{trip.id}")
            print(f"[ERROR] Exception: {str(e)}")
            print(f"{'='*60}\n")
            import traceback
            traceback.print_exc()
            
            # Mark trip as planned but keep it
            trip.status = 'PLANNED'
            trip.save()
            print(f"[INFO] Trip saved with PLANNED status (without stops/logs)")
    
    def _create_stops(self, trip, stops_data):
        """Create stop objects for the trip"""
        stops = []
        for stop_data in stops_data:
            stop = Stop(
                trip=trip,
                stop_type=stop_data['type'],
                location=stop_data['location'],
                latitude=stop_data.get('latitude'),
                longitude=stop_data.get('longitude'),
                arrival_time=stop_data['arrival_time'],
                departure_time=stop_data['departure_time'],
                duration_minutes=stop_data['duration_minutes'],
                sequence_order=stop_data['sequence_order'],
                distance_from_start=stop_data['distance_from_start'],
                notes=stop_data.get('notes', '')
            )
            stops.append(stop)
        
        # Bulk create all stops
        Stop.objects.bulk_create(stops)
    
    def _create_waypoints(self, trip, waypoints_data):
        """Create waypoint objects for the route"""
        waypoints = []
        for waypoint_data in waypoints_data:
            waypoint = RouteWaypoint(
                trip=trip,
                latitude=waypoint_data['latitude'],
                longitude=waypoint_data['longitude'],
                sequence_order=waypoint_data['sequence_order'],
                distance_from_start=waypoint_data['distance_from_start'],
                time_from_start=waypoint_data['time_from_start']
            )
            waypoints.append(waypoint)
        
        # Bulk create all waypoints
        RouteWaypoint.objects.bulk_create(waypoints)
    
    def _create_daily_logs(self, trip, logs_data):
        """Create daily log sheets for the trip"""
        total_logs_created = 0
        total_entries_created = 0
        
        for log_data in logs_data:
            # Create the daily log
            daily_log = DailyLog.objects.create(
                trip=trip,
                driver=trip.user,
                log_date=log_data['date'],
                off_duty_hours=log_data['off_duty_hours'],
                sleeper_berth_hours=log_data['sleeper_berth_hours'],
                driving_hours=log_data['driving_hours'],
                on_duty_not_driving_hours=log_data['on_duty_hours'],
                starting_odometer=log_data.get('starting_odometer', 0),
                ending_odometer=log_data.get('ending_odometer', 0),
                starting_location=log_data.get('starting_location', ''),
                ending_location=log_data.get('ending_location', '')
            )
            total_logs_created += 1
            
            # Create log entries for this daily log
            entries_data = log_data.get('entries', [])
            for entry_data in entries_data:
                LogEntry.objects.create(
                    daily_log=daily_log,
                    status=entry_data['status'],
                    start_time=entry_data['start_time'],
                    end_time=entry_data['end_time'],
                    duration_minutes=entry_data['duration_minutes'],
                    location=entry_data.get('location', ''),
                    latitude=entry_data.get('latitude'),
                    longitude=entry_data.get('longitude'),
                    start_odometer=entry_data.get('start_odometer'),
                    end_odometer=entry_data.get('end_odometer'),
                    sequence_order=entry_data['sequence_order']
                )
                total_entries_created += 1
            
            # Recalculate totals for this log
            daily_log.calculate_totals()
        
        print(f"[DEBUG] ✅ Created {total_logs_created} daily log(s) with {total_entries_created} total entries")
    
    @action(detail=True, methods=['post'])
    def recalculate(self, request, pk=None):
        """Recalculate route and ELD logs for an existing trip"""
        trip = self.get_object()
        
        print(f"\n[DEBUG] Recalculating Trip #{trip.id}")
        
        # Delete existing stops, waypoints, and logs
        trip.stops.all().delete()
        trip.waypoints.all().delete()
        trip.daily_logs.all().delete()
        
        print(f"[DEBUG] Deleted existing stops, waypoints, and logs")
        
        # Recalculate
        try:
            route_calculator = RouteCalculator()
            route_data = route_calculator.calculate_route(trip)
            
            trip.total_distance = route_data.get('total_distance')
            trip.estimated_duration = route_data.get('estimated_duration')
            trip.save()
            
            self._create_stops(trip, route_data.get('stops', []))
            self._create_waypoints(trip, route_data.get('waypoints', []))
            
            # Refresh trip before calculating logs
            trip.refresh_from_db()
            
            eld_calculator = ELDCalculator()
            daily_logs = eld_calculator.calculate_logs(trip)
            self._create_daily_logs(trip, daily_logs)
            
            print(f"[SUCCESS] ✅ Trip #{trip.id} recalculated successfully")
            
            serializer = TripSerializer(trip)
            return Response(serializer.data)
        except Exception as e:
            print(f"[ERROR] ❌ Recalculation failed: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'error': f'Failed to recalculate route: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )


class StopViewSet(viewsets.ModelViewSet):
    """ViewSet for managing stops"""
    serializer_class = StopSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter stops by trip owner"""
        user = self.request.user
        if user.is_staff:
            return Stop.objects.all()
        return Stop.objects.filter(trip__user=user)


class DailyLogViewSet(viewsets.ModelViewSet):
    """ViewSet for managing daily ELD logs"""
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return DailyLogListSerializer
        return DailyLogSerializer
    
    def get_queryset(self):
        """Filter logs by driver"""
        user = self.request.user
        if user.is_staff:
            return DailyLog.objects.all()
        return DailyLog.objects.filter(driver=user)
    
    @action(detail=True, methods=['post'])
    def recalculate_totals(self, request, pk=None):
        """Recalculate totals for a daily log"""
        daily_log = self.get_object()
        daily_log.calculate_totals()
        serializer = DailyLogSerializer(daily_log)
        return Response(serializer.data)


class LogEntryViewSet(viewsets.ModelViewSet):
    """ViewSet for managing individual log entries"""
    serializer_class = LogEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter entries by daily log owner"""
        user = self.request.user
        if user.is_staff:
            return LogEntry.objects.all()
        return LogEntry.objects.filter(daily_log__driver=user)