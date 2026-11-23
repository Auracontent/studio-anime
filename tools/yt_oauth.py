#!/usr/bin/env python3
"""One-time helper, run on YOUR computer: gets the refresh token that lets tools/mystats.py read the private numbers of the channel
(% watched, subscribers gained per video) with read-only access (scope yt-analytics.readonly: it can read stats, nothing else).
usage : python3 tools/yt_oauth.py <CLIENT_ID> <CLIENT_SECRET>
  1. A browser page opens: sign in with the Google account that owns the channel, choose the channel, accept.
  2. The script prints the refresh token: save it as the GitHub secret YT_REFRESH_TOKEN (with YT_CLIENT_ID and YT_CLIENT_SECRET).
Standard library only."""
import http.server, json, sys, threading, urllib.parse, urllib.request, webbrowser

if len(sys.argv) < 3: sys.exit(__doc__)
CID, SEC, PORT = sys.argv[1], sys.argv[2], 8765
REDIR = f"http://127.0.0.1:{PORT}/"
url = "https://accounts.google.com/o/oauth2/v2/auth?" + urllib.parse.urlencode({"client_id": CID, "redirect_uri": REDIR, "response_type": "code",
      "scope": "https://www.googleapis.com/auth/yt-analytics.readonly", "access_type": "offline", "prompt": "consent"})
got = {}
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        q = urllib.parse.parse_qs(urllib.parse.urlparse(self.path).query); got.update({k: v[0] for k, v in q.items()})
        self.send_response(200); self.send_header("Content-Type", "text/html; charset=utf-8"); self.end_headers()
        self.wfile.write("<h2>C'est bon, tu peux fermer cette page et revenir au terminal.</h2>".encode())
    def log_message(self, *a): pass
srv = http.server.HTTPServer(("127.0.0.1", PORT), H)
print("Ouvre cette adresse si le navigateur ne s'ouvre pas tout seul :\n" + url + "\n"); webbrowser.open(url)
while "code" not in got and "error" not in got: srv.handle_request()
if "error" in got: sys.exit("Refusé : " + got["error"])
body = urllib.parse.urlencode({"code": got["code"], "client_id": CID, "client_secret": SEC, "redirect_uri": REDIR, "grant_type": "authorization_code"}).encode()
with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=body), timeout=60) as r: tok = json.load(r)
if "refresh_token" not in tok: sys.exit("Pas de refresh token reçu : " + json.dumps(tok))
print("\nYT_REFRESH_TOKEN =\n" + tok["refresh_token"] + "\n\nAjoute-le dans GitHub : Settings > Secrets and variables > Actions > New repository secret.")
