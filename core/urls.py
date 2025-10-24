from django.conf import settings
from allauth.account.views import ConfirmEmailView
from django.urls import path, re_path, include
from django.conf.urls.static import static
from django.views.static import serve
from rest_framework import routers
from . import views
from .views import (
    UserView, UserViewSet, GroupViewSet, TokenList, TokenDetail,
    EmailAddressList, EmailAddressDetail, GoogleLogin, GithubLogin, 
    FacebookLogin, CustomPasswordResetView, CustomPasswordResetFromKeyView, 
    SocialAccountList, TripViewSet, StopViewSet, DailyLogViewSet, 
    LogEntryViewSet, ResendVerificationEmail
)

# Create router for viewsets
router = routers.DefaultRouter()
router.register(r'user', UserView, basename='user-request')
router.register(r'users', UserViewSet, basename='users')
router.register(r'groups', GroupViewSet, basename='groups')

# ELD Trip routes
router.register(r'trips', TripViewSet, basename='trips')
router.register(r'stops', StopViewSet, basename='stops')
router.register(r'daily-logs', DailyLogViewSet, basename='daily-logs')
router.register(r'log-entries', LogEntryViewSet, basename='log-entries')

urlpatterns = [
    # Main index
    path('', views.index, name='index'),
    
    # Router URLs (includes all ViewSets)
    path('api/', include(router.urls)),
    
    # Authentication endpoints
    path('rest-auth/google/login/', GoogleLogin.as_view(), name='google_login'),
    path('rest-auth/github/login/', GithubLogin.as_view(), name='github_login'),
    path('rest-auth/facebook/login/', FacebookLogin.as_view(), name='facebook_login'),
    path('rest-auth/user-request/', UserView.as_view({'get': 'list'}), name='user-request'),
    path('rest-auth/admin-user/', UserViewSet.as_view({'get': 'list'}), name='admin-users'),
    path('rest-auth/admin-group/', GroupViewSet.as_view({'get': 'list'}), name='admin-groups'),
    path('rest-auth/admin-token/', TokenList.as_view(), name='token-list'),
    path('rest-auth/admin-token/<int:pk>/', TokenDetail.as_view(), name='token-detail'),
    path('rest-auth/admin-email/', EmailAddressList.as_view(), name='email-list'),
    path('rest-auth/admin-email/<int:pk>/', EmailAddressDetail.as_view(), name='email-detail'),
    path('rest-auth/register/', views.SignUp.as_view(), name='signup'),
    path('rest-auth/signin/', views.Login.as_view(), name='login'),
    path('rest-auth/password-reset/', CustomPasswordResetView.as_view(), name='password_reset'),
    path('rest-auth/admin-socialaccount/', SocialAccountList.as_view(), name='socialaccount-list'),
    re_path(r'^media/(?P<path>.*)$', serve, {'document_root': settings.MEDIA_ROOT}),
    # Password reset with key
    path('accounts/password/reset/key/<uidb64>/<token>/', 
         CustomPasswordResetFromKeyView.as_view(), 
         name='account_reset_password_from_key'),
    path('accounts/confirm-email/<str:key>/', 
         ConfirmEmailView.as_view(), 
         name='account_confirm_email'),
    path('rest-auth/resend-verification/', 
        ResendVerificationEmail.as_view(), 
        name='resend_verification'),
]
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
