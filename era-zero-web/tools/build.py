#!/usr/bin/env python3
"""Gera a versão de distribuição do Era Zero (PWA) em dist/.
Uso: python3 tools/build.py [pasta_de_saida]
A mesma pasta é usada pelo GitHub Pages, pelo app de Windows (Electron) e pelo app de Android (Capacitor)."""
import os, sys, shutil, hashlib, json, time
SRC = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.abspath(sys.argv[1]) if len(sys.argv) > 1 else os.path.join(SRC, 'dist')
shutil.rmtree(OUT, ignore_errors=True); os.makedirs(OUT)
for d in ('js', 'assets', 'icons'):
    shutil.copytree(os.path.join(SRC, d), os.path.join(OUT, d))
for f in ('firebase-config.js', 'manifest.webmanifest'):
    shutil.copy(os.path.join(SRC, f), OUT)
page = open(os.path.join(SRC, 'index.html'), encoding='utf-8').read()
i = page.index('<div id="game">')
head_extra, body = page[:i], page[i:]
head = ('<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
        '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
        '<meta name="theme-color" content="#05090d"><meta name="description" content="Sobrevivência em mundo aberto: 8 biomas, vida selvagem, construção e as eras da civilização.">'
        '<link rel="manifest" href="manifest.webmanifest"><link rel="icon" href="icons/icon-32.png"><link rel="apple-touch-icon" href="icons/icon-180.png">'
        '<meta name="apple-mobile-web-app-capable" content="yes"><meta name="mobile-web-app-capable" content="yes">' + head_extra + '</head><body>')
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(head + body + '</body></html>')
files, h = [], hashlib.sha1()
for root, _, names in os.walk(OUT):
    for n in sorted(names):
        p = os.path.join(root, n); rel = os.path.relpath(p, OUT).replace(os.sep, '/')
        h.update(rel.encode()); h.update(open(p, 'rb').read()); files.append(rel)
version = h.hexdigest()[:10]
# núcleo guardado na instalação; músicas e sons entram no cache quando tocam pela primeira vez
core = ['./'] + [f for f in files if not f.startswith(('assets/music/', 'assets/sfx/'))]
sw = open(os.path.join(SRC, 'tools', 'sw.template.js'), encoding='utf-8').read()
sw = sw.replace('%VERSION%', version).replace('%CORE%', json.dumps(core))
open(os.path.join(OUT, 'sw.js'), 'w', encoding='utf-8').write(sw)
json.dump({'version': version, 'built': time.strftime('%Y-%m-%d %H:%M')}, open(os.path.join(OUT, 'version.json'), 'w'))
print('dist pronto:', OUT, '| versão', version, '|', len(files), 'arquivos')
