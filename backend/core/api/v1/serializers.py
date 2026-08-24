from django.contrib.auth.models import User
from django.db.models import Avg
from rest_framework import serializers
from core.models import Game, RomHack, HackScreenshot, HackRating


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']
        extra_kwargs = {'email': {'required': False, 'allow_blank': True}}

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password']
        )


class HackScreenshotSerializer(serializers.ModelSerializer):
    class Meta:
        model = HackScreenshot
        fields = ['id', 'image_url', 'caption', 'created_at']


class HackRatingSerializer(serializers.ModelSerializer):
    username = serializers.ReadOnlyField(source='user.username')

    class Meta:
        model = HackRating
        fields = ['id', 'user', 'username', 'score', 'review', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class RomHackSerializer(serializers.ModelSerializer):
    submitted_by = serializers.ReadOnlyField(source='created_by.username')
    category_display = serializers.CharField(source='get_category_display', read_only=True)
    screenshots = HackScreenshotSerializer(many=True, read_only=True)
    screenshots_urls = serializers.ListField(
        child=serializers.URLField(),
        write_only=True,
        required=False,
        default=list
    )
    ratings = HackRatingSerializer(many=True, read_only=True)
    avg_score = serializers.SerializerMethodField()
    total_ratings = serializers.SerializerMethodField()
    user_rating = serializers.SerializerMethodField()

    class Meta:
        model = RomHack
        fields = [
            'id', 'game', 'title', 'author_name', 'category', 'category_display',
            'description', 'patch_url', 'cover_url', 'submitted_by',
            'avg_score', 'total_ratings', 'user_rating', 'screenshots', 'screenshots_urls',
            'ratings', 'created_at'
        ]
        read_only_fields = ['id', 'submitted_by', 'created_at']

    def create(self, validated_data):
        # Extrai os links de screenshots para persistir na tabela relacionada
        screenshots_urls = validated_data.pop('screenshots_urls', [])
        
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            validated_data['created_by'] = request.user

        rom_hack = RomHack.objects.create(**validated_data)

        # Cria os objetos de screenshot vinculados à hack recém-criada
        for url in screenshots_urls[:3]:
            if url.strip():
                HackScreenshot.objects.create(hack=rom_hack, image_url=url.strip())

        return rom_hack

    def get_avg_score(self, obj):
        if hasattr(obj, 'avg_score') and obj.avg_score is not None:
            return float(obj.avg_score)
        val = obj.ratings.aggregate(avg=Avg('score'))['avg']
        return float(val) if val is not None else 0.0

    def get_total_ratings(self, obj):
        if hasattr(obj, 'total_ratings') and obj.total_ratings is not None:
            return int(obj.total_ratings)
        return obj.ratings.count()

    def get_user_rating(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            rating = obj.ratings.filter(user=request.user).first()
            return rating.score if rating else None
        return None


class GameSerializer(serializers.ModelSerializer):
    hacks = RomHackSerializer(many=True, read_only=True)
    total_hacks = serializers.IntegerField(read_only=True)

    class Meta:
        model = Game
        fields = [
            'id', 'ra_id', 'slug', 'title', 'console_id', 'platform',
            'released_date', 'publisher', 'developer', 'genre',
            'cover_url', 'title_screen_url', 'ingame_screen_url',
            'total_players', 'total_hacks', 'hacks', 'created_at'
        ]