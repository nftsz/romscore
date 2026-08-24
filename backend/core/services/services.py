import os
import requests
from django.utils.text import slugify

RA_BASE_URL = "https://retroachievements.org/API"
RA_MEDIA_BASE = "https://media.retroachievements.org"

CANONICAL_KEYWORDS = [
    "pokemon", "mario", "zelda", "metroid", "donkey kong", "chrono",
    "castlevania", "final fantasy", "resident evil", "silent hill",
    "metal gear", "sonic", "god of war", "shadow of the colossus",
    "kingdom hearts", "persona", "mega man", "crash bandicoot",
    "spyro", "streets of rage", "banjo", "star fox", "earthbound"
]

class RetroAchievementsService:
    def __init__(self):
        self.user = os.getenv("RA_USER", "")
        self.key = os.getenv("RA_API_KEY", "")

    def is_configured(self):
        return bool(self.user and self.key)

    def get_console_classics(self, console_id, limit=10):
        """Busca a lista do console e filtra apenas os clássicos canônicos."""
        url = f"{RA_BASE_URL}/API_GetGameList.php"
        res = requests.get(
            url,
            params={"z": self.user, "y": self.key, "i": console_id, "f": 1, "h": 0},
            timeout=20
        )
        if res.status_code != 200:
            return []

        games = res.json()
        if not isinstance(games, list):
            return []

        filtered = [
            g for g in games
            if g.get("Title")
            and not g.get("Title").startswith("~")
            and "[Subset" not in g.get("Title")
            and "Homebrew" not in g.get("Title")
            and "Prototype" not in g.get("Title")
            and any(kw in g.get("Title").lower() for kw in CANONICAL_KEYWORDS)
        ]
        return filtered[:limit]

    def get_game_details(self, game_id):
        """Busca os metadados completos e links de imagem de um jogo específico."""
        url = f"{RA_BASE_URL}/API_GetGame.php"
        res = requests.get(
            url,
            params={"z": self.user, "y": self.key, "i": game_id},
            timeout=15
        )
        if res.status_code != 200:
            return None

        d = res.json()
        cover_path = d.get("ImageBoxArt") or d.get("ImageIcon")
        title_path = d.get("ImageTitle")
        ingame_path = d.get("ImageIngame")

        return {
            "ra_id": d.get("ID"),
            "title": d.get("Title", "").strip(),
            "console_id": d.get("ConsoleID"),
            "released_date": d.get("Released") or "",
            "publisher": d.get("Publisher") or "",
            "developer": d.get("Developer") or "",
            "genre": d.get("Genre") or "",
            "cover_url": f"{RA_MEDIA_BASE}{cover_path}" if cover_path else None,
            "title_screen_url": f"{RA_MEDIA_BASE}{title_path}" if title_path else None,
            "ingame_screen_url": f"{RA_MEDIA_BASE}{ingame_path}" if ingame_path else None,
            "total_players": int(d.get("NumDistinctPlayersCasual") or d.get("NumDistinctPlayers") or 0),
        }