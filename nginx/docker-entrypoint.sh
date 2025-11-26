#!/bin/sh
set -e

# Valor por defecto, por si alguna vez corres sin BACKEND_HOST
: "${BACKEND_HOST:=backend:8000}"

# Generar /etc/nginx/conf.d/default.conf desde la plantilla
envsubst '${BACKEND_HOST}' \
    < /etc/nginx/conf.d/default.conf.template \
    > /etc/nginx/conf.d/default.conf

exec nginx -g 'daemon off;'
