#!/usr/bin/env bash
#
# Fabrique le zip à envoyer sur o2switch : ~/Desktop/garageblog.zip
#
# Lancement : `npm run package:o2switch`, depuis la racine du projet.
# Ne fait que fabriquer le zip : l'envoi sur le serveur reste manuel (voir notes/deploiement-o2switch.md).

# S'arrête à la première erreur, sur une variable inconnue, ou si une commande d'un `|` échoue
set -euo pipefail

# Dossier du projet (le parent de scripts/), quel que soit l'endroit d'où on lance le script
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
STANDALONE="$ROOT/.next/standalone"
ZIP="$HOME/Desktop/garageblog.zip"

cd "$ROOT"

# 1. La version en ligne devrait correspondre à un commit : avertit, et demande s'il faut continuer
VERSION="commit $(git rev-parse --short HEAD)"
if [ -n "$(git status --porcelain)" ]; then
  echo "Attention : des changements ne sont pas commités, ils partiront quand même dans le zip." >&2
  git status --short >&2
  # `|| ANSWER=""` : sans terminal pour répondre, la réponse est vide, donc le zip est annulé
  read -r -p "Continuer quand même ? (o/N) " ANSWER || ANSWER=""
  # Seuls « o » ou « O » continuent : Entrée seule, ou toute autre réponse, annule
  if [ "$ANSWER" != "o" ] && [ "$ANSWER" != "O" ]; then
    echo "Zip annulé." >&2
    exit 1
  fi
  VERSION="$VERSION + changements non commités"
fi

# 2. Le build de Next
npm run build

# 3. Les fichiers que Next ne copie pas dans standalone.
#    On vide d'abord l'ancien dossier static, sinon les fichiers des builds précédents s'accumulent.
rm -rf "$STANDALONE/.next/static"
cp -R .next/static "$STANDALONE/.next/static"
mkdir -p "$STANDALONE/public"
cp -R public/. "$STANDALONE/public"

# 4. Aucun fichier de variables ne doit partir sur le serveur (mots de passe, clés)
if [ -n "$(find "$STANDALONE" -maxdepth 3 -name '.env*')" ]; then
  echo "Un fichier .env se trouve dans standalone : zip annulé." >&2
  exit 1
fi

# 5. Le zip, fabriqué depuis l'intérieur de standalone : server.js doit être à sa racine
rm -f "$ZIP"
(cd "$STANDALONE" && zip -qr "$ZIP" .)

echo "Zip prêt : $ZIP ($VERSION)"
