#!/usr/bin/env python3
"""
Checks every page before commit.

  python3 tools/check.py

Catches the mistakes that actually happen when authoring a module:
  - a mock test answer key that does not match its explanation
  - a data-answer pointing at an option that does not exist
  - two questions sharing a radio group name, so answering one clears the other
  - unbalanced HTML tags
  - an SVG figure with no aria-label, invisible to a screen reader
  - a link to a page that is not there
  - a module file that course.json does not know about

Exit code is non-zero if anything failed, so it can gate a commit.
"""

import pathlib
import re
import sys
import json
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
        "source", "track", "wbr", "path", "rect", "line", "circle", "text", "use",
        "stop", "marker", "polygon", "polyline", "ellipse"}


class TagCheck(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in VOID:
            self.stack.append(tag)

    def handle_endtag(self, tag):
        if tag in VOID:
            return
        if self.stack and self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            while self.stack[-1] != tag:
                self.errors.append("unclosed <%s>" % self.stack.pop())
            self.stack.pop()
        else:
            self.errors.append("stray </%s>" % tag)


def check_page(path):
    fails = []
    rel = path.relative_to(ROOT).as_posix()
    src = path.read_text()

    tc = TagCheck()
    tc.feed(src)
    for e in tc.errors + ["unclosed <%s>" % t for t in tc.stack]:
        fails.append("%s: %s" % (rel, e))

    # mock test integrity
    questions = re.findall(r'data-answer="(\w)"(.*?)</div>\s*</div>', src, re.S)
    names = []
    for i, (answer, body) in enumerate(questions, 1):
        options = re.findall(r'value="(\w)"', body)
        names += re.findall(r'name="(\w+)"', body)[:1]
        if answer not in options:
            fails.append("%s: Q%d answer '%s' is not among options %s" % (rel, i, answer, options))
        why = re.search(r'<div class="why"><b>(\w)\.', body)
        if not why:
            fails.append("%s: Q%d has no explanation" % (rel, i))
        elif why.group(1) != answer:
            fails.append("%s: Q%d key is '%s' but the explanation argues for '%s'"
                         % (rel, i, answer, why.group(1)))
        if len(set(options)) != len(options):
            fails.append("%s: Q%d has duplicate option values" % (rel, i))
    dupes = {n for n in names if names.count(n) > 1}
    for n in sorted(dupes):
        fails.append("%s: radio group '%s' is used by more than one question" % (rel, n))

    # accessibility of figures
    for svg in re.findall(r"<svg\b[^>]*>", src):
        if "aria-label" not in svg and 'role="img"' not in svg:
            fails.append("%s: an <svg> has no aria-label" % rel)

    # local links and assets resolve
    for href in re.findall(r'(?:href|src)="([^"#:]+)"', src):
        if href.startswith(("http", "//", "mailto:")):
            continue
        target = (path.parent / href).resolve()
        if not target.exists():
            fails.append("%s: broken link to %s" % (rel, href))

    return fails, len(questions)


def main():
    fails = []
    pages = sorted(list(ROOT.glob("*.html")) + list(ROOT.glob("modules/*.html")))

    for p in pages:
        f, nq = check_page(p)
        fails += f
        note = " (%d questions)" % nq if nq else ""
        print("  %-44s %s%s" % (p.relative_to(ROOT).as_posix(), "FAIL" if f else "ok", note))

    course = json.loads((ROOT / "course.json").read_text())
    known = {m.get("file") for ph in course["phases"] for m in ph["modules"]}
    for p in sorted(ROOT.glob("modules/*.html")):
        rel = p.relative_to(ROOT).as_posix()
        if rel not in known:
            fails.append("%s exists but is not listed in course.json" % rel)

    print()
    if fails:
        for f in fails:
            print("  FAIL  %s" % f)
        print("\n%d problem(s)." % len(fails))
        return 1
    print("All checks passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
