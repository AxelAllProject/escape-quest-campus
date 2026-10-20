<?php

namespace App\Game;

/**
 * Contenu des épreuves de la mission « Le campus est hors ligne ».
 *
 * Les solutions restent côté serveur : elles ne sont jamais renvoyées au front.
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
    ];

    private const SOLUTIONS = [
        1 => ['expediteur', 'lien', 'piece_jointe'],
    ];

    /** Données publiques d'une épreuve, ou null si elle n'existe pas. */
    public function find(int $id): ?array
    {
        return self::CHALLENGES[$id] ?? null;
    }

    public function count(): int
    {
        return \count(self::CHALLENGES);
    }

    /**
     * Vérifie une réponse.
     *
     * @return array{correct: bool, message: string}
     */
    public function check(int $id, mixed $answer): array
    {
        return match (self::CHALLENGES[$id]['type']) {
            'phishing' => $this->checkPhishing($id, $answer),
        };
    }

    private function checkPhishing(int $id, mixed $answer): array
    {
        $solution = self::SOLUTIONS[$id];
        $signales = \is_array($answer) ? array_values(array_unique(array_filter($answer, 'is_string'))) : [];
        $justes = \count(array_intersect($signales, $solution));

        if ($justes === \count($solution) && \count($signales) === \count($solution)) {
            return ['correct' => true, 'message' => 'Bien vu : expéditeur usurpé, lien trompeur et pièce jointe exécutable. La messagerie est sécurisée.'];
        }

        return [
            'correct' => false,
            'message' => sprintf('%d signalement(s) juste(s) sur %d. Méfie-toi de ce qui est affiché : vérifie ce qui se cache derrière.', $justes, \count($solution)),
        ];
    }
}
