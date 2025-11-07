#!/bin/sh
if [ ! -f /certs/server.crt ]; then
  mkdir -p /certs
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /certs/server.key \
    -out /certs/server.crt \
    -subj "/CN=localhost"
  sh /generate-certs.sh
fi

exec nginx -g "daemon off;"
