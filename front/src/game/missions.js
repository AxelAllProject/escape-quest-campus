// Tout ce qui change d'une mission à l'autre : épreuves, durée, récit, salle, bilan.
// Les énoncés et les solutions des épreuves restent dans l'API (api/src/Game/Challenges.php).

export const MISSIONS = [
  {
    id: 1,
    nom: 'Le campus est hors ligne',
    niveau: 'Initiation',
    duree: 10 * 60,
    epreuves: [1, 2, 3], // identifiants côté API, dans l'ordre
    accroche: "Un intrus a coupé l'ENT. Remets le campus en ligne avant l'ouverture des inscriptions.",
    legendeMinuteur: "avant l'ouverture des inscriptions",
    modules: [
      { id: 'messagerie', nom: 'messagerie' },
      { id: 'reseau', nom: 'réseau' },
      { id: 'journaux', nom: 'journaux' },
    ],
    parcours: [
      {
        titre: 'Le mail piégé',
        action: "Repère les 3 indices qui prouvent qu'un mail est du phishing.",
        competence: 'Phishing',
      },
      {
        titre: 'Le réseau à rebrancher',
        action: 'Rebranche 6 services sur leurs ports, puis referme le pare-feu, porte dérobée comprise.',
        competence: 'Ports et pare-feu',
      },
      {
        titre: "L'enquête dans les journaux",
        action: "Recoupe 3 journaux du serveur pour monter le dossier de l'intrus : IP, compte, heure, accès cachés.",
        competence: 'Analyse de logs',
      },
    ],
    briefing: {
      heure: '08:02',
      titre: 'Le campus est hors ligne',
      lead: "Depuis 8 h, l'ENT ne répond plus : emplois du temps, notes et messagerie sont inaccessibles. La supervision a détecté une intrusion.",
      role: "Tu es d'astreinte à la DSI. Les inscriptions aux examens ouvrent dans 10 minutes : remets le service en ligne avant.",
      journal: [
        { heure: '08:02:14', niveau: 'ALERTE', message: 'ent.campus.local ne répond plus (HTTP 503)' },
        { heure: '08:02:31', niveau: 'WARN', message: 'connexion admin inhabituelle depuis 185.220.101.4' },
        { heure: '08:03:40', niveau: 'ALERTE', message: 'services arrêtés : web, dns, ssh' },
        { heure: '08:04:02', niveau: 'INFO', message: 'origine probable : pièce jointe ouverte sur la messagerie' },
      ],
      verrous: [
        { titre: 'Messagerie', texte: "Retrouve le mail piégé qui a ouvert la porte à l'attaquant." },
        { titre: 'Réseau', texte: 'Rebranche les services et referme le pare-feu.' },
        { titre: 'Journaux', texte: "Monte le dossier de l'intrus à partir des logs." },
      ],
    },
    victoire: {
      titre: 'Le campus est de nouveau en ligne',
      lead: "Mail piégé démasqué, réseau rebranché, intrus identifié et accès révoqués. Les étudiants peuvent s'inscrire aux examens.",
      fin: "L'ENT redémarre. Incident clos.",
      attaque: [
        { heure: '07:48', texte: 'Un faux mail « Mise à jour de votre emploi du temps » arrive chez les agents.' },
        { heure: '07:53', texte: "Un agent ouvre Emploi_du_temps_S2.pdf.exe : l'attaquant a un pied dans le réseau." },
        { heure: '08:00', texte: '185.220.101.4 devine le mot de passe admin en SSH, après 3 échecs en rafale.' },
        { heure: '08:01', texte: "L'intrus crée un compte « maintenance » et la clé de récupération X9-4TQZ." },
        { heure: '08:02', texte: "Il coupe le web, le DNS et SSH, puis ouvre une porte dérobée sur le port 4444 : l'ENT tombe." },
      ],
      riposte: ['Mail piégé démasqué', 'Réseau rebranché, porte 4444 murée', "Dossier de l'intrus bouclé, accès révoqués"],
      reflexes: [
        {
          titre: 'Avant de cliquer',
          texte: "Vérifie le domaine de l'expéditeur, survole le lien, et méfie-toi des doubles extensions comme .pdf.exe.",
        },
        {
          titre: 'Ports et pare-feu',
          texte: '22 SSH, 25 SMTP, 53 DNS, 80 et 443 web, 3306 MySQL. N’ouvre sur Internet que ce que le public doit joindre, et un port inconnu se ferme.',
        },
        {
          titre: 'Lire les journaux',
          texte: 'Des échecs en rafale puis une réussite depuis la même IP, suivis d’un compte créé : force brute et accès caché. Recoupe toujours plusieurs journaux.',
        },
      ],
    },
    badgePremier: { id: 'oeil-de-lynx', nom: 'Œil de lynx', texte: 'Démasquer le phishing du premier coup' },
  },
  {
    id: 2,
    nom: 'Wi-Fi fantôme',
    niveau: 'Confirmé',
    duree: 12 * 60,
    epreuves: [4, 5, 6],
    accroche: 'Un faux Wi-Fi « campus » vole les mots de passe des étudiants. Traque-le avant le début des partiels.',
    legendeMinuteur: 'avant le début des partiels en ligne',
    modules: [
      { id: 'ondes', nom: 'ondes' },
      { id: 'terrain', nom: 'terrain' },
      { id: 'trafic', nom: 'trafic' },
    ],
    parcours: [
      {
        titre: 'Le radar Wi-Fi',
        action: 'Inspecte les 8 réseaux captés et signale les 3 bornes pirates qui imitent le campus.',
        competence: 'Sécurité Wi-Fi',
      },
      {
        titre: 'La chasse au fantôme',
        action: 'Avec seulement 4 mesures de signal, déduis la salle où la borne est cachée et intercepte-la.',
        competence: 'Radiofréquence',
      },
      {
        titre: 'La capture du piège',
        action: "Décortique le trafic capturé, comprends l'attaque et choisis les bonnes contre-mesures.",
        competence: 'Analyse réseau',
      },
    ],
    briefing: {
      heure: '08:10',
      titre: 'Un fantôme dans le Wi-Fi',
      lead: "Jour de partiels. Depuis 8 h, des étudiants de la bibliothèque perdent le Wi-Fi, se reconnectent… et leur compte ENT se fait pirater dans la minute.",
      role: "Tu es l'analyste sécurité du campus. Les partiels en ligne commencent dans 12 minutes : trouve la borne pirate et protège les comptes avant.",
      journal: [
        { heure: '08:09:12', niveau: 'ALERTE', message: '3 comptes ENT connectés depuis une adresse inconnue' },
        { heure: '08:09:40', niveau: 'WARN', message: 'pic de déconnexions Wi-Fi à la bibliothèque' },
        { heure: '08:10:05', niveau: 'WARN', message: 'nouveau réseau « campus_free » détecté' },
        { heure: '08:10:31', niveau: 'INFO', message: 'partiels en ligne à 08:22, 400 étudiants attendus' },
      ],
      verrous: [
        { titre: 'Ondes', texte: 'Repère les bornes pirates au radar.' },
        { titre: 'Terrain', texte: 'Localise la borne cachée dans la bibliothèque.' },
        { titre: 'Trafic', texte: "Analyse la capture et neutralise l'attaque." },
      ],
    },
    victoire: {
      titre: 'Le Wi-Fi du campus est sûr',
      lead: 'Bornes pirates repérées, borne fantôme saisie, comptes protégés. Les partiels peuvent commencer.',
      fin: 'Les partiels démarrent sur un Wi-Fi sain. Incident clos.',
      attaque: [
        { heure: '07:55', texte: 'Une borne pirate cachée à la reprographie émet « campus », « campus_free » et un faux « eduroam ».' },
        { heure: '08:05', texte: 'Elle inonde la BU de trames de désauthentification : les étudiants perdent le vrai Wi-Fi.' },
        { heure: '08:05', texte: 'Leurs téléphones se reconnectent au « campus » le plus fort : celui de l’attaquant.' },
        { heure: '08:05', texte: 'Son DNS menteur redirige ent.campus.fr vers le faux portail campus-login.net.' },
        { heure: '08:06', texte: '3 étudiants tapent leur mot de passe ENT : il part en clair chez l’attaquant.' },
      ],
      riposte: ['Bornes pirates repérées au radar', 'Borne fantôme saisie à la reprographie', 'Attaque analysée, comptes protégés'],
      reflexes: [
        {
          titre: 'Même nom ≠ même réseau',
          texte: "N'importe qui peut appeler sa borne « campus ». Un réseau ouvert qui imite un réseau protégé est un piège.",
        },
        {
          titre: 'Le plus fort n’est pas le plus sûr',
          texte: 'Une déconnexion soudaine suivie d’un réseau au signal énorme : méfiance. La protection 802.11w bloque les fausses déconnexions.',
        },
        {
          titre: 'Mot de passe = vrai site',
          texte: 'Ton mot de passe ENT ne se tape que sur https://ent.campus.fr. Une redirection vers un autre domaine, c’est non.',
        },
      ],
    },
    badgePremier: { id: 'chasseur-ondes', nom: "Chasseur d'ondes", texte: 'Repérer les bornes pirates du premier coup' },
  },
]

export const trouverMission = (id) => MISSIONS.find((m) => m.id === id) ?? MISSIONS[0]
