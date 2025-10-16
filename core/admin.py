from django.contrib import admin

# Register your models here.
from django.contrib import admin
from .models import Trip, Stop, DailyLog, LogEntry, RouteWaypoint


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):
    """Admin interface for Trip model"""
    
    list_display = [
        'id', 'user', 'status', 'current_location', 'pickup_location',
        'dropoff_location', 'total_distance', 'current_cycle_used',
        'created_at'
    ]
    
    list_filter = ['status', 'created_at', 'user']
    
    search_fields = [
        'current_location', 'pickup_location', 'dropoff_location',
        'user__username', 'user__email'
    ]
    
    readonly_fields = [
        'id', 'created_at', 'updated_at', 'available_driving_hours'
    ]
    
    fieldsets = (
        ('Trip Information', {
            'fields': ('id', 'user', 'status', 'created_at', 'updated_at')
        }),
        ('Locations', {
            'fields': (
                ('current_location', 'current_lat', 'current_lng'),
                ('pickup_location', 'pickup_lat', 'pickup_lng'),
                ('dropoff_location', 'dropoff_lat', 'dropoff_lng'),
            )
        }),
        ('Trip Details', {
            'fields': (
                'current_cycle_used',
                'available_driving_hours',
                'total_distance',
                'estimated_duration',
            )
        }),
        ('Timing', {
            'fields': ('start_time', 'end_time')
        }),
    )
    
    date_hierarchy = 'created_at'
    
    def get_queryset(self, request):
        """Filter trips for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(user=request.user)


@admin.register(Stop)
class StopAdmin(admin.ModelAdmin):
    """Admin interface for Stop model"""
    
    list_display = [
        'id', 'trip', 'stop_type', 'location', 'sequence_order',
        'arrival_time', 'departure_time', 'duration_minutes'
    ]
    
    list_filter = ['stop_type', 'arrival_time', 'trip__user']
    
    search_fields = ['location', 'trip__id', 'notes']
    
    readonly_fields = ['id', 'duration_hours']
    
    fieldsets = (
        ('Stop Information', {
            'fields': ('id', 'trip', 'stop_type', 'sequence_order')
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude', 'distance_from_start')
        }),
        ('Timing', {
            'fields': (
                'arrival_time',
                'departure_time',
                'duration_minutes',
                'duration_hours',
            )
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'arrival_time'
    
    def get_queryset(self, request):
        """Filter stops for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(trip__user=request.user)


@admin.register(DailyLog)
class DailyLogAdmin(admin.ModelAdmin):
    """Admin interface for DailyLog model"""
    
    list_display = [
        'id', 'trip', 'driver', 'log_date', 'driving_hours',
        'on_duty_not_driving_hours', 'total_hours', 'total_miles',
        'has_violation'
    ]
    
    list_filter = ['log_date', 'has_violation', 'driver']
    
    search_fields = [
        'driver__username', 'trip__id', 'starting_location',
        'ending_location', 'remarks'
    ]
    
    readonly_fields = ['id', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Log Information', {
            'fields': ('id', 'trip', 'driver', 'log_date')
        }),
        ('Hours Summary', {
            'fields': (
                'off_duty_hours',
                'sleeper_berth_hours',
                'driving_hours',
                'on_duty_not_driving_hours',
                'total_hours',
            )
        }),
        ('Distance & Odometer', {
            'fields': (
                'total_miles',
                'starting_odometer',
                'ending_odometer',
            )
        }),
        ('Locations', {
            'fields': ('starting_location', 'ending_location')
        }),
        ('Violations & Remarks', {
            'fields': ('has_violation', 'violation_description', 'remarks'),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'log_date'
    
    actions = ['recalculate_totals']
    
    def recalculate_totals(self, request, queryset):
        """Action to recalculate totals for selected logs"""
        count = 0
        for log in queryset:
            log.calculate_totals()
            count += 1
        
        self.message_user(
            request,
            f'Successfully recalculated totals for {count} log(s).'
        )
    
    recalculate_totals.short_description = 'Recalculate totals for selected logs'
    
    def get_queryset(self, request):
        """Filter logs for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(driver=request.user)


@admin.register(LogEntry)
class LogEntryAdmin(admin.ModelAdmin):
    """Admin interface for LogEntry model"""
    
    list_display = [
        'id', 'daily_log', 'status', 'start_time', 'end_time',
        'duration_minutes', 'location', 'sequence_order'
    ]
    
    list_filter = ['status', 'start_time', 'daily_log__driver']
    
    search_fields = ['location', 'notes', 'daily_log__id']
    
    readonly_fields = ['id', 'duration_hours', 'miles_driven']
    
    fieldsets = (
        ('Entry Information', {
            'fields': ('id', 'daily_log', 'status', 'sequence_order')
        }),
        ('Timing', {
            'fields': (
                'start_time',
                'end_time',
                'duration_minutes',
                'duration_hours',
            )
        }),
        ('Location', {
            'fields': ('location', 'latitude', 'longitude')
        }),
        ('Odometer', {
            'fields': (
                'start_odometer',
                'end_odometer',
                'miles_driven',
            )
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
    
    date_hierarchy = 'start_time'
    
    def get_queryset(self, request):
        """Filter entries for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(daily_log__driver=request.user)


@admin.register(RouteWaypoint)
class RouteWaypointAdmin(admin.ModelAdmin):
    """Admin interface for RouteWaypoint model"""
    
    list_display = [
        'id', 'trip', 'sequence_order', 'latitude', 'longitude',
        'distance_from_start', 'time_from_start'
    ]
    
    list_filter = ['trip__user', 'trip__status']
    
    search_fields = ['trip__id']
    
    readonly_fields = ['id']
    
    fieldsets = (
        ('Waypoint Information', {
            'fields': ('id', 'trip', 'sequence_order')
        }),
        ('Coordinates', {
            'fields': ('latitude', 'longitude')
        }),
        ('Trip Progress', {
            'fields': ('distance_from_start', 'time_from_start')
        }),
    )
    
    def get_queryset(self, request):
        """Filter waypoints for non-superusers"""
        qs = super().get_queryset(request)
        if request.user.is_superuser:
            return qs
        return qs.filter(trip__user=request.user)


# Customize the admin site header and title
admin.site.site_header = "ELD Trip Planning Administration"
admin.site.site_title = "ELD Admin"
admin.site.index_title = "Welcome to ELD Trip Planning Admin Portal"