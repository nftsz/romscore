from rest_framework.routers import DefaultRouter
from .viewsets import AuthViewSet, GameViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'games', GameViewSet, basename='game')

urlpatterns = router.urls