import os
import json
import urllib.request

api_key = os.environ.get('RENDER_API_KEY')
if not api_key:
    raise SystemExit('RENDER_API_KEY not set')
req = urllib.request.Request(
    'https://api.render.com/v1/services',
    headers={'Authorization': f'Bearer {api_key}', 'Accept': 'application/json'}
)
with urllib.request.urlopen(req) as resp:
    data = json.load(resp)
print(json.dumps(data, indent=2))
