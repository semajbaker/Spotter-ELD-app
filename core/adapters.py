from allauth.socialaccount.adapter import DefaultSocialAccountAdapter
from allauth.account.models import EmailAddress
from django.contrib.auth import get_user_model

User = get_user_model()


class MySocialAccountAdapter(DefaultSocialAccountAdapter):
    def pre_social_login(self, request, sociallogin):
        """
        Invoked just after a user successfully authenticates via a social provider,
        but before the login is actually processed.
        
        We're checking if an email address already exists in the database
        and if it does, we connect this new social login to the existing user.
        """
        # Check if user is already logged in
        if sociallogin.is_existing:
            return

        # Check if we have an email
        if not sociallogin.email_addresses:
            return

        # Get the email from social login
        email = sociallogin.email_addresses[0].email.lower()

        try:
            # Check if a user with this email already exists
            user = User.objects.get(email__iexact=email)
            
            # Connect the social account to the existing user
            sociallogin.connect(request, user)
            
        except User.DoesNotExist:
            # User doesn't exist, proceed with normal signup
            pass
    
    def save_user(self, request, sociallogin, form=None):
        """
        Saves a newly signed up social login user.
        """
        user = super().save_user(request, sociallogin, form)
        return user