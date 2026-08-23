from django.contrib.auth.models import User
from rest_framework import serializers
from core.models import Game, RomHack, HackRating

# AUTH SERIALIZERS 
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


#  RATINGS SERIALIZERS 
class HackRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = HackRating
        fields = ['id', 'user', 'username', 'score', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


#  ROM HACK SERIALIZERS 
class RomHackSerializer(serializers.ModelSerializer):
    submitted_by = serializers.ReadOnlyField(source='created_by.username')
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    avg_score = serializers.FloatField(read_only=True)
    total_ratings = serializers.IntegerField(read_only=True)
    user_rating = serializers.SerializerMethodField()
    ratings = HackRatingSerializer(many=True, read_only=True)

    class Meta:
        model = RomHack
        fields = [
            'id', 'game', 'title', 'author_name', 'category', 'category_display',
            'description', 'patch_url', 'submitted_by', 'avg_score', 
            'total_ratings', 'user_rating', 'ratings', 'created_at'
        ]
        read_only_fields = ['id', 'submitted_by', 'created_at']

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.score if rating else None
        return None


#  GAME SERIALIZERS 
class GameSerializer(serializers.ModelSerializer):
    hacks = RomHackSerializer(many=True, read_only=True)
    total_hacks = serializers.IntegerField(read_only=True)

    class Meta:
        model = Game
        fields = ['id', 'rawg_id', 'slug', 'title', 'cover_url', 'total_hacks', 'hacks', 'created_at']