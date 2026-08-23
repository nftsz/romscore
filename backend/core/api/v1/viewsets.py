from django.contrib.auth.models import User
from django.db.models import Avg, Count, Value, FloatField
from django.db.models.functions import Coalesce
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response

from core.models import Game, Rating
from .serializers import UserSerializer, RegisterSerializer, GameSerializer, RatingSerializer

class AuthViewSet(viewsets.GenericViewSet):
    """
    ViewSet para registro de novos usuários e consulta do usuário logado.
    """
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


class GameViewSet(viewsets.ModelViewSet):
    """
    ViewSet para listar jogos salvos, detalhar e avaliar.
    """
    serializer_class = GameSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return (
            Game.objects
            .annotate(
                avg_score=Coalesce(Avg('ratings__score'), Value(0, output_field=FloatField())),
                total_ratings=Count('ratings')
            )
            .prefetch_related('ratings__user')
            .order_by('-avg_score')
        )

    @action(detail=True, methods=['post', 'delete'], permission_classes=[permissions.IsAuthenticated])
    def rate(self, request, pk=None):
        """
        POST: Cria ou atualiza a nota/comentário do usuário logado.
        DELETE: Remove a nota do usuário logado.
        """
        game = self.get_object()

        if request.method == 'DELETE':
            Rating.objects.filter(game=game, user=request.user).delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        score = request.data.get('score')
        comment = request.data.get('comment', '')

        if not score or not (1 <= int(score) <= 5):
            return Response({'error': 'A nota (score) deve ser um inteiro de 1 a 5.'}, status=status.HTTP_400_BAD_REQUEST)

        rating, created = Rating.objects.update_or_create(
            game=game,
            user=request.user,
            defaults={'score': int(score), 'comment': comment}
        )

        serializer = RatingSerializer(rating)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)