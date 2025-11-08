
#!/bin/sh
CERTS_DIR=/certs
SAN_CONFIG=$CERTS_DIR/san.cnf
KEYSTORE=$CERTS_DIR/truststore.jks
mkdir -p $CERTS_DIR

if [ ! -f $CERTS_DIR/ca.crt ]; then
  openssl genrsa -out $CERTS_DIR/ca.key 4096
  openssl req -x509 -new -nodes -key $CERTS_DIR/ca.key -sha256 -days 3650 \
    -out $CERTS_DIR/ca.crt -subj "/C=RU/ST=Moscow/L=Moscow/O=SOA Lab/OU=Development/CN=LocalRootCA" \
    -extensions v3_ca -config $SAN_CONFIG
fi

#nginx zapros i key
openssl genrsa -out $CERTS_DIR/server.key 2048
openssl req -new -key $CERTS_DIR/server.key -out $CERTS_DIR/server.csr -config $SAN_CONFIG

#podpisali for nginx
openssl x509 -req -in $CERTS_DIR/server.csr -CA $CERTS_DIR/ca.crt -CAkey $CERTS_DIR/ca.key \
  -CAcreateserial -out $CERTS_DIR/server.crt -days 365 -sha256 -extensions v3_req -extfile $SAN_CONFIG

#dalshe jks shlяпа, ne rekommenduyu k prosmotru, u payari ne budet https.
openssl pkcs12 -export -out $CERTS_DIR/server.p12 -inkey $CERTS_DIR/server.key \
  -in $CERTS_DIR/server.crt -name wildfly -passout pass:fergoeqskey

keytool -delete -alias wildfly -keystore "$CERTS_DIR/truststore.jks" -storepass fergoeqskey 2>/dev/null || true
keytool -import -trustcacerts -alias wildfly -file $CERTS_DIR/server.crt \
  -keystore "$CERTS_DIR/truststore.jks" -storepass fergoeqskey -noprompt
tail -f /dev/null

#CERTS_DIR=/certs
#mkdir -p $CERTS_DIR
#
##NGINX
#openssl req -x509 -nodes -days 365 \
#  -newkey rsa:2048 \
#  -keyout $CERTS_DIR/server.key \
#  -out $CERTS_DIR/server.crt \
#  -subj "/CN=localhost"
#
#openssl pkcs12 -export \
#  -in $CERTS_DIR/server.crt \
#  -inkey $CERTS_DIR/server.key \
#  -name wildfly \
#  -out $CERTS_DIR/server.p12 \
#  -passout pass:fergoeqskey
#
## truststore WebClient, Wildfly, Payara в PEM
#keytool -export -alias wildfly \
#  -keystore $CERTS_DIR/server.p12 \
#  -storetype PKCS12 \
#  -storepass fergoeqskey \
#  -rfc \
#  -file $CERTS_DIR/server_public.crt
#
#keytool -import -trustcacerts \
#  -file $CERTS_DIR/server_public.crt \
#  -alias wildfly \
#  -keystore $CERTS_DIR/truststore.jks \
#  -storepass fergoeqskey \
#  -noprompt
#
#tail -f /dev/null