from django.contrib.auth.models import User
from django.db.models import Avg, Count, Value, FloatField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.models import Game, RomHack, HackRating
from .serializers import (
    UserSerializer,
    RegisterSerializer,
    GameSerializer,
    RomHackSerializer,
    HackRatingSerializer
)

# Cadastro e consulta
class AuthViewSet(viewsets.GenericViewSet):
    queryset = User.objects.all()

    @action(detail=False, methods=['post'], permission_classes=[permissions.AllowAny])
    def register(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

# lista e busca de jogos
class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Game.objects
            .annotate(total_hacks=Count('hacks'))
            .prefetch_related(
                'hacks__ratings__user',
                'hacks__created_by'
            )
            .order_by('-created_at')
        )

# CRUD de Mods/Traduções e submissão de avaliações por usuários
class RomHackViewSet(viewsets.ModelViewSet):
    serializer_class = RomHackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = (
            RomHack.objects
            .annotate(
                avg_score=Coalesce(Avg('ratings__score'), Value(0, output_field=FloatField())),
                total_ratings=Count('ratings')
            )
            .select_related('game', 'created_by')
            .prefetch_related('ratings__user')
            .order_by('-avg_score')
        )

        game_id = self.request.query_params.get('game')
        if game_id:
            queryset = queryset.filter(game_id=game_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        # POST: Cria ou edita a nota/review do usuário logado no mod.    
        # DELETE: Exclui a avaliação.

        hack = self.get_object()

        if request.method == 'DELETE':
            HackRating.objects.filter(hack=hack, user=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        score = request.data.get('score')
        review = request.data.get('review', '')

        if not score or not (1 <= int(score) <= 5):
            return Response({'error': 'A nota deve ser um inteiro entre 1 e 5.'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = HackRating.objects.update_or_create(
            hack=hack,
            user=request.user,
            defaults={'score': int(score), 'review': review}
        )

        serializer = HackRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)