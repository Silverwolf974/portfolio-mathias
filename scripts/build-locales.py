"""Build static English pages from the French originals (Python standard library).

Run: python scripts/build-locales.py
Update locales/en.json whenever French copy changes. Unknown text fails the build.
"""
import html
import json
import posixpath
import re
from pathlib import Path
from urllib.parse import urlsplit, urlunsplit

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://silverwolf974.github.io/portfolio-mathias/'
PAGES = [Path('index.html'), *sorted(p.relative_to(ROOT) for p in (ROOT / 'projects').glob('*.html'))]
TRANSLATIONS = json.loads((ROOT / 'locales/en.json').read_text(encoding='utf-8'))
TOKEN = re.compile(r'(<!--.*?-->|<script\b.*?</script\s*>|<style\b.*?</style\s*>|<[^>]+>)', re.S | re.I)
ATTR = re.compile(r'\b(href|src|alt|aria-label|content|lang)=("[^"]*"|\x27[^\x27]*\x27)', re.I)


def translate(value):
    decoded = html.unescape(value)
    key = ' '.join(decoded.split())
    if not key:
        return value
    if key not in TRANSLATIONS:
        raise ValueError(f'Missing English translation: {key}')
    before = re.match(r'^\s*', decoded).group()
    after = re.search(r'\s*$', decoded).group()
    return before + html.escape(TRANSLATIONS[key], quote=False) + after


def clean_controls(source):
    return re.sub(r'\s*<!-- locale-controls -->.*?<!-- /locale-controls -->', '', source, flags=re.S)


def controls(source, page, english):
    target = Path('en') / page if english else page
    other = page if english else Path('en') / page
    counterpart = posixpath.relpath(other.as_posix(), target.parent.as_posix())
    label = 'Switch to French' if english else 'Passer en anglais'
    current, alternate = ('EN', 'FR') if english else ('FR', 'EN')
    locale = 'fr' if english else 'en'
    switch = (f'\n      <!-- locale-controls -->\n'
              f'      <a class="language-switch" href="{counterpart}" hreflang="{locale}" lang="{locale}" aria-label="{label}">'
              f'<span aria-hidden="true"><span class="language-current">{current}</span> / <strong>{alternate}</strong></span></a>\n'
              f'      <!-- /locale-controls -->\n')
    source = source.replace('</nav>', switch + '    </nav>', 1)
    alternates = ('\n  <!-- locale-controls -->\n'
                  f'  <link rel="alternate" hreflang="fr" href="{BASE}{page.as_posix()}" />\n'
                  f'  <link rel="alternate" hreflang="en" href="{BASE}en/{page.as_posix()}" />\n'
                  '  <!-- /locale-controls -->\n')
    source = source.replace('</head>', alternates + '</head>', 1)
    return '\n'.join(line.rstrip() for line in source.splitlines()) + '\n'


def english_page(source, page):
    def attr(match):
        name, quoted = match.groups()
        value = html.unescape(quoted[1:-1])
        if name in ('alt', 'aria-label') or (name == 'content' and ' '.join(value.split()) in TRANSLATIONS):
            value = html.unescape(translate(value))
        elif name == 'lang':
            value = 'en'
        elif name in ('href', 'src'):
            url = urlsplit(value)
            if not url.scheme and not url.netloc and url.path:
                original = posixpath.normpath(posixpath.join(page.parent.as_posix(), url.path))
                destination = 'en/' + original if Path(original) in PAGES else original
                value = urlunsplit(('', '', posixpath.relpath(destination, ('en/' + page.parent.as_posix())), url.query, url.fragment))
        elif name == 'content' and value == BASE:
            value = BASE + 'en/'
        return name + '="' + html.escape(value, quote=True) + '"'

    output = []
    for token in TOKEN.split(source):
        if token.startswith(('<!--', '<script', '<style')):
            # Script URLs still need rebasing; JavaScript and CSS bodies stay intact.
            if token.startswith('<script'):
                start, rest = token.split('>', 1)
                token = ATTR.sub(attr, start) + '>' + rest
            output.append(token)
        elif token.startswith('<'):
            output.append(ATTR.sub(attr, token))
        else:
            output.append(translate(token))
    result = ''.join(output)
    if page == Path('index.html'):
        fr = '../assets/cv/CV_Mathias_ALY_BERIL_FR.pdf'
        en = '../assets/cv/CV_Mathias_Aly_Beril_EN.pdf'
        # Primary hero download follows the current language. Both CV buttons remain.
        result = result.replace(fr, en, 1)
    return controls(result, page, True)


def main():
    # Finish every translation before writing any page.
    results = []
    for page in PAGES:
        source = clean_controls((ROOT / page).read_text(encoding='utf-8'))
        results.append((page, controls(source, page, False), english_page(source, page)))
    for page, french, english in results:
        (ROOT / page).write_text(french, encoding='utf-8')
        target = ROOT / 'en' / page
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_text(english, encoding='utf-8')
    print(f'Built {len(results)} English pages with matching French/English switches.')


if __name__ == '__main__':
    main()
