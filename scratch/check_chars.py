import sys

with open('client/src/components/personal/PersonalDashboard.tsx', 'rb') as f:
    content = f.read()
    for i, byte in enumerate(content):
        if byte > 127:
            print(f"Non-ASCII byte {hex(byte)} at position {i}")
