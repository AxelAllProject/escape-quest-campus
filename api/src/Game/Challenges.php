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
            'title' => 'Les services coupés',
            'type' => 'ports',
            'instructions' => "L'attaquant a arrêté les services du campus et effacé leur configuration. Indique sur quel port chaque service doit écouter, puis relance-les.",
            'services' => [
                ['id' => 'http', 'name' => 'Serveur web', 'protocol' => 'HTTP', 'description' => "Pages de l'ENT, sans chiffrement"],
                ['id' => 'https', 'name' => 'Serveur web sécurisé', 'protocol' => 'HTTPS', 'description' => "Pages de l'ENT, chiffrées"],
                ['id' => 'ssh', 'name' => 'Administration à distance', 'protocol' => 'SSH', 'description' => 'Connexion des admins aux serveurs'],
                ['id' => 'dns', 'name' => 'Résolution de noms', 'protocol' => 'DNS', 'description' => 'Traduit ent.campus.fr en adresse IP'],
            ],
            'ports' => [21, 22, 25, 53, 80, 443, 3306],
            'clue' => [
                'file' => '/etc/services',
                'note' => "Fichier en partie effacé par l'attaquant",
                'lines' => [
                    'ftp        21/tcp',
                    'ssh        22/tcp      # Secure Shell',
                    'smtp       25/tcp      # Mail',
                    'domain     ##/udp      # Domain Name Server',
                    'http       ##/tcp      # World Wide Web',
                    '######    ###/tcp      # HTTP over TLS/SSL',
                    'mysql    3306/tcp',
                ],
            ],
        ],
        3 => [
            'id' => 3,
            'module' => 'journaux',
            'title' => "Les traces de l'intrus",
            'type' => 'logs',
            'instructions' => "Avant de couper les services, l'intrus s'est créé une clé de récupération administrateur. Retrouve dans le journal du serveur la clé qu'il a créée, pas celle d'un agent du campus.",
            'file' => '/var/log/auth.log',
            'lines' => [
                '07:52:03 sshd[2211]: Accepted publickey for jdupont from 10.0.4.12 port 51022',
                '07:52:40 sudo: jdupont : COMMAND=/usr/local/bin/recovery-key --create',
                '07:52:40 recovery-key: clé K8-22LM créée pour jdupont (10.0.4.12)',
                '07:58:11 postfix/smtpd[880]: connect from mail.campus.fr[10.0.2.5]',
                '08:00:47 sshd[2390]: Failed password for admin from 185.220.101.4 port 40112',
                '08:00:49 sshd[2390]: Failed password for admin from 185.220.101.4 port 40118',
                '08:00:52 sshd[2391]: Failed password for admin from 185.220.101.4 port 40125',
                '08:01:03 sshd[2392]: Accepted password for admin from 185.220.101.4 port 40131',
                '08:01:15 sudo: admin : COMMAND=/usr/sbin/useradd -m maintenance',
                '08:01:31 sudo: admin : COMMAND=/usr/local/bin/recovery-key --create',
                '08:01:31 recovery-key: clé X9-4TQZ créée pour admin (185.220.101.4)',
                '08:01:58 sshd[2411]: Accepted password for mlefevre from 10.0.4.30 port 49810',
                '08:02:05 sudo: mlefevre : COMMAND=/usr/local/bin/recovery-key --create',
                '08:02:05 recovery-key: clé P3-7HXA créée pour mlefevre (10.0.4.30)',
                '08:02:10 systemctl: nginx.service stopped by admin',
                '08:02:12 systemctl: named.service stopped by admin',
                '08:02:13 systemctl: sshd.service stopped by admin',
            ],
        ],
    ];

    private const SOLUTIONS = [
        1 => ['expediteur', 'lien', 'piece_jointe'],
        2 => ['http' => 80, 'https' => 443, 'ssh' => 22, 'dns' => 53],
        3 => 'X9-4TQZ',
    ];

    private const HINTS = [
        1 => [
            "Compare l'adresse de l'expéditeur avec le domaine officiel du campus : campus.fr.",
            'Survole le lien pour voir où il mène vraiment, et regarde la toute fin du nom de la pièce jointe.',
        ],
        2 => [
            "Dans /etc/services, « domain » est le nom technique du DNS. Élimine les ports déjà utilisés par d'autres services.",
            'HTTP écoute sur le port 80 et HTTPS sur le port 443.',
        ],
        3 => [
            "L'adresse IP de l'intrus apparaît dans le journal de supervision du briefing.",
            'Filtre le journal sur 185.220.101.4 et cherche la ligne « recovery-key ».',
        ],
    ];

    private const SUCCESS = [
        1 => 'Bien vu : expéditeur usurpé, lien trompeur et pièce jointe exécutable. La messagerie est sécurisée.',
        2 => 'Services relancés : web sur 80 et 443, SSH sur 22, DNS sur 53. Le réseau du campus répond de nouveau.',
        3 => "Clé X9-4TQZ révoquée et compte « maintenance » supprimé : l'intrus n'a plus d'accès. L'ENT redémarre.",
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
        [$justes, $attendus] = match (self::CHALLENGES[$id]['type']) {
            'phishing' => $this->checkPhishing($id, $answer),
            'ports' => $this->checkPorts($id, $answer),
            'logs' => $this->checkLogs($id, $answer),
        };

        if ($justes === $attendus) {
            return ['correct' => true, 'message' => self::SUCCESS[$id]];
        }

        return [
            'correct' => false,
            'message' => match (self::CHALLENGES[$id]['type']) {
                'phishing' => sprintf('%d signalement(s) juste(s) sur %d. Méfie-toi de ce qui est affiché : vérifie ce qui se cache derrière.', $justes, $attendus),
                'ports' => sprintf('%d service(s) sur %d démarre(nt) correctement. Les autres ne répondent toujours pas.', $justes, $attendus),
                'logs' => "Cette clé n'appartient pas à l'intrus. Vérifie depuis quelle adresse IP elle a été créée.",
            },
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

    /** @return array{int, int} nombre de services sur le bon port, nombre de services */
    private function checkPorts(int $id, mixed $answer): array
    {
        $solution = self::SOLUTIONS[$id];
        $justes = 0;
        foreach ($solution as $service => $port) {
            if (\is_array($answer) && isset($answer[$service]) && (int) $answer[$service] === $port) {
                ++$justes;
            }
        }

        return [$justes, \count($solution)];
    }

    /** @return array{int, int} 1 si la clé est la bonne (casse et espaces ignorés), sur 1 */
    private function checkLogs(int $id, mixed $answer): array
    {
        $saisie = \is_string($answer) ? strtoupper(trim($answer)) : '';

        return [$saisie === self::SOLUTIONS[$id] ? 1 : 0, 1];
    }
}
