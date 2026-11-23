#!/usr/bin/env python3
"""Dépose un épisode terminé sur le dataset Hugging Face du studio (privé, créé au premier dépôt), dans <slug>/.
usage : HF_TOKEN=... python3 tools/hf_upload.py episodes/<slug> [--repo soradata/studio-anime]
Variables : HF_DATASET (défaut soradata/studio-anime), HF_PREFIX (sous-dossier facultatif, défaut : racine).

Contenu déposé (pour le futur script de publication) :
  <slug>/<Titre>.mp4                 la vidéo finale (1080x1920, sous-titres incrustés)
  <slug>/meta.json       titre YouTube, description, hashtags, légende TikTok, durée, nom du fichier vidéo
  <slug>/cover.jpg       une image de couverture (milieu de la vidéo)
  <slug>/qa_sheet.jpg    planche de contrôle
Le dossier est remplacé si l'épisode est redéposé (même slug)."""
import datetime, json, os, shutil, subprocess, sys
from huggingface_hub import HfApi

args = [a for a in sys.argv[1:] if not a.startswith("--")]
if not args: sys.exit(__doc__)
ep = os.path.abspath(args[0]); slug = os.path.basename(ep.rstrip("/"))
repo = sys.argv[sys.argv.index("--repo") + 1] if "--repo" in sys.argv else os.environ.get("HF_DATASET") or "soradata/studio-anime"
token = os.environ.get("HF_TOKEN") or sys.exit("HF_TOKEN manquant")
out = os.path.join(ep, "out")
mp4s = sorted(f for f in os.listdir(out) if f.endswith(".mp4")) if os.path.isdir(out) else []
if not mp4s: sys.exit(f"aucune vidéo dans {out} : lance d'abord tools/finish.sh")
video = mp4s[0]; vpath = os.path.join(out, video)

dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", vpath],
                           capture_output=True, text=True).stdout.strip() or 0)
cover = os.path.join(out, "cover.jpg")
if not os.path.exists(cover):  # finish.sh writes a subtitle-free cover; fall back to the video's middle frame
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-ss", f"{dur / 2:.2f}", "-i", vpath, "-frames:v", "1", "-q:v", "2", cover], check=False)

meta = json.load(open(os.path.join(ep, "meta.json"), encoding="utf-8")) if os.path.exists(os.path.join(ep, "meta.json")) else {}
meta.update({
    "slug": slug, "video": video, "cover": "cover.jpg" if os.path.exists(cover) else None,
    "duration_s": round(dur, 2), "width": 1080, "height": 1920, "language": "fr", "channel": "Pourkoipa",
    "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds"),
    "source_repo": os.environ.get("GITHUB_REPOSITORY", ""), "source_commit": os.environ.get("GITHUB_SHA", ""),
    # "ready" = waiting for tools/publish.py; an episode marked "published" in its meta.json (published by hand) stays published
    "status": "published" if meta.get("status") == "published" else "ready",
})
qa = os.path.join(out, "QA.json")    # grave QA defects -> "review": automatic publishing skips it (publish.py --slug still can)
blocking = json.load(open(qa, encoding="utf-8")).get("blocking", []) if os.path.exists(qa) else []
if blocking and meta["status"] != "published":
    meta.update({"status": "review", "review_reasons": blocking})
    print("VIDÉO BLOQUÉE (statut review) : " + " ; ".join(blocking))
stage = os.path.join(out, "_hf"); os.makedirs(stage, exist_ok=True)
for f in os.listdir(stage): os.remove(os.path.join(stage, f))
json.dump(meta, open(os.path.join(stage, "meta.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=1)
for f in [video, "cover.jpg", "qa_sheet.jpg", "QA.md"]:
    src = os.path.join(out, f)
    if os.path.exists(src): shutil.copy2(src, os.path.join(stage, f))

api = HfApi(token=token)
api.create_repo(repo_id=repo, repo_type="dataset", private=True, exist_ok=True)   # premier dépôt : dataset privé créé
prefix = os.environ.get("HF_PREFIX", "").strip("/")
dest = f"{prefix}/{slug}" if prefix else slug
api.upload_folder(repo_id=repo, repo_type="dataset", folder_path=stage, path_in_repo=dest,
                  delete_patterns=["*"], commit_message=f"{slug} ({meta.get('youtube_title', video)})")
print(f"déposé : https://huggingface.co/datasets/{repo}/tree/main/{dest}")
