<?php

namespace App\Game;

/**
 * Contenu des épreuves.
 *   Mission 1 « Le campus est hors ligne » : épreuves 1 à 3.
 *   Mission 2 « Wi-Fi fantôme » : épreuves 4 à 6.
 *
 * Les solutions et les indices restent côté serveur : les solutions ne sont jamais
 * renvoyées au front, les indices seulement un par un, à la demande.
 */
final class Challenges
{
    private const CHALLENGES = [
        1 => [
            'id' => 1,
            'mission' => 1,
            'module' => 'messagerie',
            'title' => 'Le mail piégé',
            'type' => 'phishing',
            'instructions' => "Ce mail a été ouvert par un agent juste avant l'incident. Signale les 3 éléments qui prouvent que c'est du phishing, puis valide.",
            'email' => [
                'from' => ['id' => 'expediteur', 'name' => 'Service informatique', 'address' => 'support@campus-univ-securite.com'],
                'to' => ['id' => 'destinataire', 'address' => 'agents@campus.fr'],
                'subject' => ['id' => 'objet', 'text' => 'Mise à jour de votre emploi du temps'],
                'date' => 'Aujourd\'hui, 07:48',
                'body' => [
                    ['id' => 'salutation', 'text' => 'Bonjour,'],
                    ['id' => 'message', 'text' => "Votre emploi du temps du semestre a été modifié. Consultez la nouvelle version en vous connectant à l'ENT avec vos identifiants habituels :"],
                    ['id' => 'lien', 'text' => 'https://ent.campus.fr/emploi-du-temps', 'href' => 'http://ent-campus.login-verif.ru/connexion', 'kind' => 'link'],
                    ['id' => 'signature', 'text' => 'Le service informatique du campus'],
                ],
                'attachment' => ['id' => 'piece_jointe', 'name' => 'Emploi_du_temps_S2.pdf.exe', 'size' => '1,2 Mo'],
            ],
            'expected' => 3,
        ],
        2 => [
            'id' => 2,
            'mission' => 1,
            'module' => 'reseau',
            'title' => 'Le réseau à rebrancher',
            'type' => 'reseau',
            'instructions' => "L'intrus a débranché les 6 services du campus et ouvert une porte dérobée dans le pare-feu. Rebranche chaque service sur son port, décide ce qui reste ouvert sur Internet, puis lance le diagnostic.",
            'services' => [
                ['id' => 'http', 'name' => 'Serveur web', 'protocol' => 'HTTP', 'description' => "Pages de l'ENT, sans chiffrement", 'zone' => 'Les étudiants y accèdent depuis chez eux.'],
                ['id' => 'https', 'name' => 'Serveur web sécurisé', 'protocol' => 'HTTPS', 'description' => "Pages de l'ENT, chiffrées", 'zone' => 'Les étudiants y accèdent depuis chez eux.'],
                ['id' => 'dns', 'name' => 'Résolution de noms', 'protocol' => 'DNS', 'description' => 'Traduit ent.campus.fr en adresse IP', 'zone' => "Le monde entier doit pouvoir trouver ent.campus.fr."],
                ['id' => 'smtp', 'name' => 'Courrier', 'protocol' => 'SMTP', 'description' => 'Reçoit les mails envoyés au campus', 'zone' => "Les mails arrivent de l'extérieur."],
                ['id' => 'ssh', 'name' => 'Administration à distance', 'protocol' => 'SSH', 'description' => 'Connexion des admins aux serveurs', 'zone' => 'Les admins se connectent depuis le réseau interne uniquement.'],
                ['id' => 'mysql', 'name' => 'Base de données des notes', 'protocol' => 'MySQL', 'description' => 'Stocke les notes des étudiants', 'zone' => "Seul le serveur web de l'ENT l'interroge, en interne."],
            ],
            'ports' => [21, 22, 25, 53, 80, 443, 3306, 3389, 8080],
            'intrus' => ['id' => 'porte', 'port' => 4444, 'name' => 'Processus inconnu', 'description' => 'Ouvert à 08:02:30, juste après la coupure. Aucun service du campus ne l’utilise.'],
            'clue' => [
                'file' => '/etc/services',
                'note' => "Fichier en partie effacé par l'attaquant",
                'lines' => [
                    'ftp         21/tcp      # File Transfer',
                    '###         ##/tcp      # Secure Shell',
                    'smtp        ##/tcp      # Mail',
                    'domain      ##/udp      # Domain Name Server',
                    'http        ##/tcp      # World Wide Web',
                    '######     ###/tcp      # HTTP over TLS/SSL',
                    'mysql     ####/tcp',
                    'ms-wbt    3389/tcp      # Bureau à distance Windows',
                    'http-alt  8080/tcp      # Web de test',
                ],
            ],
        ],
        3 => [
            'id' => 3,
            'mission' => 1,
            'module' => 'journaux',
            'title' => "L'enquête dans les journaux",
            'type' => 'enquete',
            'instructions' => "Reconstitue le dossier de l'intrus. Fouille les 3 journaux du serveur, clique sur un indice (IP, heure, compte, clé) pour l'envoyer dans la carte sélectionnée, puis vérifie-la. Attention aux fausses pistes.",
            'files' => [
                [
                    'name' => 'auth.log',
                    'path' => '/var/log/auth.log',
                    'lines' => [
                        '07:30:12 sshd[1980]: Accepted publickey for jdupont from 10.0.4.12 port 50110',
                        '07:30:40 sudo: jdupont : COMMAND=/usr/sbin/useradd -m stagiaire',
                        '07:31:02 passwd[1994]: password changed for stagiaire',
                        '07:41:55 sshd[2051]: Failed password for root from 45.155.205.233 port 55012',
                        '07:41:56 sshd[2051]: Failed password for root from 45.155.205.233 port 55020',
                        '07:41:58 sshd[2052]: Failed password for invalid user oracle from 45.155.205.233 port 55031',
                        '07:42:01 sshd[2052]: Failed password for invalid user test from 45.155.205.233 port 55046',
                        '07:42:03 sshd[2053]: Connection closed by 45.155.205.233 port 55052 [preauth]',
                        '07:52:03 sshd[2211]: Accepted publickey for jdupont from 10.0.4.12 port 51022',
                        '07:52:40 sudo: jdupont : COMMAND=/usr/local/bin/recovery-key --create',
                        '07:52:40 recovery-key: clé K8-22LM créée pour jdupont (10.0.4.12)',
                        '07:58:11 sshd[2299]: Accepted password for mlefevre from 10.0.4.30 port 49711',
                        '08:00:47 sshd[2390]: Failed password for admin from 185.220.101.4 port 40112',
                        '08:00:49 sshd[2390]: Failed password for admin from 185.220.101.4 port 40118',
                        '08:00:52 sshd[2391]: Failed password for admin from 185.220.101.4 port 40125',
                        '08:01:03 sshd[2392]: Accepted password for admin from 185.220.101.4 port 40131',
                        '08:01:15 sudo: admin : COMMAND=/usr/sbin/useradd -m -G sudo maintenance',
                        '08:01:22 passwd[2399]: password changed for maintenance',
                        '08:01:31 sudo: admin : COMMAND=/usr/local/bin/recovery-key --create',
                        '08:01:31 recovery-key: clé X9-4TQZ créée pour admin (185.220.101.4)',
                        '08:01:45 sshd[2405]: Accepted password for maintenance from 185.220.101.4 port 40177',
                        '08:01:58 sshd[2411]: Accepted password for mlefevre from 10.0.4.30 port 49810',
                        '08:02:05 sudo: mlefevre : COMMAND=/usr/local/bin/recovery-key --create',
                        '08:02:05 recovery-key: clé P3-7HXA créée pour mlefevre (10.0.4.30)',
                        '08:02:07 sudo: maintenance : COMMAND=/usr/bin/systemctl stop nginx named sshd',
                    ],
                ],
                [
                    'name' => 'access.log',
                    'path' => '/var/log/nginx/access.log',
                    'lines' => [
                        '07:40:10 45.155.205.233 "GET /wp-login.php" 404',
                        '07:40:11 45.155.205.233 "GET /.env" 404',
                        '07:40:13 45.155.205.233 "GET /phpmyadmin/" 404',
                        '07:48:02 10.0.4.12 "GET /emploi-du-temps" 200',
                        '07:53:04 10.0.4.30 "GET /emploi-du-temps" 200',
                        '07:55:41 185.220.101.4 "GET /admin" 403',
                        '07:56:02 185.220.101.4 "GET /api/users?role=admin" 401',
                        '07:58:30 10.0.4.21 "GET /notes" 200',
                        '08:02:08 10.0.4.21 "GET /notes" 503',
                        '08:02:15 10.0.4.12 "GET /emploi-du-temps" 503',
                    ],
                ],
                [
                    'name' => 'syslog',
                    'path' => '/var/log/syslog',
                    'lines' => [
                        '07:00:01 CRON[1201]: (root) CMD (/usr/local/bin/backup.sh)',
                        '07:45:00 CRON[2101]: (root) CMD (logrotate /etc/logrotate.conf)',
                        '07:53:10 kernel: [UFW BLOCK] SRC=45.155.205.233 DST=10.0.1.10 DPT=3306',
                        '08:02:07 systemd[1]: Stopping nginx.service...',
                        '08:02:08 systemd[1]: Stopped nginx.service.',
                        '08:02:10 systemd[1]: Stopped named.service.',
                        '08:02:12 systemd[1]: Stopped sshd.service.',
                        '08:02:30 kernel: [UFW ALLOW] SRC=185.220.101.4 DST=10.0.1.10 DPT=4444',
                    ],
                ],
            ],
            'fields' => [
                ['id' => 'ip', 'label' => "Adresse IP de l'intrus", 'kind' => 'ip', 'placeholder' => 'ex. 10.0.0.1'],
                ['id' => 'compte', 'label' => 'Compte forcé', 'kind' => 'user', 'placeholder' => 'nom du compte'],
                ['id' => 'heure', 'label' => 'Heure de la première connexion réussie', 'kind' => 'time', 'placeholder' => 'HH:MM:SS'],
                ['id' => 'persistance', 'label' => 'Compte créé pour revenir', 'kind' => 'user', 'placeholder' => 'nom du compte'],
                ['id' => 'cle', 'label' => "Clé de récupération de l'intrus", 'kind' => 'key', 'placeholder' => 'XX-XXXX'],
            ],
        ],
        4 => [
            'id' => 4,
            'mission' => 2,
            'module' => 'ondes',
            'title' => 'Le radar Wi-Fi',
            'type' => 'radar',
            'instructions' => "Ton scanner capte 8 réseaux autour de la bibliothèque. Inspecte chaque point du radar, compare-le à la fiche des bornes officielles et signale les 3 bornes pirates qui se font passer pour le campus.",
            'reference' => [
                'title' => 'Fiche DSI : bornes Wi-Fi officielles',
                'rules' => [
                    'Constructeur : Cisco. Leurs adresses MAC (BSSID) commencent toutes par 00:3A:7D.',
                    '« campus » et « eduroam » : sécurité WPA2-Entreprise (identifiant ENT personnel).',
                    "« campus-invites » : réseau ouvert avec portail d'accueil, géré par la DSI.",
                    'Canaux utilisés : 1, 6 et 11 uniquement.',
                    'Puissance volontairement basse : jamais plus fort que −45 dBm dans la BU.',
                ],
            ],
            'networks' => [
                ['id' => 'ap1', 'ssid' => 'campus', 'bssid' => '00:3A:7D:12:A0:01', 'vendor' => 'Cisco', 'channel' => 1, 'security' => 'WPA2-Entreprise', 'signal' => -58, 'angle' => 28],
                ['id' => 'ap2', 'ssid' => 'eduroam', 'bssid' => '00:3A:7D:12:A0:11', 'vendor' => 'Cisco', 'channel' => 1, 'security' => 'WPA2-Entreprise', 'signal' => -61, 'angle' => 62],
                ['id' => 'ap3', 'ssid' => 'campus', 'bssid' => '24:6F:28:9C:11:E4', 'vendor' => 'Espressif', 'channel' => 6, 'security' => 'Ouvert', 'signal' => -31, 'angle' => 118],
                ['id' => 'ap4', 'ssid' => 'campus-invites', 'bssid' => '00:3A:7D:12:B4:02', 'vendor' => 'Cisco', 'channel' => 11, 'security' => 'Ouvert (portail)', 'signal' => -66, 'angle' => 165],
                ['id' => 'ap5', 'ssid' => 'Livebox-7A2F', 'bssid' => 'A4:3E:51:22:9B:6C', 'vendor' => 'Sagemcom', 'channel' => 11, 'security' => 'WPA2-Personnel', 'signal' => -79, 'angle' => 205],
                ['id' => 'ap6', 'ssid' => 'campus_free', 'bssid' => '24:6F:28:9C:11:E5', 'vendor' => 'Espressif', 'channel' => 6, 'security' => 'Ouvert', 'signal' => -33, 'angle' => 244],
                ['id' => 'ap7', 'ssid' => 'campus', 'bssid' => '00:3A:7D:12:A0:07', 'vendor' => 'Cisco', 'channel' => 6, 'security' => 'WPA2-Entreprise', 'signal' => -63, 'angle' => 290],
                ['id' => 'ap8', 'ssid' => 'eduroam', 'bssid' => 'DE:AD:BE:EF:42:10', 'vendor' => 'Inconnu (adresse locale)', 'channel' => 3, 'security' => 'WPA2-Personnel', 'signal' => -41, 'angle' => 330],
            ],
        ],
        5 => [
            'id' => 5,
            'mission' => 2,
            'module' => 'terrain',
            'title' => 'La chasse au fantôme',
            'type' => 'chasse',
            'instructions' => "La borne pirate est cachée quelque part dans la bibliothèque. Ton analyseur mesure sa puissance dans la salle où tu te trouves, mais sa batterie ne tient que 4 mesures. Déduis la salle, puis intercepte la borne.",
            'building' => 'Bibliothèque universitaire, rez-de-chaussée',
            'probes' => 4,
            'legend' => "≈ −28 dBm : tu es dans la salle de la borne. Chaque salle d'écart (en ligne droite) fait perdre ≈ 11 dBm.",
            'zones' => [
                ['id' => 'accueil', 'name' => 'Accueil', 'col' => 0, 'row' => 0],
                ['id' => 'lecture-a', 'name' => 'Salle de lecture A', 'col' => 1, 'row' => 0],
                ['id' => 'lecture-b', 'name' => 'Salle de lecture B', 'col' => 2, 'row' => 0],
                ['id' => 'fonds', 'name' => 'Fonds anciens', 'col' => 3, 'row' => 0],
                ['id' => 'cafet', 'name' => 'Cafétéria', 'col' => 0, 'row' => 1],
                ['id' => 'numerique', 'name' => 'Espace numérique', 'col' => 1, 'row' => 1],
                ['id' => 'box-1', 'name' => 'Box de travail 1', 'col' => 2, 'row' => 1],
                ['id' => 'box-2', 'name' => 'Box de travail 2', 'col' => 3, 'row' => 1],
                ['id' => 'vestiaires', 'name' => 'Vestiaires', 'col' => 0, 'row' => 2],
                ['id' => 'repro', 'name' => "Repro\u{00AD}graphie", 'col' => 1, 'row' => 2],
                ['id' => 'technique', 'name' => 'Local technique', 'col' => 2, 'row' => 2],
                ['id' => 'bureau', 'name' => "Bureau des biblio\u{00AD}thécaires", 'col' => 3, 'row' => 2],
            ],
            'start' => 'accueil',
        ],
        6 => [
            'id' => 6,
            'mission' => 2,
            'module' => 'trafic',
            'title' => 'La capture du piège',
            'type' => 'capture',
            'instructions' => "La borne pirate a enregistré son propre trafic. Analyse la capture comme dans Wireshark, comprends comment l'attaquant a piégé les étudiants, puis rédige ton rapport et choisis les 3 contre-mesures utiles.",
            'file' => 'borne_fantome.pcap',
            'frames' => [
                ['no' => 1, 'time' => '08:05:02.101', 'src' => '24:6f:28:9c:11:e4', 'dst' => 'Broadcast', 'proto' => '802.11', 'info' => 'Beacon frame, SSID="campus", sécurité : aucune', 'detail' => ['Type : gestion / Beacon', 'Émetteur : 24:6f:28:9c:11:e4 (Espressif)', 'SSID : campus', 'Chiffrement : aucun']],
                ['no' => 2, 'time' => '08:05:40.310', 'src' => '00:3a:7d:12:a0:07', 'dst' => 'Broadcast', 'proto' => '802.11', 'info' => 'Deauthentication, Reason code 7', 'detail' => ['Type : gestion / Deauthentication', 'Émetteur annoncé : 00:3a:7d:12:a0:07 (vraie borne Cisco)', 'Puissance reçue : −31 dBm (comme la borne pirate)', 'Destinataire : tous les appareils connectés']],
                ['no' => 3, 'time' => '08:05:40.312', 'src' => '00:3a:7d:12:a0:07', 'dst' => 'Broadcast', 'proto' => '802.11', 'info' => 'Deauthentication, Reason code 7', 'detail' => ['Type : gestion / Deauthentication', 'Même trame, envoyée en rafale', 'Puissance reçue : −31 dBm']],
                ['no' => 4, 'time' => '08:05:40.315', 'src' => '00:3a:7d:12:a0:07', 'dst' => 'Broadcast', 'proto' => '802.11', 'info' => 'Deauthentication, Reason code 7', 'detail' => ['Type : gestion / Deauthentication', 'Même trame, envoyée en rafale', 'Puissance reçue : −31 dBm']],
                ['no' => 5, 'time' => '08:05:41.020', 'src' => 'iPhone-Lea', 'dst' => 'Broadcast', 'proto' => '802.11', 'info' => 'Probe Request, SSID="campus"', 'detail' => ['Type : gestion / Probe Request', 'Le téléphone cherche le réseau « campus » pour se reconnecter']],
                ['no' => 6, 'time' => '08:05:41.026', 'src' => '24:6f:28:9c:11:e4', 'dst' => 'iPhone-Lea', 'proto' => '802.11', 'info' => 'Association Response, Status : succès', 'detail' => ['Type : gestion / Association Response', 'Le téléphone vient de se connecter à la borne pirate']],
                ['no' => 7, 'time' => '08:05:41.400', 'src' => '192.168.4.1', 'dst' => '192.168.4.23', 'proto' => 'DHCP', 'info' => 'DHCP ACK, IP 192.168.4.23, DNS 192.168.4.1', 'detail' => ['Adresse donnée : 192.168.4.23', 'Serveur DNS imposé : 192.168.4.1 (la borne pirate)', 'Le vrai réseau du campus distribue des adresses en 10.0.0.0/8']],
                ['no' => 8, 'time' => '08:05:42.002', 'src' => '192.168.4.23', 'dst' => '192.168.4.1', 'proto' => 'DNS', 'info' => 'Standard query A ent.campus.fr', 'detail' => ['Question : ent.campus.fr ?']],
                ['no' => 9, 'time' => '08:05:42.004', 'src' => '192.168.4.1', 'dst' => '192.168.4.23', 'proto' => 'DNS', 'info' => 'Standard query response A ent.campus.fr → 192.168.4.1', 'detail' => ['Réponse : ent.campus.fr = 192.168.4.1', 'Le vrai ent.campus.fr est en 10.0.1.10 : cette réponse est fausse']],
                ['no' => 10, 'time' => '08:05:42.120', 'src' => '192.168.4.23', 'dst' => '192.168.4.1', 'proto' => 'HTTP', 'info' => 'GET http://ent.campus.fr/ HTTP/1.1', 'detail' => ['Requête en HTTP, sans chiffrement']],
                ['no' => 11, 'time' => '08:05:42.125', 'src' => '192.168.4.1', 'dst' => '192.168.4.23', 'proto' => 'HTTP', 'info' => 'HTTP/1.1 302 Found, Location: http://campus-login.net/auth', 'detail' => ['Redirection vers un autre domaine : campus-login.net', 'Ce domaine n’appartient pas au campus']],
                ['no' => 12, 'time' => '08:06:15.870', 'src' => '192.168.4.23', 'dst' => '192.168.4.1', 'proto' => 'HTTP', 'info' => 'POST http://campus-login.net/auth  user=lmartin&pass=••••••', 'detail' => ['Formulaire envoyé en clair', 'Identifiant : lmartin', 'Mot de passe : visible par l’attaquant']],
                ['no' => 13, 'time' => '08:06:51.203', 'src' => '192.168.4.31', 'dst' => '192.168.4.1', 'proto' => 'HTTP', 'info' => 'POST http://campus-login.net/auth  user=nbenali&pass=••••••', 'detail' => ['Formulaire envoyé en clair', 'Identifiant : nbenali']],
                ['no' => 14, 'time' => '08:07:09.644', 'src' => '10.0.8.14', 'dst' => '10.0.1.10', 'proto' => 'TLS', 'info' => 'Client Hello, SNI=ent.campus.fr', 'detail' => ['Connexion chiffrée vers le vrai ENT (10.0.1.10)', 'Cet étudiant est resté sur le vrai réseau : il n’est pas piégé']],
                ['no' => 15, 'time' => '08:07:30.118', 'src' => '192.168.4.23', 'dst' => '192.168.4.1', 'proto' => 'HTTP', 'info' => 'POST http://campus-login.net/auth  user=lmartin&pass=••••••', 'detail' => ['Formulaire envoyé en clair', 'Identifiant : lmartin (deuxième essai, même compte)']],
                ['no' => 16, 'time' => '08:08:02.957', 'src' => '192.168.4.40', 'dst' => '192.168.4.1', 'proto' => 'HTTP', 'info' => 'POST http://campus-login.net/auth  user=cdupuis&pass=••••••', 'detail' => ['Formulaire envoyé en clair', 'Identifiant : cdupuis']],
            ],
            'attacks' => [
                ['id' => 'beacon', 'label' => 'Beacon'],
                ['id' => 'deauth', 'label' => 'Deauthentication'],
                ['id' => 'probe', 'label' => 'Probe Request'],
                ['id' => 'association', 'label' => 'Association Response'],
            ],
            'actions' => [
                ['id' => 'mdp', 'label' => 'Réinitialiser les mots de passe des comptes piégés'],
                ['id' => 'ssid', 'label' => 'Renommer le réseau « campus » en « campus-2 »'],
                ['id' => 'pmf', 'label' => 'Activer la protection des trames de gestion (802.11w) sur les bornes'],
                ['id' => 'coupure', 'label' => 'Couper tout le Wi-Fi du campus pendant les partiels'],
                ['id' => 'alerte', 'label' => 'Prévenir les étudiants : ton mot de passe ENT ne se tape que sur https://ent.campus.fr'],
                ['id' => 'parefeu', 'label' => 'Bloquer 192.168.4.1 sur le pare-feu du campus'],
            ],
        ],
    ];

    private const SOLUTIONS = [
        1 => ['expediteur', 'lien', 'piece_jointe'],
        2 => [
            'ports' => ['http' => 80, 'https' => 443, 'dns' => 53, 'smtp' => 25, 'ssh' => 22, 'mysql' => 3306],
            'firewall' => ['http' => 'ouvert', 'https' => 'ouvert', 'dns' => 'ouvert', 'smtp' => 'ouvert', 'ssh' => 'bloque', 'mysql' => 'bloque', 'porte' => 'bloque'],
        ],
        4 => ['ap3', 'ap6', 'ap8'],
        5 => 'repro',
        6 => ['attaque' => 'deauth', 'domaine' => 'campus-login.net', 'comptes' => '3', 'actions' => ['alerte', 'mdp', 'pmf']],
        3 => ['ip' => '185.220.101.4', 'compte' => 'admin', 'heure' => '08:01:03', 'persistance' => 'maintenance', 'cle' => 'X9-4TQZ'],
    ];

    private const HINTS = [
        1 => [
            "Compare l'adresse de l'expéditeur avec le domaine officiel du campus : campus.fr.",
            'Survole le lien pour voir où il mène vraiment, et regarde la toute fin du nom de la pièce jointe.',
        ],
        2 => [
            "Brassage : « domain » est le nom technique du DNS. 21, 3389 et 8080 sont des leurres. Web : 80 et 443.",
            "Pare-feu : n'ouvre sur Internet que ce que le public doit joindre. L'administration, la base de données et le port 4444 restent fermés.",
        ],
        3 => [
            "Deux adresses attaquent en SSH, mais une seule finit par réussir : cherche un « Accepted » juste après une série de « Failed ».",
            "Une fois l'IP trouvée, filtre auth.log dessus : tu y verras le compte forcé, l'heure, le compte créé avec useradd et la clé.",
        ],
        4 => [
            'Une borne du campus a forcément une adresse MAC en 00:3A:7D. Vérifie aussi la sécurité et le canal.',
            "Les 3 pirates : deux bornes Espressif ouvertes (dont un faux « campus ») et un faux « eduroam » sur le canal 3. La Livebox n'imite personne.",
        ],
        5 => [
            'Mesure au centre du bâtiment (Espace numérique) : la valeur te dit à combien de salles tu es de la borne.',
            "La borne est dans la rangée du bas, mais pas dans le local technique : l'intrus l'a cachée là où personne ne regarde.",
        ],
        6 => [
            'Regarde les trames 2 à 4 : envoyées en rafale à tout le monde, elles forcent les téléphones à se déconnecter.',
            "Compte les comptes différents dans les POST (un compte a essayé deux fois). Les contre-mesures utiles protègent les comptes, les bornes et les étudiants, sans couper le service.",
        ],
    ];

    private const SUCCESS = [
        1 => 'Bien vu : expéditeur usurpé, lien trompeur et pièce jointe exécutable. La messagerie est sécurisée.',
        2 => "Réseau rebranché : web sur 80/443, DNS sur 53, mail sur 25, SSH sur 22 et MySQL sur 3306. Seuls les services publics passent le pare-feu et la porte dérobée 4444 est murée.",
        3 => "Dossier complet : 185.220.101.4 a forcé le compte admin à 08:01:03, s'est créé le compte « maintenance » et la clé X9-4TQZ. Accès révoqués, l'ENT redémarre.",
        4 => 'Radar nettoyé : un faux « campus » ouvert, « campus_free » et un faux « eduroam » sur le canal 3. Aucune borne Cisco ne leur correspond.',
        5 => "Borne interceptée à la reprographie : un petit boîtier Espressif branché derrière le photocopieur. Le fantôme n'émet plus.",
        6 => "Rapport bouclé : déconnexions forcées (deauth), puis faux portail campus-login.net qui a volé 3 comptes. Mots de passe réinitialisés, 802.11w activé, étudiants prévenus.",
    ];

    /** Données publiques d'une épreuve (avec le nombre d'indices), ou null si elle n'existe pas. */
    public function find(int $id): ?array
    {
        if (!isset(self::CHALLENGES[$id])) {
            return null;
        }

        return self::CHALLENGES[$id] + ['hints' => \count(self::HINTS[$id] ?? [])];
    }

    public function count(): int
    {
        return \count(self::CHALLENGES);
    }

    /** Indice n° $index (à partir de 1), ou null s'il n'existe pas. */
    public function hint(int $id, int $index): ?string
    {
        return self::HINTS[$id][$index - 1] ?? null;
    }

    /**
     * Vérifie une réponse.
     *
     * @return array{correct: bool, message: string}
     */
    public function check(int $id, mixed $answer): array
    {
        return match (self::CHALLENGES[$id]['type']) {
            'phishing' => $this->checkSelection($id, $answer, 'signalement(s) juste(s)', 'Méfie-toi de ce qui est affiché : vérifie ce qui se cache derrière.'),
            'radar' => $this->checkSelection($id, $answer, 'borne(s) pirate(s) bien repérée(s)', 'Compare chaque borne signalée avec la fiche DSI.'),
            'reseau' => $this->checkReseau($id, $answer),
            'enquete' => $this->checkChamps($id, $answer, 'indice(s)', 'Recoupe avec les autres journaux.'),
            'capture' => $this->checkChamps($id, $answer, 'élément(s) du rapport', 'Relis la capture trame par trame.'),
            'chasse' => $this->checkChasse($id, $answer),
        };
    }

    /**
     * Puissance du signal de la borne pirate mesurée dans une salle (épreuve « chasse »),
     * ou null si la salle n'existe pas. Le calcul reste côté serveur pour ne pas livrer la carte au front.
     */
    public function probe(int $id, string $zone): ?int
    {
        $epreuve = self::CHALLENGES[$id] ?? null;
        if ($epreuve === null || $epreuve['type'] !== 'chasse') {
            return null;
        }
        $zones = array_column($epreuve['zones'], null, 'id');
        if (!isset($zones[$zone])) {
            return null;
        }
        $cible = $zones[self::SOLUTIONS[$id]];
        $distance = hypot($zones[$zone]['col'] - $cible['col'], $zones[$zone]['row'] - $cible['row']);

        return (int) round(-28 - 11 * $distance);
    }

    /** @return array{correct: bool, zone?: string, signal?: int, message: string} */
    private function checkChasse(int $id, mixed $answer): array
    {
        $zone = \is_string($answer) ? $answer : '';
        $signal = $this->probe($id, $zone);
        if ($signal === null) {
            return ['correct' => false, 'message' => 'Salle inconnue.'];
        }
        if ($zone === self::SOLUTIONS[$id]) {
            return ['correct' => true, 'zone' => $zone, 'signal' => $signal, 'message' => self::SUCCESS[$id]];
        }
        $nom = array_column(self::CHALLENGES[$id]['zones'], 'name', 'id')[$zone];

        return [
            'correct' => false,
            'zone' => $zone,
            'signal' => $signal,
            'message' => sprintf('Rien dans « %s » : le signal n\'y est que de %d dBm. La borne est ailleurs.', $nom, $signal),
        ];
    }

    /** Sélection d'éléments (phishing, radar) : trop de signalements = au moins un faux. */
    private function checkSelection(int $id, mixed $answer, string $unite, string $conseil): array
    {
        [$justes, $attendus] = $this->compterSelection($id, $answer);

        if ($justes === $attendus) {
            return ['correct' => true, 'message' => self::SUCCESS[$id]];
        }

        return ['correct' => false, 'message' => sprintf('%d %s sur %d. %s', $justes, $unite, $attendus, $conseil)];
    }

    /** @return array{int, int} nombre de bons signalements, nombre attendu (0 si trop de signalements) */
    private function compterSelection(int $id, mixed $answer): array
    {
        $solution = self::SOLUTIONS[$id];
        $signales = \is_array($answer) ? array_values(array_unique(array_filter($answer, 'is_string'))) : [];
        $justes = \count(array_intersect($signales, $solution));

        if (\count($signales) > \count($solution)) {
            $justes = min($justes, \count($solution) - 1);
        }

        return [$justes, \count($solution)];
    }

    /**
     * Réseau : chaque service doit être sur le bon port et chaque règle de pare-feu doit être juste.
     * On renvoie le résultat service par service, mais seulement le nombre de règles justes :
     * une règle n'a que deux états, la détailler donnerait la réponse.
     *
     * @return array{correct: bool, fields: array<string, bool>, firewall: int, message: string}
     */
    private function checkReseau(int $id, mixed $answer): array
    {
        $solution = self::SOLUTIONS[$id];
        $answer = \is_array($answer) ? $answer : [];
        $resultat = ['ports' => [], 'firewall' => []];
        foreach ($solution['ports'] as $service => $port) {
            $donne = \is_array($answer['ports'] ?? null) ? ($answer['ports'][$service] ?? null) : null;
            $resultat['ports'][$service] = is_numeric($donne) && (int) $donne === $port;
        }
        foreach ($solution['firewall'] as $regle => $etat) {
            $donne = \is_array($answer['firewall'] ?? null) ? ($answer['firewall'][$regle] ?? null) : null;
            $resultat['firewall'][$regle] = $donne === $etat;
        }

        $ports = \count(array_filter($resultat['ports']));
        $regles = \count(array_filter($resultat['firewall']));
        $correct = $ports === \count($solution['ports']) && $regles === \count($solution['firewall']);

        return [
            'correct' => $correct,
            'fields' => $resultat['ports'],
            'firewall' => $regles,
            'message' => $correct
                ? self::SUCCESS[$id]
                : sprintf('Diagnostic : %d/%d services répondent, %d/%d règles de pare-feu sont sûres.', $ports, \count($solution['ports']), $regles, \count($solution['firewall'])),
        ];
    }

    /**
     * Enquête, capture : vérifie les champs fournis un par un.
     * « partial » = tous les champs fournis sont justes mais le dossier n'est pas complet (pas de pénalité).
     *
     * @return array{correct: bool, partial: bool, fields: array<string, bool>, message: string}
     */
    private function checkChamps(int $id, mixed $answer, string $unite, string $conseil): array
    {
        $solution = self::SOLUTIONS[$id];
        $champs = [];
        foreach ($solution as $champ => $attendu) {
            $donne = \is_array($answer) ? $this->normaliser($champ, $answer[$champ] ?? null) : null;
            if ($donne !== null) {
                $champs[$champ] = $donne === $this->normaliser($champ, $attendu);
            }
        }

        $justes = \count(array_filter($champs));
        $total = \count($solution);

        if ($justes === $total) {
            return ['correct' => true, 'partial' => false, 'fields' => $champs, 'message' => self::SUCCESS[$id]];
        }

        $sansErreur = !\in_array(false, $champs, true);

        return [
            'correct' => false,
            'partial' => $sansErreur && $champs !== [],
            'fields' => $champs,
            'message' => $champs === []
                ? 'Dossier vide : remplis au moins une fiche.'
                : ($sansErreur
                ? sprintf('Piste confirmée : %d %s sur %d. Le dossier se complète.', $justes, $unite, $total)
                : sprintf('Fausse piste : %d %s sur %d confirmé(s). %s', $justes, $unite, $total, $conseil)),
        ];
    }

    /** Valeur comparable d'un champ, ou null s'il est vide. Les listes sont comparées sans tenir compte de l'ordre. */
    private function normaliser(string $champ, mixed $valeur): ?string
    {
        if (\is_array($valeur)) {
            $liste = array_values(array_unique(array_filter($valeur, 'is_string')));
            sort($liste);

            return $liste === [] ? null : implode(',', $liste);
        }
        if (\is_int($valeur)) {
            $valeur = (string) $valeur;
        }
        if (!\is_string($valeur) || trim($valeur) === '') {
            return null;
        }
        $valeur = trim($valeur);

        return match ($champ) {
            'cle' => strtoupper($valeur),
            'heure' => preg_replace('/^(\d):/', '0$1:', $valeur),
            'domaine' => rtrim(preg_replace('#^https?://#', '', strtolower($valeur)), '/'),
            default => strtolower($valeur),
        };
    }
}
