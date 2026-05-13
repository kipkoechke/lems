#!/usr/bin/env python3
"""
Remove server{} blocks claiming a specific domain from an nginx config file.
Safe to run multiple times (idempotent). Does NOT touch any other blocks.

Usage: python3 fix-nginx-conflict.py <nginx-config-file> <domain>
"""
import sys
import re
import os


def find_server_blocks(content):
    """Return list of (start, end) byte positions for every server{} block."""
    blocks = []
    i = 0
    while i < len(content):
        m = re.search(r'\bserver\s*\{', content[i:])
        if not m:
            break
        start = i + m.start()
        brace_pos = i + m.end() - 1  # opening '{'
        depth = 1
        j = brace_pos + 1
        while j < len(content) and depth > 0:
            if content[j] == '{':
                depth += 1
            elif content[j] == '}':
                depth -= 1
            j += 1
        blocks.append((start, j))
        i = j
    return blocks


def remove_domain_blocks(filepath, domain):
    with open(filepath, 'r') as f:
        content = f.read()

    blocks = find_server_blocks(content)
    # Work backwards so positions stay valid
    new_content = content
    removed = 0
    for start, end in reversed(blocks):
        block = new_content[start:end]
        if re.search(
            r'\bserver_name\b[^;]*\b' + re.escape(domain) + r'\b',
            block,
        ):
            # Also eat any blank line(s) immediately before the block
            trim_start = start
            while trim_start > 0 and new_content[trim_start - 1] in ('\n', '\r', ' ', '\t'):
                trim_start -= 1
            new_content = new_content[:trim_start] + '\n' + new_content[end:]
            removed += 1

    if removed:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"  Removed {removed} server block(s) for '{domain}' from {filepath}")
    else:
        print(f"  No conflicting blocks for '{domain}' in {filepath} — nothing to do.")

    return removed


if __name__ == '__main__':
    if len(sys.argv) != 3:
        print(f"Usage: {sys.argv[0]} <nginx-config-file> <domain>")
        sys.exit(1)
    filepath, domain = sys.argv[1], sys.argv[2]
    if not os.path.exists(filepath):
        print(f"  File not found: {filepath} — skipping.")
        sys.exit(0)
    remove_domain_blocks(filepath, domain)
