#!/usr/bin/env python3
"""What works on OUR channel, so the idea generator learns from real results (not only from other channels).
usage : YOUTUBE_API_KEY=... python3 tools/mystats.py [--out stats.md]
        + optional, for retention and subscribers per video (YouTube Analytics API, private data of our own channel):
          YT_CLIENT_ID, YT_CLIENT_SECRET, YT_REFRESH_TOKEN   (get the refresh token once with tools/yt_oauth.py)
Channel: "own" in tendances.json (default "@Pourkoipa").
Writes stats.md (for Claude: ranking, what works, what does not, by format) + stats.json.
Each video is matched to its episode (episodes/<slug>/meta.json youtube_title) to read its format and diversity line
(inbox/<slug>/NOTES.md). Videos younger than 48 h are listed apart: too early to judge."""
import datetime, json, os, re, statistics, sys, unicodedata, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = os.environ.get("YOUTUBE_API_KEY") or sys.exit("YOUTUBE_API_KEY missing")
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else os.path.join(ROOT, "stats.md")
CFG = json.load(open(os.path.join(ROOT, "tendances.json"), encoding="utf-8"))
OWN = CFG.get("own", "@Pourkoipa")
NOW = datetime.datetime.now(datetime.timezone.utc)

def get(url):
    try:
        with urllib.request.urlopen(url, timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"API error {e.code}: {e.read().decode()[:600]}")
def api(path, **q):
    q["key"] = KEY; return get(f"https://www.googleapis.com/youtube/v3/{path}?" + urllib.parse.urlencode(q))

# ---------- public numbers (Data API: views, likes, comments) ----------
q = {"forHandle": OWN} if OWN.startswith("@") else {"id": OWN}
ch = (api("channels", part="snippet,contentDetails,statistics", **q).get("items") or [None])[0] or sys.exit(f"channel not found: {OWN}")
uploads, subs = ch["contentDetails"]["relatedPlaylists"]["uploads"], int(ch["statistics"].get("subscriberCount", 0))
ids, tok = [], None
while len(ids) < 300:
    r = api("playlistItems", part="contentDetails", playlistId=uploads, maxResults=50, **({"pageToken": tok} if tok else {}))
    ids += [x["contentDetails"]["videoId"] for x in r.get("items", [])]; tok = r.get("nextPageToken")
    if not tok: break
vids = []
for i in range(0, len(ids), 50):
    for v in api("videos", part="snippet,statistics,contentDetails", id=",".join(ids[i:i + 50])).get("items", []):
        st, pub = v["statistics"], datetime.datetime.fromisoformat(v["snippet"]["publishedAt"].replace("Z", "+00:00"))
        vids.append({"id": v["id"], "title": v["snippet"]["title"], "published": pub.date().isoformat(), "age_h": round((NOW - pub).total_seconds() / 3600, 1),
                     "views": int(st.get("viewCount", 0)), "likes": int(st.get("likeCount", 0)), "comments": int(st.get("commentCount", 0))})

# ---------- private numbers (Analytics API, optional): retention and subscribers gained per video ----------
ana = False
cid, csec, rtok = (os.environ.get(k) for k in ("YT_CLIENT_ID", "YT_CLIENT_SECRET", "YT_REFRESH_TOKEN"))
if cid and csec and rtok:
    try:
        body = urllib.parse.urlencode({"client_id": cid, "client_secret": csec, "refresh_token": rtok, "grant_type": "refresh_token"}).encode()
        with urllib.request.urlopen(urllib.request.Request("https://oauth2.googleapis.com/token", data=body), timeout=60) as r: at = json.load(r)["access_token"]
        url = "https://youtubeanalytics.googleapis.com/v2/reports?" + urllib.parse.urlencode({"ids": "channel==MINE", "startDate": "2020-01-01", "endDate": NOW.date().isoformat(),
              "metrics": "views,averageViewDuration,averageViewPercentage,subscribersGained", "dimensions": "video", "sort": "-views", "maxResults": 200})
        with urllib.request.urlopen(urllib.request.Request(url, headers={"Authorization": f"Bearer {at}"}), timeout=60) as r: rep = json.load(r)
        cols = [c["name"] for c in rep.get("columnHeaders", [])]
        by = {row[0]: dict(zip(cols, row)) for row in rep.get("rows", [])}
        for v in vids:
            a = by.get(v["id"])
            if a: v.update(avg_pct=round(a["averageViewPercentage"], 1), avg_s=round(a["averageViewDuration"]), subs=int(a["subscribersGained"]))
        ana = True
    except Exception as e:   # never block the idea generator on analytics
        print(f"Analytics API unavailable ({e}): public numbers only")

# ---------- match each video to its episode: format + diversity line ----------
norm = lambda s: re.sub(r"[^a-z0-9]+", " ", unicodedata.normalize("NFKD", s.lower()).encode("ascii", "ignore").decode()).strip()
eps = {}
for d in sorted(os.listdir(os.path.join(ROOT, "episodes"))):
    mp = os.path.join(ROOT, "episodes", d, "meta.json")
    if d.startswith("_") or not os.path.exists(mp): continue
    m = json.load(open(mp, encoding="utf-8")); info = {"slug": d, "format": "Histoire vraie", "diversite": ""}
    np_ = os.path.join(ROOT, "inbox", d, "NOTES.md")
    if os.path.exists(np_):
        t = open(np_, encoding="utf-8").read()
        f = re.search(r"Format\s*:\s*\**\s*([^\n*]+)", t); dv = re.search(r"Diversit\w*\s*:\s*([^\n]+)", t)
        if f: info["format"] = "Vie quotidienne" if "quotid" in f.group(1).lower() else "Histoire vraie"
        if dv: info["diversite"] = dv.group(1).strip()[:110]
    for k in ("youtube_title", "title"):
        if m.get(k): eps[norm(m[k])] = info
for v in vids:
    n = norm(v["title"]); e = eps.get(n) or next((i for t, i in eps.items() if t and (t in n or n in t)), None)
    v.update(e or {"slug": "", "format": "?", "diversite": ""})

# ---------- ranking: views per video against the channel median (only videos older than 48 h are judged) ----------
old = [v for v in vids if v["age_h"] >= 48]; young = [v for v in vids if v["age_h"] < 48]
med = statistics.median([v["views"] for v in old]) if old else 0
for v in vids:
    v["x_median"] = round(v["views"] / med, 2) if med else None
    v["eng_pct"] = round(100 * (v["likes"] + v["comments"]) / v["views"], 1) if v["views"] else 0
old.sort(key=lambda v: (v.get("subs", 0), v["views"]), reverse=True) if ana else old.sort(key=lambda v: v["views"], reverse=True)

def row(v):
    extra = f" | {v.get('avg_pct', '–')} % | {v.get('subs', '–')}" if ana else ""
    return f"| {v['title'][:60]} | {v['format']} | {v['views']} | {v['x_median'] or '–'}× | {v['eng_pct']} %{extra} | {v['diversite'][:70]} |"
head = "| Vidéo | Format | Vues | × médiane | J'aime+comm. |" + (" % regardé | Abonnés gagnés |" if ana else "") + " Diversité (NOTES.md) |"
sep = "|" + "---|" * (head.count("|") - 1)
L = [f"# Nos chiffres (@{OWN.lstrip('@')}) — {NOW.date().isoformat()}", "",
     f"{subs} abonnés, {len(vids)} vidéos, médiane {int(med)} vues (vidéos de plus de 48 h)." +
     ("" if ana else " Rétention et abonnés par vidéo indisponibles (secrets YT_CLIENT_ID / YT_CLIENT_SECRET / YT_REFRESH_TOKEN absents)."), "",
     "Classement " + ("par abonnés gagnés puis vues" if ana else "par vues") + " (le haut = ce qu'il faut refaire, sous un autre angle ; le bas = ce qu'il faut éviter) :", "",
     head, sep, *[row(v) for v in old]]
if young: L += ["", "Trop récentes pour juger (moins de 48 h) :", "", *[f"- {v['title'][:70]} : {v['views']} vues en {v['age_h']} h" for v in young]]
for fmt in ("Histoire vraie", "Vie quotidienne"):
    g = [v for v in old if v["format"] == fmt]
    if g: L += ["", f"**{fmt}** : {len(g)} vidéos, médiane {int(statistics.median(x['views'] for x in g))} vues" +
                (f", {round(statistics.mean(x.get('avg_pct', 0) for x in g), 1)} % regardé en moyenne, {sum(x.get('subs', 0) for x in g)} abonnés gagnés" if ana else "")]
open(OUT, "w", encoding="utf-8").write("\n".join(L) + "\n")
json.dump({"date": NOW.isoformat(), "subs": subs, "median": med, "analytics": ana, "videos": vids}, open(os.path.splitext(OUT)[0] + ".json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print(f"wrote {OUT}: {len(vids)} videos, median {int(med)} views, analytics={'yes' if ana else 'no'}")
