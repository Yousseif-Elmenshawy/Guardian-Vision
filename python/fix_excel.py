# -*- coding: utf-8 -*-
path = r'D:\Yousseif Elshenawy projects\capstone-project\python\excel_server.py'
with open(path, 'r', encoding='utf-8') as f:
    content = f.read()

# Change /api/health to /api/excel/health
content = content.replace('"/api/health"', '"/api/excel/health"', 1)

with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print('Fixed health endpoint')