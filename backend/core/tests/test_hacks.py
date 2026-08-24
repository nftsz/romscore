from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from core.models import Game, RomHack, HackRating


class RideAnalyticsAPITests(APITestCase):

    def setUp(self):
        # Usuário autenticado padrão
        self.user = User.objects.create_user(username='tata', email='tata@example.com', password='password123')
        
        # Outro usuário para testes de concorrência e avaliações múltiplas
        self.other_user = User.objects.create_user(username='player2', email='p2@example.com', password='password123')

        # Jogos base com métricas do RetroAchievements
        self.game = Game.objects.create(
            ra_id=1968,
            slug='pokemon-emerald-gba',
            title='Pokémon Emerald Version',
            platform='GBA',
            total_players=45000,
            cover_url='https://media.retroachievements.org/Images/043004.png'
        )

        self.game_snes = Game.objects.create(
            ra_id=243,
            slug='super-mario-world-snes',
            title='Super Mario World',
            platform='SNES',
            total_players=108000,
            cover_url='https://media.retroachievements.org/Images/047124.png'
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

        # Autenticação do usuário principal
        self.client.force_authenticate(user=self.user)

    # 1. Valida o cadastro público de novos usuários
    def test_user_registration(self):
        self.client.force_authenticate(user=None) # Desloga para testar rota pública
        data = {
            'username': 'novousuario',
            'email': 'novo@example.com',
            'password': 'senha_segura123'
        }
        response = self.client.post(reverse('auth-register'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'novousuario')
        self.assertTrue(User.objects.filter(username='novousuario').exists())

    # 2. Valida listagem de jogos, total de hacks agregados e filtros por console
    def test_list_games_with_hacks_count_and_filters(self):
        response = self.client.get(reverse('games-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

        # Filtro por plataforma
        response_gba = self.client.get(reverse('games-list'), {'platform': 'GBA'})
        self.assertEqual(len(response_gba.data), 1)
        self.assertEqual(response_gba.data[0]['total_hacks'], 1)
        self.assertEqual(response_gba.data[0]['ra_id'], 1968)

    # 3. Valida ordenação por popularidade (-total_players)
    def test_filter_games_by_popularity(self):
        response = self.client.get(reverse('games-list'), {'filter': 'popular'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Super Mario World (108k) deve vir antes de Pokémon Emerald (45k)
        self.assertEqual(response.data[0]['title'], 'Super Mario World')
        self.assertEqual(response.data[1]['title'], 'Pokémon Emerald Version')

    # 4. Valida a criação de um mod/hack por usuário logado
    def test_create_romhack_authenticated(self):
        data = {
            'game': self.game.id,
            'title': 'Chrono Trigger PT-BR',
            'author_name': 'Comunidade Traduções',
            'category': 'translation',
            'description': 'Tradução 100% em português brasileiro.'
        }
        response = self.client.post(reverse('hacks-list'), data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['submitted_by'], 'tata')

    # 5. Valida a listagem das hacks submetidas pelo próprio usuário (my_hacks)
    def test_get_my_submitted_hacks(self):
        response = self.client.get(reverse('hacks-my-hacks'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['title'], 'Pokémon Inclement Emerald')

    # 6. Valida criação de avaliações e cálculo dinâmico da média
    def test_rate_romhack_and_calculate_average(self):
        rate_url = reverse('hacks-rate', kwargs={'pk': self.hack.id})
        
        # Usuário 1 avalia com nota 5
        res1 = self.client.post(rate_url, {'score': 5, 'review': 'Incrível!'}, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)

        # Usuário 2 avalia com nota 3
        self.client.force_authenticate(user=self.other_user)
        res2 = self.client.post(rate_url, {'score': 3, 'review': 'Bom, mas difícil.'}, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)

        # Checar se a média resultou em (5 + 3) / 2 = 4.0
        list_response = self.client.get(reverse('hacks-list'))
        hack_data = [h for h in list_response.data if h['id'] == self.hack.id][0]
        self.assertEqual(hack_data['avg_score'], 4.0)
        self.assertEqual(hack_data['total_ratings'], 2)

    # 7. Garante que usuários anônimos não consigam postar avaliações
    def test_unauthenticated_user_cannot_rate(self):
        self.client.force_authenticate(user=None)
        rate_url = reverse('hacks-rate', kwargs={'pk': self.hack.id})
        response = self.client.post(rate_url, {'score': 5}, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)