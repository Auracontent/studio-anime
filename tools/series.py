#!/usr/bin/env python3
"""Series registry (series.json): each « Histoire vraie » can belong to one of the channel's series, and its number is shown
for 2.5 s at the start of the video (« France insolite #6 »), so the viewer sees there are others and a reason to subscribe.

  python3 tools/series.py add <slug> "<series>"   -> registers the episode (idempotent) and prints its number
  python3 tools/series.py show                    -> lists the series and their episodes

Then put in the episode's web/story.js:  export const SERIES = { name: 'France insolite', n: 6 };
"""
import json, sys, pathlib
P = pathlib.Path(__file__).resolve().parent.parent / 'series.json'
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
