<?php

namespace App\Game;

/**
 * Contenu des épreuves de la mission « Le campus est hors ligne ».
 *
 * Les solutions et les indices restent côté serveur : les solutions ne sont jamais
 * renvoyées au front, les indices seulement un par un, à la demande.
 */
final class Challenges
{
    private const CHALLENGES = [
        1 => [
            'id' => 1,
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
    ];

    private const SOLUTIONS = [
        1 => ['expediteur', 'lien', 'piece_jointe'],
        2 => [
            'ports' => ['http' => 80, 'https' => 443, 'dns' => 53, 'smtp' => 25, 'ssh' => 22, 'mysql' => 3306],
            'firewall' => ['http' => 'ouvert', 'https' => 'ouvert', 'dns' => 'ouvert', 'smtp' => 'ouvert', 'ssh' => 'bloque', 'mysql' => 'bloque', 'porte' => 'bloque'],
        ],
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
    ];

    private const SUCCESS = [
        1 => 'Bien vu : expéditeur usurpé, lien trompeur et pièce jointe exécutable. La messagerie est sécurisée.',
        2 => "Réseau rebranché : web sur 80/443, DNS sur 53, mail sur 25, SSH sur 22 et MySQL sur 3306. Seuls les services publics passent le pare-feu et la porte dérobée 4444 est murée.",
        3 => "Dossier complet : 185.220.101.4 a forcé le compte admin à 08:01:03, s'est créé le compte « maintenance » et la clé X9-4TQZ. Accès révoqués, l'ENT redémarre.",
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
        if (self::CHALLENGES[$id]['type'] === 'enquete') {
            return $this->checkEnquete($id, $answer);
        }
        if (self::CHALLENGES[$id]['type'] === 'reseau') {
            return $this->checkReseau($id, $answer);
        }

        [$justes, $attendus] = $this->checkPhishing($id, $answer);

        if ($justes === $attendus) {
            return ['correct' => true, 'message' => self::SUCCESS[$id]];
        }

        return [
            'correct' => false,
            'message' => sprintf('%d signalement(s) juste(s) sur %d. Méfie-toi de ce qui est affiché : vérifie ce qui se cache derrière.', $justes, $attendus),
        ];
    }

    /** @return array{int, int} nombre de bons signalements, nombre attendu (0 si trop de signalements) */
    private function checkPhishing(int $id, mixed $answer): array
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
     * Enquête : vérifie les champs fournis un par un.
     * « partial » = tous les champs fournis sont justes mais le dossier n'est pas complet (pas de pénalité).
     *
     * @return array{correct: bool, partial: bool, fields: array<string, bool>, message: string}
     */
    private function checkEnquete(int $id, mixed $answer): array
    {
        $solution = self::SOLUTIONS[$id];
        $champs = [];
        foreach ($solution as $champ => $attendu) {
            if (\is_array($answer) && isset($answer[$champ]) && \is_string($answer[$champ]) && trim($answer[$champ]) !== '') {
                $champs[$champ] = $this->normaliser($champ, $answer[$champ]) === $this->normaliser($champ, $attendu);
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
                ? sprintf('Piste confirmée : %d indice(s) sur %d. Le dossier se complète.', $justes, $total)
                : sprintf('Fausse piste : %d indice(s) sur %d confirmé(s). Recoupe avec les autres journaux.', $justes, $total)),
        ];
    }

    private function normaliser(string $champ, string $valeur): string
    {
        $valeur = trim($valeur);

        return match ($champ) {
            'cle' => strtoupper($valeur),
            'heure' => preg_replace('/^(\d):/', '0$1:', $valeur),
            default => strtolower($valeur),
        };
    }
}
