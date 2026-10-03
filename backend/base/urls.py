from django.urls import path
from .views import profile_list, profile_detail, profile_stats

urlpatterns = [
    path('profiles/stats/', profile_stats, name='profile-stats'),
    path('profiles/', profile_list, name='profile-list'),
    path('profiles/<int:pk>/', profile_detail, name='profile-detail'),
]
