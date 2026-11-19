"""words.json -> subs.ass : one or two words at a time, Montserrat ExtraBold, white with black outline, centred at 70% height, small pop-in.
usage: python3 tools/subs.py words.json subs.ass"""
import json, re, sys
W = json.load(open(sys.argv[1]))
HOT = re.compile(r"(degr|soixante|quarante|vingt|dix-huit|mille|nîmes|sncf|tac|flambée|siècle|secret|température)", re.I)
def ts(t): h = int(t // 3600); m = int(t % 3600 // 60); s = t % 60; return f"{h}:{m:02d}:{s:05.2f}"
groups, i = [], 0
while i < len(W):
    g = [W[i]]
    clean = lambda w: re.sub(r"[.,…:;!]+$", "", w["w"]).strip("«» ")
    if len(clean(W[i])) <= 3 and i + 1 < len(W) and W[i + 1]["s"] - W[i]["e"] < 0.15 and not re.search(r"[.,…:;!?]$", W[i]["w"]):
        g.append(W[i + 1]); i += 1
    i += 1; groups.append(g)
ev = []
for k, g in enumerate(groups):
    s = g[0]["s"]; e = g[-1]["e"]
    nxt = groups[k + 1][0]["s"] if k + 1 < len(groups) else e + 0.4
    e = min(max(e, s + 0.18), nxt) if nxt - e < 0.35 else e + 0.12
    txt = " ".join(re.sub(r"[,…:;.!]+$", "", w["w"]).replace("«", "").replace("»", "").strip() for w in g).upper()
    col = r"{\c&H2BD8FF&}" if any(HOT.search(w["w"]) for w in g) else ""
    ev.append(f"Dialogue: 0,{ts(s)},{ts(e)},W,,0,0,0,,{{\\fscx80\\fscy80\\t(0,90,\\fscx108\\fscy108)\\t(90,160,\\fscx100\\fscy100)}}{col}{txt}")
head = """[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
WrapStyle: 2

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: W,Montserrat,124,&H00FFFFFF,&H00FFFFFF,&H00251927,&H64000000,-1,0,0,0,100,100,1,0,1,11,5,5,60,60,0,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
"""
open(sys.argv[2], "w").write(head + "\n".join(e.replace(",W,,0,0,0,,", ",W,,0,0,0,,{\\pos(540,1344)}") for e in ev) + "\n")
print(len(ev), "caption events")
