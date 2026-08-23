from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Endpoints do JWT (Login / Refresh)
    path('api/v1/auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/v1/auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Endpoints registrados pelo Router (Register: /api/v1/auth/register/ | Me: /api/v1/auth/me/)
    path('api/v1/', include('starfeedback.api.v1.router')),
]