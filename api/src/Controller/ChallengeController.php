<?php

namespace App\Controller;

use App\Game\Challenges;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Attribute\Route;

/**
 * Épreuves du jeu.
 *
 * GET  /api/challenges/{id}         énoncé de l'épreuve (sans la solution)
 * POST /api/challenges/{id}/answer  vérifie la réponse : {"answer": ...} → {"correct": bool, "message": string}
 */
#[Route('/api/challenges')]
final class ChallengeController extends AbstractController
{
    public function __construct(private readonly Challenges $challenges)
    {
    }

    #[Route('/{id}', name: 'api_challenge_show', requirements: ['id' => '\d+'], methods: ['GET'])]
    public function show(int $id): JsonResponse
    {
        $challenge = $this->challenges->find($id);
        if ($challenge === null) {
            return $this->json(['error' => 'Épreuve introuvable.'], 404);
        }

        return $this->json($challenge + ['total' => $this->challenges->count()]);
    }

    #[Route('/{id}/answer', name: 'api_challenge_answer', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function answer(int $id, Request $request): JsonResponse
    {
        if ($this->challenges->find($id) === null) {
            return $this->json(['error' => 'Épreuve introuvable.'], 404);
        }

        $data = json_decode($request->getContent(), true);
        if (!\is_array($data) || !\array_key_exists('answer', $data)) {
            return $this->json(['error' => 'Corps attendu : {"answer": ...}'], 400);
        }

        return $this->json($this->challenges->check($id, $data['answer']));
    }
}
