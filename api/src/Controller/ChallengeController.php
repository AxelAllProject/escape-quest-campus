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
 * GET  /api/challenges/{id}/hints/{n}  indice n° n (à partir de 1)
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

    #[Route('/{id}/hints/{index}', name: 'api_challenge_hint', requirements: ['id' => '\d+', 'index' => '\d+'], methods: ['GET'])]
    public function hint(int $id, int $index): JsonResponse
    {
        $hint = $this->challenges->hint($id, $index);
        if ($hint === null) {
            return $this->json(['error' => 'Indice introuvable.'], 404);
        }

        return $this->json(['index' => $index, 'hint' => $hint]);
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
