#!/bin/sh
# Wraps design/mockups.html (artifact format, no <html>/<head>) into a standalone page for GitHub Pages.
cd "$(dirname "$0")/design"
{ printf '<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
  sed -n '1,/^<\/style>$/p' mockups.html
  printf '</head>\n<body>\n'
  sed '1,/^<\/style>$/d' mockups.html
  printf '</body>\n</html>\n'; } > index.html
