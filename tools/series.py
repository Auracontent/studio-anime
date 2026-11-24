#!/usr/bin/env python3
"""Series registry (series.json): each « Histoire vraie » can belong to one of the channel's series. Nothing is shown in the
video: tools/publish.py uses it to add a link to another video of the same series in the YouTube description (chaining).

  python3 tools/series.py add <slug> "<series>"   -> registers the episode (idempotent) and prints its number
  python3 tools/series.py show                    -> lists the series and their episodes

"""
import json, sys, pathlib
P = pathlib.Path(__file__).resolve().parent.parent / 'series.json'
TAGS = {'France insolite': '#FranceInsolite', "La science qu'on peut voir": '#ScienceQuOnPeutVoir', 'Les grandes arnaques': '#GrandesArnaques'}
def load(): return json.loads(P.read_text(encoding='utf-8'))
def main(a):
    S = load()
    if len(a) >= 1 and a[0] == 'show':
        for k, v in S.items(): print(f'{k} ({len(v)}): ' + ', '.join(v))
        return 0
    if len(a) == 3 and a[0] == 'add':
        slug, name = a[1], a[2]
        if name not in S: print(f'unknown series « {name} » (choose: {", ".join(S)})', file=sys.stderr); return 2
        for k, v in S.items():
            if slug in v and k != name: print(f'{slug} is already in « {k} »', file=sys.stderr); return 2
        if slug not in S[name]: S[name].append(slug); P.write_text(json.dumps(S, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
        print(S[name].index(slug) + 1); return 0
    print(__doc__, file=sys.stderr); return 2
if __name__ == '__main__': sys.exit(main(sys.argv[1:]))

def related(slug, stats_path=None):
    """(series name, best other video of the same series from stats.json as {id, title}) or (None, None)."""
    S = load(); name = next((k for k, v in S.items() if slug in v), None)
    if not name: return None, None
    sp = pathlib.Path(stats_path) if stats_path else P.parent / 'stats.json'
    try: vids = json.loads(sp.read_text(encoding='utf-8')).get('videos', [])
    except Exception: return name, None
    mates = [v for v in vids if v.get('slug') in S[name] and v.get('slug') != slug and v.get('id')]
    if not mates: return name, None
    best = max(mates, key=lambda v: v.get('views', 0))
    return name, {'id': best['id'], 'title': best.get('title', '')}
