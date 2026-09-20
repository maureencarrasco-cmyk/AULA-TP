#!/bin/sh
cd "$(dirname "$0")/.." || exit 1
git config core.hooksPath .githooks
echo "Hooks activos: core.hooksPath=.githooks"
git config --get core.hooksPath
