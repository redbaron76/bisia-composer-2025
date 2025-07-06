#!/bin/sh

echo "Inizializzazione server SMTP per smtp.bisiacaria.com..."

# Genera certificati SSL per comunicazione interna
if [ ! -f /etc/ssl/certs/mail.crt ]; then
    echo "Generazione certificati SSL per comunicazione interna..."
    mkdir -p /etc/ssl/certs /etc/ssl/private

    openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
        -keyout /etc/ssl/private/mail.key \
        -out /etc/ssl/certs/mail.crt \
        -subj "/C=IT/ST=Italy/L=Trieste/O=Bisiacaria/CN=smtp.bisiacaria.com" \
        -addext "subjectAltName = DNS:smtp.bisiacaria.com,DNS:smtp-transactional"

    chmod 600 /etc/ssl/private/mail.key
    chmod 644 /etc/ssl/certs/mail.crt
    echo "Certificati SSL generati con successo"
fi

# Configura Postfix
postconf -e "myhostname = ${MAIL_HOSTNAME:-smtp.bisiacaria.com}"
postconf -e "mydomain = ${MAIL_DOMAIN:-smtp.bisiacaria.com}"

# Configura OpenDKIM se la chiave privata esiste
if [ -f /etc/opendkim/keys/bisiacaria.com/mail.private ]; then
    echo "Configurazione OpenDKIM..."
    chmod 600 /etc/opendkim/keys/bisiacaria.com/mail.private
    chown opendkim:opendkim /etc/opendkim/keys/bisiacaria.com/mail.private
    echo "OpenDKIM configurato"
else
    echo "ATTENZIONE: Chiave DKIM non trovata. Le email non saranno firmate."
fi

# ... existing code ... 