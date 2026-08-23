from django.test import TestCase
from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class AuthTests(APITestCase):

    def setUp(self):
        # Usuário base para testes de login
        self.username = 'tester'
        self.password = 'password123'
        self.user = User.objects.create_user(
            username=self.username,
            password=self.password
        )
        self.register_url = reverse('auth-register')
        self.login_url = reverse('token_obtain_pair')
        self.me_url = reverse('auth-me')

    # Valida se um novo usuário consegue se cadastrar com sucesso
    def test_register_user_success(self):
        data = {
            'username': 'newuser',
            'password': 'securepassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['username'], 'newuser')
        self.assertTrue(User.objects.filter(username='newuser').exists())

    # Valida se as credenciais corretas retornam os tokens JWT access e refresh
    def test_login_success_returns_jwt_tokens(self):
        data = {
            'username': self.username,
            'password': self.password
        }
        response = self.client.post(self.login_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    # Valida o acesso à rota protegida /api/v1/auth/me/ com token válido
    def test_access_me_endpoint_authenticated(self):
        # Obter o token de login
        login_response = self.client.post(self.login_url, {
            'username': self.username,
            'password': self.password
        }, format='json')
        access_token = login_response.data['access']

        # Fazer requisição autenticada
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {access_token}')
        response = self.client.get(self.me_url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], self.username)

    # Garante q requisições sem token recebam 401 Unauthorized
    def test_access_me_endpoint_unauthenticated_fails(self):
        response = self.client.get(self.me_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)