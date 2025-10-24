##!/bin/sh
#
#mkdir -p /certs
#
#openssl req -x509 -nodes -days 365 \
#  -newkey rsa:2048 \
#  -keyout /certs/server.key \
#  -out /certs/server.crt \
#  -subj "/CN=nginx"
#
#openssl pkcs12 -export \
#  -in /certs/server.crt \
#  -inkey /certs/server.key \
#  -name wildfly \
#  -out /certs/server.p12 \
#  -passout pass:fergoeqskey
#
#keytool -importkeystore \
#  -deststoretype JKS \
#  -deststorepass fergoeqskey -destkeypass fergoeqskey -destkeystore /certs/truststore.jks \
#  -srckeystore /certs/server.p12 -srcstoretype PKCS12 -srcstorepass fergoeqskey -alias wildfly -noprompt
#
#exec nginx -g "daemon off;"
#!/bin/sh
CERTS_DIR=/certs
mkdir -p $CERTS_DIR

#NGINX
openssl req -x509 -nodes -days 365 \
  -newkey rsa:2048 \
  -keyout $CERTS_DIR/server.key \
  -out $CERTS_DIR/server.crt \
  -subj "/CN=localhost"

# Создаём PKCS12 для Java-приложений
openssl pkcs12 -export \
  -in $CERTS_DIR/server.crt \
  -inkey $CERTS_DIR/server.key \
  -name wildfly \
  -out $CERTS_DIR/server.p12 \
  -passout pass:fergoeqskey

# WebClient, Wildfly, Payara
keytool -importkeystore \
  -deststoretype JKS \
  -deststorepass fergoeqskey \
  -destkeypass fergoeqskey \
  -destkeystore $CERTS_DIR/truststore.jks \
  -srckeystore $CERTS_DIR/server.p12 \
  -srcstoretype PKCS12 \
  -srcstorepass fergoeqskey \
  -alias wildfly \
  -noprompt

tail -f /dev/null

