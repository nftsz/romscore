from rest_framework.routers import DefaultRouter
from .viewsets import AuthViewSet, GameViewSet, RomHackViewSet

router = DefaultRouter()
router.register(r'auth', AuthViewSet, basename='auth')
router.register(r'games', GameViewSet, basename='games')
router.register(r'hacks', RomHackViewSet, basename='hacks')

urlpatterns = router.urls