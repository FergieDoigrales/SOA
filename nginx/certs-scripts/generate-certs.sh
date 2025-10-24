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

openssl pkcs12 -export \
  -in $CERTS_DIR/server.crt \
  -inkey $CERTS_DIR/server.key \
  -name wildfly \
  -out $CERTS_DIR/server.p12 \
  -passout pass:fergoeqskey

# truststore WebClient, Wildfly, Payara в PEM
keytool -export -alias wildfly \
  -keystore $CERTS_DIR/server.p12 \
  -storetype PKCS12 \
  -storepass fergoeqskey \
  -rfc \
  -file $CERTS_DIR/server_public.crt

keytool -import -trustcacerts \
  -file $CERTS_DIR/server_public.crt \
  -alias wildfly \
  -keystore $CERTS_DIR/truststore.jks \
  -storepass fergoeqskey \
  -noprompt

tail -f /dev/null