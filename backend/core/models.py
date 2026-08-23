from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

# Decidi mudar para focar em romhacks

# Guarda apenas a referência externa e um cache básico para buscas e rankings.
class Game(models.Model):
    rawg_id = models.IntegerField(unique=True)  # ID oficial que vem da API externa
    slug = models.SlugField(max_length=200, unique=True)
    title = models.CharField(max_length=255)
    cover_url = models.URLField(blank=True, null=True)  # URL da imagem que vem da API
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title

# Modificação, Tradução ou Hack aplicada ao jogo original. Estou disponibilizando:
# Autor da tradução/mod; O que essa romhack muda/acrescenta; Link externo (IPS/UPS/BPS patch)
class RomHack(models.Model):
    
    CATEGORY_CHOICES = [
        ('translation', 'Tradução'),
        ('improvement', 'Melhoria / Quality of Life'),
        ('complete_hack', 'Overhaul / Jogo Novo'),
        ('difficulty', 'Balanceamento / Dificuldade'),
    ]

    game = models.ForeignKey(Game, on_delete=models.CASCADE, related_name='hacks')
    author_name = models.CharField(max_length=100) 
    title = models.CharField(max_length=255)       
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='translation')
    description = models.TextField()               
    patch_url = models.URLField(blank=True, null=True) 
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='submitted_hacks')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.game.title})"

# Avaliação e review do usuário focada no Mod/Tradução
class HackRating(models.Model):
    hack = models.ForeignKey(RomHack, on_delete=models.CASCADE, related_name='ratings')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='hack_ratings')
    score = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    review = models.TextField(blank=True, null=True) # Feedback sobre estabilidade, texto, etc.
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('hack', 'user') # 1 avaliação por usuário em cada mod

    def __str__(self):
        return f"{self.user.username} -> {self.hack.title} ({self.score}★)"
