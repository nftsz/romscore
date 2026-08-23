from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

class Game(models.Model):
    """
    Representa o jogo rastreado no nosso sistema.
    Guardamos apenas a referência externa e um cache básico para buscas e rankings.
    """
    rawg_id = models.IntegerField(unique=True)  # ID oficial que vem da API externa
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=255)
    cover_url = models.URLField(blank=True, null=True)  # URL da imagem que vem da API
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} (ID: {self.rawg_id})"


class Rating(models.Model):
    """
    Avaliação do usuário para o jogo.
    """
    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='ratings')
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    comment = models.TextField(blank=True, null=True)  # Se quiser permitir review escrita
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('game', 'user')  # 1 usuário = 1 nota por jogo

    def __str__(self):
        return f"{self.user.username} -> {self.game.title} ({self.score}★)"