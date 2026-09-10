from django.contrib.auth.models import User
from django.db.models import Avg, Count, Value, FloatField, Max
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination

from core.models import Game, RomHack, HackRating
from .serializers import (
    GameSerializer,
    RomHackSerializer,
    HackRatingSerializer,
    UserSerializer,
    RegisterSerializer
)


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
        return Response(UserSerializer(request.user).data)

class StandardResultsSetPagination(PageNumberPagination):
    page_size = 50
    page_size_query_param = 'page_size'
    max_page_size = 100


class GameViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [permissions.AllowAny]
    serializer_class = GameSerializer
    pagination_class = StandardResultsSetPagination  # 👈 Classe de paginação

    def get_queryset(self):
        queryset = Game.objects.annotate(
            total_hacks=Count('hacks', distinct=True),
            latest_hack_date=Max('hacks__created_at'),
        )

        platform = self.request.query_params.get('platform')
        if platform:
            queryset = queryset.filter(platform__iexact=platform.strip())

        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(title__icontains=search.strip())

        filter_type = self.request.query_params.get('filter')
        if filter_type == 'popular':
            queryset = queryset.order_by('-total_players', '-id')
        elif filter_type == 'recent_hacks':
            queryset = queryset.filter(total_hacks__gt=0).order_by('-latest_hack_date', '-id')
        elif filter_type == 'most_hacked':
            queryset = queryset.filter(total_hacks__gt=0).order_by('-total_hacks', '-id')
        else:
            queryset = queryset.order_by('-total_players', '-id')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        search = request.query_params.get('search')
        limit = request.query_params.get('limit')

        # Se for busca por texto ou carrossel com limit, retorna a lista direta para facilitar no frontend
        if search or limit:
            if limit:
                try:
                    queryset = queryset[:int(limit)]
                except ValueError:
                    pass
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)

        # Fluxo paginado padrão (para CategoryPage)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


class RomHackViewSet(viewsets.ModelViewSet):
    serializer_class = RomHackSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = (
            RomHack.objects
            .annotate(
                avg_score=Coalesce(Avg('ratings__score'), Value(0, output_field=FloatField())),
                total_ratings=Count('ratings', distinct=True)
            )
            .select_related('game', 'created_by')
            .prefetch_related('ratings__user', 'screenshots')
            .order_by('-avg_score', '-id')
        )

        game_id = self.request.query_params.get('game')
        if game_id:
            queryset = queryset.filter(game_id=game_id)
        return queryset

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def my_hacks(self, request):
        user_hacks = self.get_queryset().filter(created_by=request.user)
        serializer = self.get_serializer(user_hacks, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        hack = self.get_object()

        if request.method == 'DELETE':
            HackRating.objects.filter(hack=hack, user=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        score = request.data.get('score')
        review = request.data.get('review', '')

        if not score or not (1 <= int(score) <= 5):
            return Response(
                {'error': 'A nota deve ser um inteiro entre 1 e 5.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        rating, created = HackRating.objects.update_or_create(
            hack=hack,
            user=request.user,
            defaults={'score': int(score), 'review': review}
        )

        serializer = HackRatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)