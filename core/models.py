from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone


class Trip(models.Model):
    """
    Main trip model storing route and driver information
    """
    STATUS_CHOICES = [
        ('PLANNED', 'Planned'),
        ('IN_PROGRESS', 'In Progress'),
        ('COMPLETED', 'Completed'),
        ('CANCELLED', 'Cancelled'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    
    # Location data
    current_location = models.CharField(max_length=500, help_text="Starting point address or coordinates")
    current_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    current_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    pickup_location = models.CharField(max_length=500, help_text="Pickup location address")
    pickup_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    pickup_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    dropoff_location = models.CharField(max_length=500, help_text="Dropoff location address")
    dropoff_lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    dropoff_lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Driver cycle information
    current_cycle_used = models.DecimalField(
        max_digits=5, 
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(70)],
        help_text="Hours already used in current 8-day cycle (max 70)"
    )
    
    # Trip calculations
    total_distance = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Total distance in miles")
    estimated_duration = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, help_text="Estimated duration in hours")
    
    # Trip status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PLANNED')
    start_time = models.DateTimeField(null=True, blank=True)
    end_time = models.DateTimeField(null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['-created_at']),
            models.Index(fields=['user', 'status']),
        ]
    
    def __str__(self):
        return f"Trip {self.id} - {self.user.username} - {self.status}"
    
    @property
    def available_driving_hours(self):
        """Calculate remaining hours in 70-hour/8-day cycle"""
        return max(0, 70 - float(self.current_cycle_used))


class Stop(models.Model):
    """
    Represents a stop along the route (fuel, rest, break, etc.)
    """
    STOP_TYPE_CHOICES = [
        ('FUEL', 'Fuel Stop'),
        ('REST', 'Rest Break (30 min)'),
        ('SLEEPER', 'Sleeper Berth (8-10 hours)'),
        ('OFF_DUTY', 'Off Duty (10 hours)'),
        ('PICKUP', 'Pickup Stop'),
        ('DROPOFF', 'Dropoff Stop'),
    ]

    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='stops')
    
    # Stop details
    stop_type = models.CharField(max_length=20, choices=STOP_TYPE_CHOICES)
    location = models.CharField(max_length=500)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Timing
    arrival_time = models.DateTimeField()
    departure_time = models.DateTimeField()
    duration_minutes = models.IntegerField(help_text="Duration of stop in minutes")
    
    # Sequencing
    sequence_order = models.IntegerField(help_text="Order of stop in route")
    
    # Additional info
    distance_from_start = models.DecimalField(max_digits=10, decimal_places=2, help_text="Miles from trip start")
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['trip', 'sequence_order']
        indexes = [
            models.Index(fields=['trip', 'sequence_order']),
        ]
    
    def __str__(self):
        return f"{self.get_stop_type_display()} - {self.location}"
    
    @property
    def duration_hours(self):
        """Convert duration to hours"""
        return self.duration_minutes / 60.0


class DailyLog(models.Model):
    """
    ELD Daily Log Sheet - one per calendar day per trip
    """
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='daily_logs')
    driver = models.ForeignKey(User, on_delete=models.CASCADE, related_name='daily_logs')
    
    # Date information
    log_date = models.DateField()
    
    # Hour totals for the day
    off_duty_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    sleeper_berth_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    driving_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    on_duty_not_driving_hours = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    
    # Totals
    total_hours = models.DecimalField(max_digits=5, decimal_places=2, default=24)
    total_miles = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    # Odometer
    starting_odometer = models.IntegerField(default=0)
    ending_odometer = models.IntegerField(default=0)
    
    # Location information
    starting_location = models.CharField(max_length=500, blank=True)
    ending_location = models.CharField(max_length=500, blank=True)
    
    # Remarks and violations
    remarks = models.TextField(blank=True)
    has_violation = models.BooleanField(default=False)
    violation_description = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['trip', 'log_date']
        unique_together = ['trip', 'driver', 'log_date']
        indexes = [
            models.Index(fields=['trip', 'log_date']),
            models.Index(fields=['driver', 'log_date']),
        ]
    
    def __str__(self):
        return f"Log {self.log_date} - {self.driver.username}"
    
    def calculate_totals(self):
        """Calculate total hours from all entries"""
        self.total_hours = (
            self.off_duty_hours + 
            self.sleeper_berth_hours + 
            self.driving_hours + 
            self.on_duty_not_driving_hours
        )
        self.total_miles = self.ending_odometer - self.starting_odometer
        self.save()


class LogEntry(models.Model):
    """
    Individual log entries within a daily log
    Represents status changes throughout the day
    """
    STATUS_CHOICES = [
        ('OFF_DUTY', 'Off Duty'),
        ('SLEEPER', 'Sleeper Berth'),
        ('DRIVING', 'Driving'),
        ('ON_DUTY', 'On Duty (Not Driving)'),
    ]

    daily_log = models.ForeignKey(DailyLog, on_delete=models.CASCADE, related_name='entries')
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration_minutes = models.IntegerField()
    
    # Location
    location = models.CharField(max_length=500, blank=True)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    
    # Odometer (primarily for driving entries)
    start_odometer = models.IntegerField(null=True, blank=True)
    end_odometer = models.IntegerField(null=True, blank=True)
    
    # Notes
    notes = models.TextField(blank=True)
    
    # Sequencing
    sequence_order = models.IntegerField()
    
    class Meta:
        ordering = ['daily_log', 'start_time']
        indexes = [
            models.Index(fields=['daily_log', 'start_time']),
        ]
    
    def __str__(self):
        return f"{self.get_status_display()} - {self.start_time}"
    
    @property
    def duration_hours(self):
        """Convert duration to hours"""
        return self.duration_minutes / 60.0
    
    @property
    def miles_driven(self):
        """Calculate miles driven in this entry"""
        if self.start_odometer and self.end_odometer:
            return self.end_odometer - self.start_odometer
        return 0


class RouteWaypoint(models.Model):
    """
    Stores waypoints for the route to be displayed on the map
    """
    trip = models.ForeignKey(Trip, on_delete=models.CASCADE, related_name='waypoints')
    
    # Coordinates
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    
    # Sequencing
    sequence_order = models.IntegerField()
    
    # Distance and time from start
    distance_from_start = models.DecimalField(max_digits=10, decimal_places=2, help_text="Miles from trip start")
    time_from_start = models.DecimalField(max_digits=10, decimal_places=2, help_text="Hours from trip start")
    
    class Meta:
        ordering = ['trip', 'sequence_order']
        indexes = [
            models.Index(fields=['trip', 'sequence_order']),
        ]
    
    def __str__(self):
        return f"Waypoint {self.sequence_order} for Trip {self.trip.id}"