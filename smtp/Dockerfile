FROM alpine:latest

# Installa Postfix, OpenDKIM e dipendenze
RUN apk add --no-cache \
    postfix \
    supervisor \
    rsyslog \
    openssl \
    ca-certificates \
    opendkim \
    opendkim-utils \
    && rm -rf /var/cache/apk/*

# Crea directory necessarie
RUN mkdir -p /var/spool/postfix/private \
    && mkdir -p /var/spool/postfix/public \
    && mkdir -p /var/log/mail \
    && mkdir -p /etc/ssl/private \
    && mkdir -p /etc/ssl/certs \
    && mkdir -p /etc/opendkim/keys/bisiacaria.com

# ... existing code ... 