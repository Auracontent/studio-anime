#!/usr/bin/env python3
"""Keeps the channel page up to date by itself (YouTube Data API, with our own OAuth token), after each publication:
  - playlists « Commence ici » (the 5 most viewed videos), « Histoires vraies » and one per series (series.json), kept in sync;
  - on each video of a series, a comment « 👉 Une autre histoire de la série … : <title> <link> » (posted once);
  - with --setup (or when they differ): channel description (brand/description.txt), featured video for non-subscribers
    (the most viewed video), and the home sections (Commence ici, then Histoires vraies, then the series);
  - with --banner: uploads brand/Pourkoipa-banniere-2560x1440.jpg as the channel banner.
The related-video link under a Short and pinning a comment are not available in the YouTube API: they stay manual.

usage : YT_CLIENT_ID=... YT_CLIENT_SECRET=... YT_REFRESH_TOKEN=... python3 tools/yt_channel.py [--setup] [--banner] [--dry-run]
The refresh token needs the scope youtube.force-ssl (manage the channel), not only yt-analytics.readonly (see tools/yt_oauth.py).
Never fails the publication: on any error it prints what happened and exits 0. Standard library only."""
import json, os, re, sys, unicodedata, urllib.error, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.join(ROOT, "tools"))
from series import load as load_series, TAGS
DRY, SETUP, BANNER = "--dry-run" in sys.argv, "--setup" in sys.argv, "--banner" in sys.argv
API = "https://www.googleapis.com/youtube/v3/"
START = "Commence ici"
DESC = {START: "Les histoires préférées des curieux, les plus vues en premier. Commence par la première… Pourkoipa ? 🤔",
        "Histoires vraies": "Des faits vrais qui ont l'air faux, vérifiés et racontés en dessin animé. Une nouvelle histoire chaque jour.",
        "France insolite": "Des lieux, des inventions et des personnages français qu'on ne t'a jamais racontés.",
        "La science qu'on peut voir": "Physique, cerveau, nature : des phénomènes étonnants qu'on montre avec un objet.",
        "Les grandes arnaques": "Escroqueries géniales, tricheries et règles qui se retournent contre leurs auteurs."}
COMMENT = "👉 Une autre histoire de la série {name} : {title} https://youtube.com/shorts/{id}"
used = 0   # quota units (10 000 per day by default)

def token():
    cid, sec, rt = (os.environ.get(k) for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))
    if not (cid and sec and rt): print("YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN missing: channel upkeep skipped."); sys.exit(0)
    body = urllib.parse.urlencode({"client_id": cid, "client_secret": sec, "refresh_token": rt, "grant_type": "refresh_token"}).encode()
    with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=body), timeout=60) as r: t = json.load(r)
    if "youtube.force-ssl" not in t.get("scope", "") and "auth/youtube " not in t.get("scope", "") + " ":
        print("The refresh token only reads statistics (scope: %s). Make a new one with the scope youtube.force-ssl "
              "(see tools/yt_oauth.py) and save it as YT_REFRESH_TOKEN: channel upkeep skipped." % t.get("scope")); sys.exit(0)
    return t["access_token"]
AT = None
def call(method, path, q=None, body=None, cost=1, data=None, ctype="application/json"):
    global used
    write = method != "GET"
    if DRY and write: print(f"  [dry-run] {method} {path} {json.dumps(body, ensure_ascii=False)[:160] if body else ''}"); return {}
    url = (path if path.startswith("http") else API + path) + ("?" + urllib.parse.urlencode(q) if q else "")
    raw = data if data is not None else (json.dumps(body).encode() if body is not None else None)
    req = urllib.request.Request(url, data=raw, method=method, headers={"Authorization": f"Bearer {AT}", **({"Content-Type": ctype} if raw else {})})
    with urllib.request.urlopen(req, timeout=120) as r: used += cost; txt = r.read().decode(); return json.loads(txt) if txt else {}
def pages(path, q):
    out, tok = [], None
    while True:
        r = call("GET", path, {**q, "maxResults": 50, **({"pageToken": tok} if tok else {})}); out += r.get("items", []); tok = r.get("nextPageToken")
        if not tok: return out

# ---------- our videos, matched to their episodes ----------
norm = lambda s: re.sub(r"[^a-z0-9]+", " ", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()).strip()
def episodes():
    eps = {}
    for d in sorted(os.listdir(os.path.join(ROOT, "episodes"))):
        mp = os.path.join(ROOT, "episodes", d, "meta.json")
        if d.startswith("_") or not os.path.exists(mp): continue
        m = json.load(open(mp, encoding="utf-8")); fmt = "Histoire vraie"
        np_ = os.path.join(ROOT, "inbox", d, "NOTES.md")
        if os.path.exists(np_):
            f = re.search(r"Format\s*:\s*\**\s*([^\n*]+)", open(np_, encoding="utf-8").read())
            if f and "quotid" in f.group(1).lower(): fmt = "Vie quotidienne"
        for k in ("youtube_title", "title"):
            if m.get(k): eps[norm(m[k])] = {"slug": d, "format": fmt}
    return eps

def main():
    global AT
    AT = token()
    ch = call("GET", "channels", {"part": "contentDetails,brandingSettings", "mine": "true"})["items"][0]
    ids = [x["contentDetails"]["videoId"] for x in pages("playlistItems", {"part": "contentDetails", "playlistId": ch["contentDetails"]["relatedPlaylists"]["uploads"]})]
    vids = []
    for i in range(0, len(ids), 50):
        for v in call("GET", "videos", {"part": "snippet,statistics,status", "id": ",".join(ids[i:i + 50])}).get("items", []):
            if v["status"].get("privacyStatus") != "public": continue
            vids.append({"id": v["id"], "title": v["snippet"]["title"], "pub": v["snippet"]["publishedAt"], "views": int(v["statistics"].get("viewCount", 0))})
    eps, S = episodes(), load_series()
    for v in vids:
        n = norm(v["title"]); e = eps.get(n) or next((i for t, i in eps.items() if t and (t in n or n in t)), None) or {"slug": "", "format": "?"}
        v.update(e); v["series"] = next((k for k, l in S.items() if v["slug"] in l), None)
    vids.sort(key=lambda v: v["pub"])   # oldest first
    print(f"{len(vids)} public videos, {sum(1 for v in vids if v['slug'])} matched to an episode")

    # ---------- playlists ----------
    mine = {p["snippet"]["title"]: p for p in pages("playlists", {"part": "snippet,status", "mine": "true"})}
    def playlist(title):
        if title in mine: return mine[title]["id"]
        print(f"create playlist « {title} »")
        r = call("POST", "playlists", {"part": "snippet,status"}, {"snippet": {"title": title, "description": DESC.get(title, ""), "defaultLanguage": "fr"},
                                                                   "status": {"privacyStatus": "public"}}, cost=50)
        mine[title] = {"id": r.get("id", "DRY-" + title)}; return mine[title]["id"]
    def sync(title, want, exact):
        """want: video ids in display order. exact: also remove extras and fix the order (« Commence ici »); else only add, newest on top."""
        pid = playlist(title); have = [] if pid.startswith("DRY-") else pages("playlistItems", {"part": "snippet", "playlistId": pid})
        cur = [x["snippet"]["resourceId"]["videoId"] for x in have]
        if exact and cur == want: return
        if exact:
            for x in have: print(f"  {title}: remove {x['snippet']['title'][:40]}"); call("DELETE", "playlistItems", {"id": x["id"]}, cost=50)
            todo = list(enumerate(want))
        else:
            todo = [(0, vid) for vid in reversed(want) if vid not in cur][::-1]   # missing ones, inserted on top oldest first -> newest ends on top
        for pos, vid in todo:
            print(f"  {title}: add {next(v['title'][:40] for v in vids if v['id'] == vid)}")
            call("POST", "playlistItems", {"part": "snippet"}, {"snippet": {"playlistId": pid, "position": pos, "resourceId": {"kind": "youtube#video", "videoId": vid}}}, cost=50)
    true = [v for v in vids if v["format"] == "Histoire vraie" and v["slug"]]
    sync(START, [v["id"] for v in sorted(true, key=lambda v: -v["views"])[:5]], exact=True)
    sync("Histoires vraies", [v["id"] for v in true], exact=False)
    for name in S:
        sync(name, [v["id"] for v in true if v["series"] == name], exact=False)

    # ---------- one comment per series video, pointing to the best other video of the same series ----------
    for v in vids:
        if not v["series"]: continue
        mates = [m for m in vids if m["series"] == v["series"] and m["id"] != v["id"]]
        if not mates: continue
        try: th = call("GET", "commentThreads", {"part": "snippet", "videoId": v["id"], "maxResults": 100, "searchTerms": "Une autre histoire de la série"})
        except urllib.error.HTTPError as e: print(f"comments of {v['id']}: unavailable ({e.code})"); continue
        if any(t["snippet"]["topLevelComment"]["snippet"].get("authorChannelId", {}).get("value") == ch["id"] for t in th.get("items", [])): continue
        best = max(mates, key=lambda m: m["views"])
        text = COMMENT.format(name=v["series"], title=best["title"], id=best["id"]) + " " + TAGS.get(v["series"], "")
        print(f"comment on « {v['title'][:40]} »: {text[:90]}")
        try: call("POST", "commentThreads", {"part": "snippet"}, {"snippet": {"videoId": v["id"], "topLevelComment": {"snippet": {"textOriginal": text}}}}, cost=50)
        except urllib.error.HTTPError as e: print(f"  refused ({e.code} {e.read().decode()[:200]})")

    # ---------- channel page: description, featured video, sections ----------
    if SETUP:
        bs = ch["brandingSettings"]; c = bs.setdefault("channel", {}); changed = False
        dp = os.path.join(ROOT, "brand", "description.txt")
        if os.path.exists(dp):
            d = open(dp, encoding="utf-8").read().strip()
            if c.get("description", "").strip() != d: c["description"] = d; changed = True; print("description: updated")
        if true:
            top = max(true, key=lambda v: v["views"])["id"]
            if c.get("unsubscribedTrailer") != top: c["unsubscribedTrailer"] = top; changed = True; print(f"featured video for non-subscribers: {top}")
        if changed:
            try: call("PUT", "channels", {"part": "brandingSettings"}, {"id": ch["id"], "brandingSettings": {"channel": c, **({"image": bs["image"]} if bs.get("image") else {})}}, cost=50)
            except urllib.error.HTTPError as e: print(f"channel settings: refused ({e.code} {e.read().decode()[:200]})")
        secs = call("GET", "channelSections", {"part": "snippet,contentDetails", "mine": "true"}).get("items", [])
        have = {p for s in secs for p in s.get("contentDetails", {}).get("playlists", [])}
        order = [START, "Histoires vraies", *S]
        for i, title in enumerate(order):
            pid = mine.get(title, {}).get("id")
            if not pid or pid in have: continue
            print(f"home section: « {title} »")
            try: call("POST", "channelSections", {"part": "snippet,contentDetails"}, {"snippet": {"type": "singlePlaylist", "position": i}, "contentDetails": {"playlists": [pid]}}, cost=50)
            except urllib.error.HTTPError as e: print(f"  refused ({e.code} {e.read().decode()[:200]})")
    if BANNER:
        bp = os.path.join(ROOT, "brand", "Pourkoipa-banniere-2560x1440.jpg")
        r = call("POST", "https://www.googleapis.com/upload/youtube/v3/channelBanners/insert", {"uploadType": "media"}, data=open(bp, "rb").read(), ctype="image/jpeg", cost=50)
        if r.get("url"):
            bs = call("GET", "channels", {"part": "brandingSettings", "id": ch["id"]})["items"][0]["brandingSettings"]
            bs.setdefault("image", {})["bannerExternalUrl"] = r["url"]
            call("PUT", "channels", {"part": "brandingSettings"}, {"id": ch["id"], "brandingSettings": bs}, cost=50); print("banner: uploaded")
    print(f"done ({used} quota units)")

if __name__ == "__main__":
    try: main()
    except urllib.error.HTTPError as e: print(f"YouTube API error {e.code}: {e.read().decode()[:500]}")
    except Exception as e: print(f"channel upkeep failed: {e!r}")
