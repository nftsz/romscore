import os
import requests

RA_BASE_URL = "https://retroachievements.org/API"
RA_MEDIA_BASE = "https://media.retroachievements.org"


class RetroAchievementsService:
    def __init__(self):
        self.user = os.getenv("RA_USER", "")
        self.key = os.getenv("RA_API_KEY", "")

    def is_configured(self):
        return bool(self.user and self.key)

    def get_console_games(self, console_id, limit=30):
        """Busca a lista de jogos oficiais da plataforma no RetroAchievements."""
        url = f"{RA_BASE_URL}/API_GetGameList.php"
        try:
            res = requests.get(
                url,
                params={"z": self.user, "y": self.key, "i": console_id, "f": 1, "h": 0},
                timeout=25
            )
            if res.status_code != 200:
                return []

            games = res.json()
            if not isinstance(games, list):
                return []

            # Apenas ignora entradas internas de teste/hacks não oficiais e protótipos
            valid_games = [
                g for g in games
                if g.get("Title")
                and not g.get("Title").startswith("~")
                and "[Subset" not in g.get("Title")
                and "Prototype" not in g.get("Title")
            ]
            return valid_games[:limit]
        except Exception:
            return []

    def get_game_details(self, fallback_id, fallback_item=None):
        """Puxa os detalhes completos, imagens e métricas reais de jogadores."""
        url = f"{RA_BASE_URL}/API_GetGameExtended.php"
        try:
            res = requests.get(
                url,
                params={"z": self.user, "y": self.key, "i": fallback_id},
                timeout=15
            )
            d = res.json() if res.status_code == 200 else {}
        except Exception:
            d = {}

        game_id = d.get("ID") or fallback_id
        if not game_id:
            return None

        # BoxArt e imagens oficiais
        cover_path = d.get("ImageBoxArt") or d.get("ImageIcon") or (fallback_item.get("ImageIcon") if fallback_item else "")
        title_path = d.get("ImageTitle")
        ingame_path = d.get("ImageIngame")

        title = d.get("Title") or (fallback_item.get("Title") if fallback_item else "")

        return {
            "ra_id": int(game_id),
            "title": title.strip(),
            "console_id": d.get("ConsoleID"),
            "released_date": d.get("Released") or "",
            "publisher": d.get("Publisher") or "",
            "developer": d.get("Developer") or "",
            "genre": d.get("Genre") or "",
            "cover_url": f"{RA_MEDIA_BASE}{cover_path}" if cover_path else None,
            "title_screen_url": f"{RA_MEDIA_BASE}{title_path}" if title_path else None,
            "ingame_screen_url": f"{RA_MEDIA_BASE}{ingame_path}" if ingame_path else None,
            "total_players": int(d.get("NumDistinctPlayers") or 0),
        }