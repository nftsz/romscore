import time
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Game
from core.services import RetroAchievementsService

RA_CONSOLES = [
    {"id": 5, "name": "GBA"},
    {"id": 3, "name": "SNES"},
    {"id": 12, "name": "PS1"},
    {"id": 21, "name": "PS2"},
    {"id": 2, "name": "N64"},
    {"id": 1, "name": "Mega Drive"},
]

class Command(BaseCommand):
    help = "Popula o banco com os clássicos do RetroAchievements via Service"

    def handle(self, *args, **options):
        ra_service = RetroAchievementsService()
        if not ra_service.is_configured():
            self.stdout.write(self.style.ERROR("RA_USER e RA_API_KEY ausentes no .env"))
            return

        for console in RA_CONSOLES:
            self.stdout.write(f"🎮 Ingerindo {console['name']}...")
            raw_games = ra_service.get_console_classics(console["id"], limit=10)

            for item in raw_games:
                data = ra_service.get_game_details(item.get("ID"))
                if not data:
                    continue

                slug = f"{slugify(data['title'])[:140]}-{slugify(console['name'])}"[:190]
                Game.objects.update_or_create(
                    ra_id=data["ra_id"],
                    defaults={
                        "slug": slug,
                        "title": data["title"][:240],
                        "console_id": data["console_id"],
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
                time.sleep(0.1)

            self.stdout.write(self.style.SUCCESS(f"✔ {console['name']} concluído!"))