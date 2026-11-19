#!/usr/bin/env python3
"""Publish finished videos from the Hugging Face dataset to YouTube and TikTok through the Zernio API.

usage:
  python3 tools/publish.py                    # publish the oldest video with status "ready" (one per run)
  python3 tools/publish.py --slug <slug>      # publish this one (even if already published: use --force)
  python3 tools/publish.py --dry-run          # show what would be sent, send nothing
  python3 tools/publish.py --list-accounts    # print the Zernio account ids (to fill the secrets)

env:
  ZERNIO_API_KEY                         Zernio API key (Bearer)
  ZERNIO_YOUTUBE_ACCOUNT_ID              accountId of the YouTube channel in Zernio (empty: skip YouTube)
  ZERNIO_TIKTOK_ACCOUNT_ID               accountId of the TikTok account in Zernio (empty: skip TikTok)
  HF_TOKEN, HF_DATASET                   dataset with one <slug>/ folder per video (default soradata/studio-anime)
  PUBLISH_AI_LABEL=1                     disclose AI-generated content (YouTube synthetic media, TikTok AI label). Default on.
  TIKTOK_PRIVACY=PUBLIC_TO_EVERYONE      TikTok privacy level
  YOUTUBE_VISIBILITY=public              YouTube visibility (public / unlisted / private)

Each platform is a separate Zernio post (its own caption). After success, <slug>/meta.json on Hugging Face gets
status "published", published_at and the Zernio post ids, so the video is never published twice."""
import datetime, json, os, sys, tempfile, urllib.error, urllib.request

API = os.environ.get("ZERNIO_API_BASE", "https://zernio.com/api").rstrip("/")
args = sys.argv[1:]
flag = lambda f: f in args
opt = lambda f: args[args.index(f) + 1] if f in args and args.index(f) + 1 < len(args) else None
DRY = flag("--dry-run") or os.environ.get("DRY_RUN", "") in ("1", "true")
KEY = os.environ.get("ZERNIO_API_KEY", "")
if not KEY and not DRY: sys.exit("ZERNIO_API_KEY missing")

class ZernioError(Exception): pass

def z(method, path, body=None, raw=None, url=None, ctype="application/json"):
    """Call Zernio (or PUT raw bytes to a presigned URL)."""
    u = url or f"{API}{path}"
    data = raw if raw is not None else (json.dumps(body).encode() if body is not None else None)
    h = {"Content-Type": ctype} if data is not None else {}
    if not url: h["Authorization"] = f"Bearer {KEY}"
    req = urllib.request.Request(u, data=data, method=method, headers=h)
    try:
        with urllib.request.urlopen(req, timeout=600) as r:
            txt = r.read().decode() or "{}"
            out = json.loads(txt) if txt.strip().startswith(("{", "[")) else {}
            if getattr(r, "status", 200) == 207:   # partial / queued: treated as a failure (as in Auracontent/auracontent)
                raise ZernioError(f"Zernio {method} {path} -> 207 (partial or queued): {txt[:800]}")
            return out
    except urllib.error.HTTPError as e:
        body = e.read().decode()[:800]
        if e.code == 409 and path == "/v1/posts":   # duplicate: already published, counted as done
            print(f"Zernio 409: duplicate, treated as already published. {body}"); return {"post": {"status": "duplicate"}}
        raise ZernioError(f"Zernio {method} {path or 'upload'} -> {e.code}: {body}")

if flag("--list-accounts"):
    try: res = z("GET", "/v1/accounts")
    except ZernioError as e: sys.exit(str(e))
    accts = res.get("accounts", res if isinstance(res, list) else [])
    for a in accts:
        print(f"{a.get('platform', '?'):10} {a.get('_id') or a.get('id')}  {a.get('username') or a.get('displayName') or a.get('name', '')}")
    if not accts: print(json.dumps(res, indent=1)[:2000])
    sys.exit(0)

from huggingface_hub import HfApi, hf_hub_download
REPO = os.environ.get("HF_DATASET") or "soradata/studio-anime"
hf = HfApi(token=os.environ.get("HF_TOKEN"))

def metas():
    out = []
    for e in hf.list_repo_tree(REPO, repo_type="dataset"):
        if getattr(e, "type", "") == "directory" or e.__class__.__name__ == "RepoFolder":
            try:
                p = hf_hub_download(REPO, f"{e.path}/meta.json", repo_type="dataset", token=hf.token, force_download=True)
                out.append(json.load(open(p, encoding="utf-8")))
            except Exception as ex:
                print(f"skip {e.path}: {ex}")
    return out

M = metas()
slug = opt("--slug")
if slug:
    pick = next((m for m in M if m.get("slug") == slug), None) or sys.exit(f"{slug} not found in {REPO}")
    if pick.get("status") == "published" and not flag("--force"): sys.exit(f"{slug} already published (use --force)")
else:
    ready = sorted((m for m in M if m.get("status") == "ready"), key=lambda m: m.get("created_at", ""))
    if not ready: print("Nothing to publish: no video with status 'ready'."); sys.exit(0)
    pick = ready[0]
slug = pick["slug"]; print(f"Publishing {slug}: {pick.get('youtube_title', pick.get('title'))}")

def caption_youtube(m):
    tags = " ".join(m.get("hashtags", []))
    return (m.get("description", "") + ("\n\n" + tags if tags else "")).strip()

YT_ID = os.environ.get("ZERNIO_YOUTUBE_ACCOUNT_ID", "").strip()
TT_ID = os.environ.get("ZERNIO_TIKTOK_ACCOUNT_ID", "").strip()
AI = os.environ.get("PUBLISH_AI_LABEL", "1") not in ("0", "false", "no")
yt_title = (pick.get("youtube_title") or pick.get("title") or slug)[:100]
posts = []
if YT_ID:
    posts.append(("youtube", {
        "content": caption_youtube(pick),
        "tags": [h.lstrip("#") for h in pick.get("hashtags", []) if h.lstrip("#") != "shorts"][:15],
        "platforms": [{"platform": "youtube", "accountId": YT_ID, "platformSpecificData": {
            "title": yt_title, "visibility": os.environ.get("YOUTUBE_VISIBILITY", "public"),
            "madeForKids": False, "categoryId": "27", "containsSyntheticMedia": AI}}],
        "youtubeSettings": {"title": yt_title, "privacy_status": os.environ.get("YOUTUBE_VISIBILITY", "public").upper()},
        "publishNow": True}))
if TT_ID:
    posts.append(("tiktok", {
        "content": pick.get("tiktok") or caption_youtube(pick),
        "platforms": [{"platform": "tiktok", "accountId": TT_ID, "platformSpecificData": {"tiktokSettings": {
            "privacy_level": os.environ.get("TIKTOK_PRIVACY", "PUBLIC_TO_EVERYONE"), "allow_comment": True,
            "allow_duet": True, "allow_stitch": True, "content_preview_confirmed": True,
            "express_consent_given": True, "video_made_with_ai": AI}}}],
        "publishNow": True}))
    posts[-1][1]["tiktokSettings"] = posts[-1][1]["platforms"][0]["platformSpecificData"]["tiktokSettings"]   # top level too (proven in production)
if not posts: sys.exit("No account id set (ZERNIO_YOUTUBE_ACCOUNT_ID / ZERNIO_TIKTOK_ACCOUNT_ID): nothing to do.")

if DRY:
    print("DRY RUN: nothing uploaded or published.")
    for name, b in posts:
        b = json.loads(json.dumps(b)); b["mediaItems"] = [{"type": "video", "url": f"<upload of {pick.get('video')}>", "thumbnail": "<upload of cover.jpg>"}]
        print(f"--- {name}\n" + json.dumps(b, ensure_ascii=False, indent=1))
    sys.exit(0)

def upload(path_in_repo, ctype):
    local = hf_hub_download(REPO, path_in_repo, repo_type="dataset", token=hf.token)
    name = os.path.basename(path_in_repo)
    pre = z("POST", "/v1/media/presign", {"filename": name, "contentType": ctype})
    z("PUT", "", raw=open(local, "rb").read(), url=pre["uploadUrl"], ctype=ctype)
    print(f"uploaded {name} -> {pre['publicUrl']}")
    return pre["publicUrl"]

try:
    video_url = upload(f"{slug}/{pick['video']}", "video/mp4")
except ZernioError as e: sys.exit(str(e))
media = {"type": "video", "url": video_url}
if pick.get("cover"):
    try: media["thumbnail"] = upload(f"{slug}/{pick['cover']}", "image/jpeg")
    except Exception as e: print(f"cover skipped: {e}")

def save(m, note):
    with tempfile.NamedTemporaryFile("w", suffix=".json", delete=False, encoding="utf-8") as f:
        json.dump(m, f, ensure_ascii=False, indent=1); tmp = f.name
    hf.upload_file(path_or_fileobj=tmp, path_in_repo=f"{slug}/meta.json", repo_id=REPO, repo_type="dataset",
                   commit_message=f"{slug}: {note}")

done = dict(pick.get("published", {})); failed = []
import time
DELAY = int(os.environ.get("DELAY_BETWEEN_PLATFORMS", "15"))
first = True
for name, body in posts:
    if name in done and not flag("--force"): print(f"{name}: already published, skipped"); continue
    if not first: print(f"pause {DELAY}s between platforms"); time.sleep(DELAY)
    first = False
    body["mediaItems"] = [media] if name == "youtube" else [{"type": "video", "url": video_url}]
    try:
        res = z("POST", "/v1/posts", body)
    except ZernioError as e:
        print(f"{name}: FAILED {e}")
        if name != "tiktok": failed.append(name); continue
        try:   # TikTok servers busy: send it as a draft to the TikTok inbox instead (as in Auracontent/auracontent)
            time.sleep(10)
            for k in (body["tiktokSettings"], body["platforms"][0]["platformSpecificData"]["tiktokSettings"]): k["draft"] = True
            res = z("POST", "/v1/posts", body); print("tiktok: sent as a DRAFT (finish it in the TikTok app inbox)")
        except ZernioError as e2:
            print(f"tiktok draft: FAILED {e2}"); failed.append(name); continue
    post = res.get("post", res)
    done[name] = {"post_id": post.get("_id") or post.get("id"), "status": (post.get("platforms") or [{}])[0].get("status", post.get("status")) if isinstance(post.get("platforms"), list) else post.get("status"),
                  "draft": bool(body.get("tiktokSettings", {}).get("draft")),
                  "at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")}
    print(f"{name}: {done[name]}")
    pick["published"] = done; save(pick, f"published on {name}")   # saved after each platform: a retry never re-posts it

if failed:
    sys.exit(f"{slug}: failed on {', '.join(failed)} (status stays 'ready'; the next run retries only those)")
pick.update({"status": "published", "published_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")})
save(pick, f"published ({', '.join(done)})")
print(f"{slug}: marked as published on {REPO}")
