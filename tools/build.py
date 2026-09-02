#!/usr/bin/env python3
"""
Regenerates everything that would otherwise be edited by hand.

  python3 tools/build.py

Reads course.json and rewrites:
  index.html  -- the module ledger rows, and the module count passed to initProgress
  sw.js       -- the offline precache list, and bumps the cache version

Run it after adding or renaming a module. It is idempotent: running it twice
changes nothing except the cache version, which only bumps when the precache
list actually changed.
"""

import json
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent

LEDGER_START = "<!-- ledger:start -->"
LEDGER_END = "<!-- ledger:end -->"
SHELL_START = "// shell:start"
SHELL_END = "// shell:end"

TAGS = {
    "ready": '<span class="tag ready">ready</span>',
    "next": '<span class="tag soon">next</span>',
    "queued": '<span class="tag soon">queued</span>',
}


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def build_ledger(course):
    out = []
    problems = []
    for phase in course["phases"]:
        out.append('      <tr class="phase-head"><td colspan="4">%s</td></tr>' % esc(phase["name"]))
        for m in phase["modules"]:
            status = m.get("status", "queued")
            f = m.get("file")
            if f and not (ROOT / f).exists():
                problems.append("%s points at %s, which does not exist" % (m["id"], f))
                f = None
            if f:
                title = '<a href="%s">%s</a>' % (f, esc(m["title"]))
                row_attr = ' data-module="%s"' % m["id"]
            else:
                if status == "ready":
                    problems.append("%s is marked ready but has no file" % m["id"])
                title = '<span class="locked">%s</span>' % esc(m["title"])
                row_attr = ""
            out.append(
                '      <tr%s>'
                '<td class="idx">%s</td>'
                '<td>%s</td>'
                '<td class="num hide-sm">%s</td>'
                '<td class="num" data-status>%s</td>'
                "</tr>" % (row_attr, m["num"], title, m["hours"], TAGS.get(status, TAGS["queued"]))
            )
    return "\n".join(out), problems


def cacheable_files():
    """Everything the site needs to work offline."""
    keep = []
    for p in sorted(ROOT.rglob("*")):
        if not p.is_file():
            continue
        rel = p.relative_to(ROOT).as_posix()
        if rel.startswith(("tools/", ".git/")):
            continue
        if rel in ("README.md", "CLAUDE.md", "course.json", "sw.js"):
            continue
        if p.suffix.lower() in (".html", ".css", ".js", ".png", ".svg", ".webmanifest", ".woff2"):
            keep.append(rel)
    return ["./", "./manifest.webmanifest"] + ["./" + r for r in keep if r != "manifest.webmanifest"]


def replace_block(text, start, end, body, path):
    pattern = re.compile(re.escape(start) + r".*?" + re.escape(end), re.S)
    if not pattern.search(text):
        sys.exit("error: markers %s ... %s not found in %s" % (start, end, path))
    return pattern.sub(lambda _: start + "\n" + body + "\n" + end, text, count=1)


def main():
    course = json.loads((ROOT / "course.json").read_text())
    total = sum(len(p["modules"]) for p in course["phases"])

    ledger, problems = build_ledger(course)

    index_path = ROOT / "index.html"
    index = index_path.read_text()
    index = replace_block(index, LEDGER_START, LEDGER_END, ledger, "index.html")
    index = re.sub(r"initProgress\(\d+\)", "initProgress(%d)" % total, index)
    index = re.sub(
        r"<span data-count>\d+ of \d+ modules attempted</span>",
        "<span data-count>0 of %d modules attempted</span>" % total,
        index,
    )
    index_path.write_text(index)

    sw_path = ROOT / "sw.js"
    sw = sw_path.read_text()
    files = cacheable_files()
    body = "\n".join("  '%s'," % f for f in files).rstrip(",")
    old_shell = re.search(re.escape(SHELL_START) + r"(.*?)" + re.escape(SHELL_END), sw, re.S).group(1)
    sw_new = replace_block(sw, SHELL_START, SHELL_END, body, "sw.js")

    bumped = False
    if old_shell.strip() != body.strip():
        cur = int(re.search(r"VERSION = 'course-v(\d+)'", sw_new).group(1))
        sw_new = re.sub(r"VERSION = 'course-v\d+'", "VERSION = 'course-v%d'" % (cur + 1), sw_new)
        bumped = True
    sw_path.write_text(sw_new)

    print("ledger:  %d modules across %d phases" % (total, len(course["phases"])))
    print("offline: %d files precached%s" % (len(files), " (version bumped)" if bumped else " (unchanged)"))
    for p in problems:
        print("  warning: %s" % p)
    if problems:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
