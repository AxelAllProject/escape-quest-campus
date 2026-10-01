#!/bin/bash
# Déploie la branche main sur la VM.
# Usage (sur la VM) : /var/www/escape-quest/deploy/deploy.sh
set -e

cd /var/www/escape-quest
git switch main
git pull

echo "→ API Symfony"
cd api
composer install --no-dev --optimize-autoloader
APP_ENV=prod php bin/console cache:clear

echo "→ Front React"
cd ../front
npm ci
npm run build

echo "→ Nginx"
sudo systemctl reload nginx

echo "Déployé ✔ ($(git log -1 --format='%h %s'))"
