from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import Game, RomHack, HackRating

class RideAnalyticsAPITests(APITestCase):

    def setUp(self):
        # Usuário autenticado
        self.user = User.objects.create_user(username='tata', password='password123')
        
        # Outro usuário para testes de concorrência
        self.other_user = User.objects.create_user(username='player2', password='password123')

        # Jogo base
        self.game = Game.objects.create(
            rawg_id=1234,
            slug='pokemon-emerald',
            title='Pokémon Emerald Version',
            cover_url='https://example.com/cover.jpg'
        )

        # Mod/Hack base
        self.hack = RomHack.objects.create(
            game=self.game,
            title='Pokémon Inclement Emerald',
            author_name='Buffel Saft',
            category='improvement',
            description='Difficulty and QoL patch',
            created_by=self.user
        )

        # Obter JWT Token
        login_response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'tata',
            'password': 'password123'
        }, format='json')
        self.access_token = login_response.data['access']

    # Valida se a listagem de jogos inclui o cálculo total de hacks
    def test_list_games_returns_aggregated_hacks_count(self):
        response = self.client.get(reverse('game-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['total_hacks'], 1)

    # Valida a criação de um mod por usuário logado
    def test_create_romhack_authenticated(self):
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        data = {
            'game': self.game.id,
            'title': 'Chrono Trigger PT-BR',
            'author_name': 'Comunidade Traduções',
            'category': 'translation',
            'description': 'Tradução 100% em português brasileiro.'
        }
        response = self.client.post(reverse('hack-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['submitted_by'], 'tata')


    # Valida a criação de avaliações e cálculo dinâmico da média
    def test_rate_romhack_and_calculate_average(self):
        rate_url = reverse('hack-rate', kwargs={'pk': self.hack.id})
        
        # Usuário 1 avalia com 5 estrelas
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')
        res1 = self.client.post(rate_url, {'score': 5, 'review': 'Incrível!'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Usuário 2 avalia com 3 estrelas
        login_res2 = self.client.post(reverse('token_obtain_pair'), {
            'username': 'player2',
            'password': 'password123'
        }, format='json')
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {login_res2.data['access']}")
        res2 = self.client.post(rate_url, {'score': 3, 'review': 'Bom, mas difícil.'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

        # Checar se a média na listagem resultou em (5 + 3) / 2 = 4.0
        list_response = self.client.get(reverse('hack-list'))
        hack_data = list_response.data[0]
        self.assertEqual(hack_data['avg_score'], 4.0)
        self.assertEqual(hack_data['total_ratings'], 2)


    # Garante que requisições sem autenticação não possam postar avaliações
    def test_unauthenticated_user_cannot_rate(self):
        rate_url = reverse('hack-rate', kwargs={'pk': self.hack.id})
        response = self.client.post(rate_url, {'score': 5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)