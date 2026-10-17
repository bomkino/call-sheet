"""Serve the repository for the post templates, with the type system mounted at /type/.

    python3 social/posts/serve.py [path/to/pitchdog-type-system]

Then open http://127.0.0.1:8790/social/posts/posts.html, or run render.mjs.
"""
import http.server
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
TYPE = Path(sys.argv[1] if len(sys.argv) > 1 else REPO.parent / "pitchdog-type-system").resolve()


class Handler(http.server.SimpleHTTPRequestHandler):
    def translate_path(self, path):
        p = path.split("?", 1)[0].split("#", 1)[0]
        root, rest = (TYPE, p[len("/type/"):]) if p.startswith("/type/") else (REPO, p.lstrip("/"))
        return str(root / rest)

    def log_message(self, *args):
        pass


if __name__ == "__main__":
    http.server.ThreadingHTTPServer(("127.0.0.1", 8790), Handler).serve_forever()
