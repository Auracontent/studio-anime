#!/usr/bin/env python3
"""What works on reference channels: public metadata only (titles, views, dates), via the YouTube Data API v3.
usage : YOUTUBE_API_KEY=... python3 tools/trends.py [--out trends.md] [--top 40]
Channels come from tendances.json ({"channels": ["@RicksClips3000", ...], "max_videos": 300}) PLUS channels discovered automatically:
YouTube search (French, last 90 days, most viewed) on the queries of tendances.json "discover" -> the channels that appear most,
excluding ours, in French AND in English (one list of queries per language). Search costs 100 quota units per query
(16 queries = 1,600 of the 10,000 free units/day).
Writes trends.md (ranked table for Claude) + trends.json. Cost: ~2 quota units per 50 videos (10,000 free units/day).
Only titles and numbers are read: no video, script or image is downloaded."""
import datetime, json, os, sys, urllib.parse, urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
KEY = os.environ.get("YOUTUBE_API_KEY") or sys.exit("YOUTUBE_API_KEY missing")
OUT = sys.argv[sys.argv.index("--out") + 1] if "--out" in sys.argv else os.path.join(ROOT, "trends.md")
TOP = int(sys.argv[sys.argv.index("--top") + 1]) if "--top" in sys.argv else 40
CFG = json.load(open(os.path.join(ROOT, "tendances.json"), encoding="utf-8"))

def api(path, **q):
    q["key"] = KEY
    url = f"https://www.googleapis.com/youtube/v3/{path}?" + urllib.parse.urlencode(q)
    try:
        with urllib.request.urlopen(url, timeout=60) as r: return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"YouTube API error {e.code}: {e.read().decode()[:600]}")

def channel(handle):
    q = {"forHandle": handle} if handle.startswith("@") else {"id": handle}
    it = api("channels", part="snippet,contentDetails,statistics", **q).get("items") or []
    if not it: print(f"channel not found: {handle}"); return None
    c = it[0]; return {"id": c["id"], "title": c["snippet"]["title"], "uploads": c["contentDetails"]["relatedPlaylists"]["uploads"],
                       "subs": int(c["statistics"].get("subscriberCount", 0))}

def videos(uploads, limit):
    ids, tok = [], None
    while len(ids) < limit:
        r = api("playlistItems", part="contentDetails", playlistId=uploads, maxResults=50, **({"pageToken": tok} if tok else {}))
        ids += [x["contentDetails"]["videoId"] for x in r.get("items", [])]; tok = r.get("nextPageToken")
        if not tok: break
    out = []
    for i in range(0, len(ids[:limit]), 50):
        r = api("videos", part="snippet,statistics,contentDetails", id=",".join(ids[i:i + 50]))
        out += r.get("items", [])
    return out

def iso_dur(d):  # PT1M5S -> 65
    import re
    m = re.fullmatch(r"P(?:(\d+)D)?T?(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?", d or "")
    if not m: return 0
    D, H, M, S = (int(x or 0) for x in m.groups()); return D * 86400 + H * 3600 + M * 60 + S

now = datetime.datetime.now(datetime.timezone.utc); rows = []

def discover():
    """Channels that publish the same kind of Shorts as us, found by YouTube search (French, recent, most viewed)."""
    D = CFG.get("discover", {})
    since = (now - datetime.timedelta(days=D.get("days", 90))).strftime("%Y-%m-%dT%H:%M:%SZ")
    own = CFG.get("own", "").lstrip("@").lower()
    skip = {c.lower() for c in D.get("exclude", [])}
    out = []
    for L in D.get("langs", []):          # one pass per language: French channels AND English ones (like RicksClips)
        count, names = {}, {}
        for q in L.get("queries", []):
            try:
                r = api("search", part="snippet", q=q, type="video", videoDuration="short", order="viewCount",
                        relevanceLanguage=L.get("lang", "fr"), regionCode=L.get("region", "FR"), publishedAfter=since, maxResults=25)
            except SystemExit as e:
                print(f"search failed for « {q} »: {e}"); continue
            for it in r.get("items", []):
                cid = it["snippet"]["channelId"]; count[cid] = count.get(cid, 0) + 1; names[cid] = it["snippet"]["channelTitle"]
        best = sorted((c for c in count if names[c].lower().replace(" ", "") != own and names[c].lower() not in skip and c not in out),
                      key=lambda c: count[c], reverse=True)[:L.get("max_channels", 6)]
        print(f"discovered ({L.get('lang')}): " + ", ".join(f"{names[c]} ({count[c]})" for c in best))
        out += best
    return out

found = discover()
json.dump({"generated": now.isoformat(timespec="seconds"), "channels": found}, open(os.path.join(os.path.dirname(OUT) or ".", "tendances_auto.json"), "w"), indent=1)
seen = set()
for h in CFG.get("channels", []) + found:
    c = channel(h)
    if not c or c["id"] in seen: continue
    seen.add(c["id"])
    for v in videos(c["uploads"], CFG.get("max_videos", 300) if h in CFG.get("channels", []) else CFG.get("discover", {}).get("max_videos", 100)):
        sn, st = v["snippet"], v.get("statistics", {})
        pub = datetime.datetime.fromisoformat(sn["publishedAt"].replace("Z", "+00:00")); days = max(1.0, (now - pub).total_seconds() / 86400)
        views = int(st.get("viewCount", 0))
        rows.append({"channel": c["title"], "title": sn["title"], "views": views, "likes": int(st.get("likeCount", 0)),
                     "comments": int(st.get("commentCount", 0)), "published": sn["publishedAt"][:10], "days": round(days),
                     "views_per_day": round(views / days), "duration_s": iso_dur(v.get("contentDetails", {}).get("duration")),
                     "url": f"https://www.youtube.com/shorts/{v['id']}"})
rows.sort(key=lambda r: r["views"], reverse=True)
json.dump({"generated": now.isoformat(timespec="seconds"), "videos": rows}, open(OUT.replace(".md", ".json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
fresh = sorted([r for r in rows if r["days"] <= 60], key=lambda r: r["views_per_day"], reverse=True)
def table(rs):
    L = ["| # | Vues | Vues/jour | Durée | Publié | Titre | Chaîne |", "|---|---:|---:|---:|---|---|---|"]
    esc = lambda t: t.replace("|", "/").replace("[", "(").replace("]", ")")
    L += [f"| {i + 1} | {r['views']:,} | {r['views_per_day']:,} | {r['duration_s']} s | {r['published']} | ".replace(",", " ")
          + f"[{esc(r['title'])}]({r['url']}) | {r['channel']} |" for i, r in enumerate(rs)]
    return "\n".join(L)
md = [f"# Tendances (généré le {now:%Y-%m-%d})", "",
      "Données publiques (titres et chiffres) des chaînes de `tendances.json`. Sert à repérer les **thèmes** qui marchent ;",
      "ne jamais reprendre un titre, un script, un personnage ou un visuel. Voir CLAUDE.md, « Idées et scripts ».", "",
      "Chaînes lues : " + ", ".join(sorted({r["channel"] for r in rows})) + ".",
      "Les chaînes anglophones servent à repérer des familles de thèmes et des mécaniques (HPC) ; on raconte en français, avec nos sources,",
      "jamais une traduction ou une adaptation de leurs vidéos.", "",
      f"## Les {TOP} plus vues (tout temps)", "", table(rows[:TOP]), "",
      "## Ce qui monte en ce moment (60 derniers jours, par vues/jour)", "", table(fresh[:25])]
# per channel: its 5 best, so a big channel does not hide the others
for ch_name in sorted({r["channel"] for r in rows}):
    rs = [r for r in rows if r["channel"] == ch_name][:5]
    md += ["", f"### {ch_name} : ses 5 plus vues", "", table(rs)]
open(OUT, "w", encoding="utf-8").write("\n".join(md) + "\n")
print(f"{len(rows)} videos -> {OUT}")
