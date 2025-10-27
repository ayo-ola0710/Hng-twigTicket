#!/usr/bin/env bash
set -euo pipefail

PORT_TO_USE="${PORT:-8080}"

echo "Listen ${PORT_TO_USE}" > /etc/apache2/ports.conf

# Ensure AllowOverride All for the document root so .htaccess works
DOCROOT="${APACHE_DOCUMENT_ROOT:-/var/www/html/public}"
CONF_FILE="/etc/apache2/sites-available/000-default.conf"
if ! grep -q "<Directory ${DOCROOT}>" "$CONF_FILE"; then
  cat >> "$CONF_FILE" <<EOF
<Directory ${DOCROOT}>
    AllowOverride All
    Require all granted
</Directory>
EOF
fi

exec apache2-foreground
