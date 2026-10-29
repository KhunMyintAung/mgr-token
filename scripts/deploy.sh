#!/usr/bin/env bash
# Deploy the MGR token page and web wallet to token.maharpos.shop (Singapore VPS).
#
#   npm run deploy
#
# Static files only: they go to /var/www/token-maharpos/releases/<time>, `current` points
# at the newest, and the last 3 releases are kept for rollback. The first deploy also gets
# a Let's Encrypt certificate once the token.maharpos.shop DNS record points here.
# nginx is only reloaded after `nginx -t` passes, so a bad config never takes the POS apps down.
set -euo pipefail

HOST="${HOST:-root@SERVER_IP}"
DOMAIN=token.maharpos.shop
cd "$(dirname "$0")/.."

npm run --silent build:dist
RELEASE=$(date -u +%Y%m%d%H%M%S)
ARCHIVE=$(mktemp -t mgr-XXXX).tar.gz
trap 'rm -f "$ARCHIVE"' EXIT
tar -czf "$ARCHIVE" -C dist .

echo "Uploading release $RELEASE to $HOST…"
scp -q -o BatchMode=yes "$ARCHIVE" "$HOST:/tmp/mgr-$RELEASE.tar.gz"
scp -q -o BatchMode=yes deploy/$DOMAIN.conf "$HOST:/tmp/$DOMAIN.conf"
scp -q -o BatchMode=yes deploy/$DOMAIN.http.conf "$HOST:/tmp/$DOMAIN.http.conf"

ssh -o BatchMode=yes "$HOST" RELEASE="$RELEASE" DOMAIN="$DOMAIN" bash -s <<'REMOTE'
set -euo pipefail
DIR=/var/www/token-maharpos
mkdir -p "$DIR/releases/$RELEASE"
tar -xzf "/tmp/mgr-$RELEASE.tar.gz" -C "$DIR/releases/$RELEASE" && rm "/tmp/mgr-$RELEASE.tar.gz"
chmod -R a+rX "$DIR/releases/$RELEASE"
ln -sfn "releases/$RELEASE" "$DIR/current.new" && mv -T "$DIR/current.new" "$DIR/current"
ls -1dt "$DIR"/releases/* | tail -n +4 | xargs -r rm -rf

AVAIL=/etc/nginx/sites-available/$DOMAIN
install_conf() {
  [ -f "$AVAIL" ] && cp "$AVAIL" "$AVAIL.bak"
  cp "$1" "$AVAIL"
  ln -sfn "$AVAIL" "/etc/nginx/sites-enabled/$DOMAIN"
  if nginx -t 2>/tmp/nginx-test.log; then
    systemctl reload nginx
  else
    cat /tmp/nginx-test.log >&2
    if [ -f "$AVAIL.bak" ]; then mv "$AVAIL.bak" "$AVAIL"; else rm -f "$AVAIL" "/etc/nginx/sites-enabled/$DOMAIN"; fi
    echo "nginx config rejected; previous config restored." >&2
    exit 1
  fi
}

if [ ! -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
  install_conf "/tmp/$DOMAIN.http.conf"
  echo "Requesting a certificate for $DOMAIN…"
  if ! certbot certonly --webroot -w /var/www/html -d "$DOMAIN" --non-interactive --keep-until-expiring >/tmp/certbot.log 2>&1; then
    tail -5 /tmp/certbot.log >&2
    echo "NO_CERT: files are uploaded, but $DOMAIN has no certificate yet." >&2
    echo "Add the DNS record (A $DOMAIN -> this server's IP) and run the deploy again." >&2
    exit 2
  fi
fi
install_conf "/tmp/$DOMAIN.conf"
rm -f "/tmp/$DOMAIN.conf" "/tmp/$DOMAIN.http.conf"
echo "Live: https://$DOMAIN/ (release $RELEASE)"
REMOTE
