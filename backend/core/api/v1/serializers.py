from django.contrib.auth.models import User
from rest_framework import serializers
from core.models import Game, Rating

# --- SERIALIZERS DE AUTH ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )


# --- SERIALIZERS DE JOGOS & RATINGS ---
class RatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = Rating
        fields = ['id', 'user', 'username', 'score', 'comment', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class GameSerializer(serializers.ModelSerializer):
    avg_score = serializers.FloatField(read_only=True)
    total_ratings = serializers.IntegerField(read_only=True)
    user_rating = serializers.SerializerMethodField()
    ratings = RatingSerializer(many=True, read_only=True)

    class Meta:
        model = Game
        fields = [
            'id', 'rawg_id', 'slug', 'title', 'cover_url',
            'avg_score', 'total_ratings', 'user_rating', 'ratings', 'created_at'
        ]

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.score if rating else None
        return None