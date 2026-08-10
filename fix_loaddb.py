import io

path = "server.py"
with io.open(path, "r", encoding="utf-8") as f:
    content = f.read()

# Repair the _load_db function body
old = """def _load_db():
    if DB_FILE.exists():
        try:
return json.loads(DB_FILE.read_text('utf-8'))
        except:
            pass
    return {"users": [], "contacts": [], "medicines": [], "appointments": [], "chat_sessions": [], "chat_messages": [], "family_members": [], "reminders": []}"""

new = """def _load_db():
    if DB_FILE.exists():
        try:
            return json.loads(DB_FILE.read_text('utf-8'))
        except:
            pass
    return {"users": [], "contacts": [], "medicines": [], "appointments": [], "chat_sessions": [], "chat_messages": [], "family_members": [], "reminders": []}"""

assert old in content, "old block not found"
content = content.replace(old, new)

with io.open(path, "w", encoding="utf-8") as f:
    f.write(content)

print("FIXED _load_db indentation")
