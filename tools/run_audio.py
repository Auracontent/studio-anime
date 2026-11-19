#!/usr/bin/env python3
"""Run an episode's audio.py inside its folder with tools/ importable:  python3 tools/run_audio.py episodes/<slug>"""
import os, runpy, sys
ep = os.path.abspath(sys.argv[1]); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
os.chdir(ep); runpy.run_path(os.path.join(ep, "audio.py"), run_name="__main__"); print("stems ok:", ep)
