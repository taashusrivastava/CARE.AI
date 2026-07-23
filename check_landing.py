import pathlib
p = pathlib.Path('src/pages/Landing.jsx')
c = p.read_text('utf-8')
lines = c.split('\n')
print(f'Total lines: {len(lines)}')
print(f'</div> count: {c.count("</div>")}')
print(f'<div count: {c.count("<div")}')
print(f'</section> count: {c.count("</section>")}')
print(f'<section count: {c.count("<section")}')
print(f'</footer> count: {c.count("</footer>")}')
print(f'Last 3 lines:')
for l in lines[-3:]:
    print(repr(l))
# Check all opening divs have closing
import re
opens = len(re.findall(r'<div[>\s]', c))
closes = c.count('</div>')
print(f'Open <div> tags: {opens}')
print(f'Close </div> tags: {closes}')
print(f'Balanced: {opens == closes}')
