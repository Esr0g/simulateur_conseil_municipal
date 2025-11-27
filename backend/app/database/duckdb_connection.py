import duckdb

class DuckDBConnection:
    def __init__(self, path=':memory'):
        self.path = path
        self.con = None

    def __enter__(self):
        self.con = duckdb.connect(self.path)
        return self.con

    def __exit__(self, exc_type, exc_val, exc_tb):
        if self.con:
            self.con.close()
