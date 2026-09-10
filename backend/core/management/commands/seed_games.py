import time
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Game
from core.services.services import RetroAchievementsService

RA_CONSOLES = [
    {"id": 5, "name": "GBA"},                # Game Boy Advance
    {"id": 7, "name": "NES"},                # NES
    {"id": 3, "name": "SNES"},               # Super Nintendo
    {"id": 2, "name": "N64"},                # Nintendo 64
    {"id": 1, "name": "Mega Drive"},         # Mega Drive / Genesis
    {"id": 21, "name": "PS2"},               # PlayStation 2
    {"id": 4, "name": "GBC"},                # Game Boy Color
    {"id": 12, "name": "PS1"},               # PlayStation 1
    {"id": 18, "name": "NDS"},               # Nintendo DS
    {"id": 24, "name": "GameCube"},          # Nintendo GameCube
    {"id": 6, "name": "Game Boy"},           # Game Boy Clássico
    {"id": 28, "name": "Wii"},               # Nintendo Wii
    {"id": 41, "name": "PSP"},               # PlayStation Portable
    {"id": 39, "name": "Sega Saturn"},       # Sega Saturn
    {"id": 33, "name": "Master System"},     # Sega Master System
]

class Command(BaseCommand):
    help = "Popula o catálogo completo do RetroAchievements de forma segura e resiliente"

    def handle(self, *args, **options):
        ra_service = RetroAchievementsService()
        if not ra_service.is_configured():
            self.stdout.write(self.style.ERROR("RA_USER e RA_API_KEY ausentes no .env"))
            return

        total_saved_global = 0
        total_skipped_global = 0

        for console in RA_CONSOLES:
            self.stdout.write(f"\n🎮 Importando catálogo completo de {console['name']} (ID: {console['id']})...")
            
            # None traz a lista completa de jogos do console
            raw_games = ra_service.get_console_games(console["id"], limit=None)

            if not raw_games:
                self.stdout.write(self.style.WARNING(f"Nenhum jogo retornado para {console['name']}."))
                continue

            saved = 0
            skipped = 0

            for item in raw_games:
                raw_id = item.get("ID")
                if not raw_id:
                    continue

                # Pula chamadas redundantes se o jogo já existe no banco
                if Game.objects.filter(ra_id=raw_id).exists():
                    skipped += 1
                    continue

                try:
                    data = ra_service.get_game_details(fallback_id=raw_id, fallback_item=item)
                    if not data or not data.get("ra_id"):
                        continue

                    slug = f"{slugify(data['title'])[:140]}-{slugify(console['name'])}"[:190]

                    Game.objects.update_or_create(
                        ra_id=data["ra_id"],
                        defaults={
                            "slug": slug,
                            "title": data["title"][:240],
                            "console_id": data["console_id"] or console["id"],
                            "platform": console["name"],
                            "released_date": data["released_date"],
                            "publisher": data["publisher"],
                            "developer": data["developer"],
                            "genre": data["genre"],
                            "cover_url": data["cover_url"],
                            "title_screen_url": data["title_screen_url"],
                            "ingame_screen_url": data["ingame_screen_url"],
                            "total_players": data["total_players"],
                        }
                    )
                    saved += 1
                    time.sleep(0.15)  # Intervalo de segurança contra bloqueio (429 Too Many Requests)

                except Exception as e:
                    self.stdout.write(self.style.WARNING(f"Erro ao processar ID {raw_id}: {e}"))
                    time.sleep(2)  # Pausa de recuperação em caso de oscilação

            total_saved_global += saved
            total_skipped_global += skipped

            self.stdout.write(self.style.SUCCESS(
                f"✔ {console['name']}: {saved} novos jogos importados | {skipped} já existentes ignorados."
            ))

        self.stdout.write(self.style.SUCCESS(
            f"\n🏁 Processo concluído! Total de {total_saved_global} novos jogos adicionados ({total_skipped_global} existentes mantidos)."
        ))