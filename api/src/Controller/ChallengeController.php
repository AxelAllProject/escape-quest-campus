<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Endpoint modèle : à reproduire pour chaque épreuve.
 * Contrat d'API : voir la page Notion du projet (partie Technique).
 */
#[Route('/api/challenges')]
final class ChallengeController extends AbstractController
{
    #[Route('/{id}', name: 'api_challenge_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        return $this->json([
            'id' => $id,
            'title' => 'Épreuve '.$id,
            'hint' => 'Indice à venir',
        ]);
    }
}
