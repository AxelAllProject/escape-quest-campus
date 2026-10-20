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
        ],
    ];

    private const SOLUTIONS = [
        1 => ['expediteur', 'lien', 'piece_jointe'],
        2 => ['http' => 80, 'https' => 443, 'ssh' => 22, 'dns' => 53],
    ];

    private const HINTS = [
        1 => [
            "Compare l'adresse de l'expéditeur avec le domaine officiel du campus : campus.fr.",
            'Survole le lien pour voir où il mène vraiment, et regarde la toute fin du nom de la pièce jointe.',
        ],
        2 => [
            "Le web chiffré (HTTPS) n'utilise pas le même port que le web classique (HTTP).",
            'SSH écoute sur le port 22 et DNS sur le port 53.',
        ],
    ];

    private const SUCCESS = [
        1 => 'Bien vu : expéditeur usurpé, lien trompeur et pièce jointe exécutable. La messagerie est sécurisée.',
        2 => 'Services relancés : web sur 80 et 443, SSH sur 22, DNS sur 53. Le réseau du campus répond de nouveau.',
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
        };

        if ($justes === $attendus) {
            return ['correct' => true, 'message' => self::SUCCESS[$id]];
        }

        return [
            'correct' => false,
            'message' => match (self::CHALLENGES[$id]['type']) {
                'phishing' => sprintf('%d signalement(s) juste(s) sur %d. Méfie-toi de ce qui est affiché : vérifie ce qui se cache derrière.', $justes, $attendus),
                'ports' => sprintf('%d service(s) sur %d démarre(nt) correctement. Les autres ne répondent toujours pas.', $justes, $attendus),
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
}
