from rapidfuzz import fuzz
from app.database.database import Database

class CommuneManager:
    
    def search(self, query: str, limit: int = 20):
        query = query.lower()

        results = []

        with Database() as conn:
            rows = conn.execute("""
                SELECT code, nom
                FROM communes
                                """).fetchall()
            
            for r in rows:
                name = r['nom'].lower()
                score = fuzz.WRatio(query, name)
                if score >= 75:
                    results.append((score, dict(r)))

        results.sort(reverse=True, key=lambda x: x[0])
        results = results[:limit]
        return [c for _, c in results]