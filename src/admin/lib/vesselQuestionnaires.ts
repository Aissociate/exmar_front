export interface QuestionnaireSection {
  title: string;
  items: QuestionnaireItem[];
}

export interface QuestionnaireItem {
  id: number;
  label: string;
  category?: string;
}

export type VesselDivision = 'division_227' | 'division_240';

export type VesselQuestionnaireType =
  | 'day_boat_sailboat'
  | 'cruising_sailboat'
  | 'semi_rigid'
  | 'jet_ski'
  | 'day_cruiser'
  | 'motor_yacht'
  | 'yacht'
  | 'division_227_general';

export const VESSEL_DIVISIONS: Record<VesselDivision, { label: string; description: string }> = {
  division_227: {
    label: 'Division 227',
    description: 'Navires de commerce, pêche, services et cultures marines (> 24m)',
  },
  division_240: {
    label: 'Division 240',
    description: 'Navires de plaisance à usage personnel (≤ 24m)',
  },
};

export const VESSEL_QUESTIONNAIRE_TYPES: Record<VesselQuestionnaireType, { label: string; shortLabel: string; division?: VesselDivision }> = {
  day_boat_sailboat: { label: 'Voilier Monocoque Day Boat', shortLabel: 'Day Boat', division: 'division_240' },
  cruising_sailboat: { label: 'Voilier Monocoque de Croisière', shortLabel: 'Voilier Croisière', division: 'division_240' },
  semi_rigid: { label: 'Semi-Rigide', shortLabel: 'Semi-Rigide', division: 'division_240' },
  jet_ski: { label: 'Véhicule Nautique à Moteur', shortLabel: 'Jet Ski', division: 'division_240' },
  day_cruiser: { label: 'Bateau Moteur Day Cruiser', shortLabel: 'Day Cruiser', division: 'division_240' },
  motor_yacht: { label: 'Vedette', shortLabel: 'Vedette', division: 'division_240' },
  yacht: { label: 'Yacht de Luxe', shortLabel: 'Yacht', division: 'division_240' },
  division_227_general: { label: 'Questionnaire Division 227', shortLabel: 'Division 227', division: 'division_227' },
};

export function getQuestionnaireTypesByDivision(division: VesselDivision): VesselQuestionnaireType[] {
  return Object.entries(VESSEL_QUESTIONNAIRE_TYPES)
    .filter(([_, config]) => config.division === division)
    .map(([type, _]) => type as VesselQuestionnaireType);
}

export const QUESTIONNAIRES: Record<VesselQuestionnaireType, QuestionnaireSection[]> = {
  day_boat_sailboat: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: 'Vérification conformité et homologation' },
        { id: 3, label: "Numéro d'identification gravé sur la coque" },
        { id: 4, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 5, label: "Présentation des factures d'entretiens et réparations des 4 dernières années" },
        { id: 6, label: "Présence du manuel d'utilisation du bateau, moteur et équipements" },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 7, label: "Présence d'eau dans les fonds (préciser douce ou salée)" },
        { id: 8, label: 'Fissures sur les varangues et longerons' },
        { id: 9, label: 'Présence de délaminages' },
        { id: 10, label: 'Pied de mât, épontille' },
        { id: 11, label: 'Fixation des tirants et contre plaques de cadènes' },
        { id: 12, label: 'Corrosion boulons de fixation du lest' },
        { id: 13, label: 'Contrôle mécanisme(s) de dérive(s), jeu latéral, jeu axe(s)' },
        { id: 14, label: 'Chocs sur la (les) coque(s) lests, dérives traces de réparation ou corrosion' },
      ],
    },
    {
      title: 'PLOMBERIE',
      items: [
        { id: 15, label: 'Fonctionnement de la pompe de cale manuelle' },
      ],
    },
    {
      title: 'MOTEUR',
      items: [
        { id: 16, label: 'Marque, puissance et année - vérification conformité et homologation' },
        { id: 17, label: 'État ligne carburant' },
        { id: 18, label: 'État général extérieur du moteur (peinture, corrosion)' },
        { id: 19, label: 'État de la tête motrice et de ses périphériques' },
        { id: 20, label: 'État de la chaise ou du tableau arrière de fixation si moteur HB' },
        { id: 21, label: 'Démarrage moteur, contrôle fumée, arrêt' },
        { id: 22, label: 'Contrôle de la "pissette" de refroidissement' },
        { id: 23, label: "Essai d'embrayage avant/arrière et retour point mort" },
        { id: 24, label: 'Essai de démarrage embrayé' },
        { id: 25, label: 'Poignée de gaz' },
        { id: 26, label: 'Rotation tribord/bâbord' },
        { id: 27, label: "État de l'hélice" },
        { id: 28, label: 'État de la béquille/dérive' },
        { id: 29, label: 'Présence et essai des coupes-circuit "bracelet" sur HB' },
        { id: 30, label: 'Vérification factures : vidange embase, filtre à carburant et turbine' },
      ],
    },
    {
      title: 'PONT ET GRÉEMENT',
      items: [
        { id: 31, label: 'Balcons et chandeliers (fixation, jeu, corrosion, …)' },
        { id: 32, label: 'Filières' },
        { id: 33, label: 'Taquets et chaumards' },
        { id: 34, label: 'Cadènes' },
        { id: 35, label: 'Tension du gréement dormant, goupilles sur axes' },
        { id: 36, label: "Mât - bôme- poulies et bloqueurs corrosion (présence d'alumine), rivets/visserie/réas" },
        { id: 37, label: 'Winches : usure, blocage, entretien apparent' },
        { id: 38, label: 'État du gréement courant' },
        { id: 39, label: 'Jeu dans la (les) barre(s)' },
        { id: 40, label: 'Martingale : fixations et tension (catamaran uniquement)' },
        { id: 41, label: 'Mécanismes de réduction de largeur HT (trimaran uniquement)' },
        { id: 42, label: 'Trampoline(s) : état, fixation(s), vieillissement UV (multicoques)' },
        { id: 43, label: 'Ligne de mouillage (ancre, chaîne et corde)' },
      ],
    },
  ],

  cruising_sailboat: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: 'Contrôles conformité et homologations' },
        { id: 3, label: "Numéro d'identification gravé sur la coque" },
        { id: 4, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 5, label: "Présence manuel d'utilisation bateau, moteur et équipements" },
        { id: 6, label: "Présentation des factures d'entretiens et réparations des 4 dernières années" },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 7, label: "Présence d'eau (préciser douce ou salée) ou d'huile dans les fonds" },
        { id: 8, label: 'Fissures sur les varangues et longerons' },
        { id: 9, label: 'Présence de délaminages' },
        { id: 10, label: "Examen approfondi du crash box (arrière lest)" },
        { id: 11, label: "Pied de mât, épontille ou ridoirs d'étambrai" },
        { id: 12, label: 'Fixation des tirants et contre plaques de cadènes' },
        { id: 13, label: 'Corrosion boulons de fixation du lest' },
        { id: 14, label: 'Fissures ou décollement liaisons cloisons/coque-pont' },
        { id: 15, label: 'Fixation des meubles' },
        { id: 16, label: 'Fissures sur le bâti moteur' },
        { id: 17, label: 'Présence des bouchons de sondes de navigation' },
      ],
    },
    {
      title: 'PLOMBERIE',
      items: [
        { id: 18, label: 'Fonctionnement de la pompe de cale manuelle, électrique' },
        { id: 19, label: "Corrosion sur passes coques et vannes de salle d'eau et cuisine" },
        { id: 20, label: "Essai d'ouverture/fermeture vannes de salle d'eau et cuisine" },
        { id: 21, label: 'Présence de 2 colliers sur tous les passes coques' },
        { id: 22, label: "Mise sous pression du circuit d'eau douce, contrôle des fuites" },
        { id: 23, label: 'Essai de coupure du gaz (vanne)' },
        { id: 24, label: 'Date de validité du tuyau souple' },
        { id: 25, label: "Contrôle visuel des réservoirs d'eau douce et tuyauteries" },
        { id: 26, label: "Présence d'un réservoir d'eaux noires" },
        { id: 27, label: 'Fonctionnement du (des) WC' },
      ],
    },
    {
      title: 'ÉLECTRICITÉ ET ÉLECTRONIQUE',
      items: [
        { id: 28, label: 'Tension de batterie(s) de service et moteurs' },
        { id: 29, label: 'Contrôle de la tension de charge (chargeur quai)' },
        { id: 30, label: "Contrôle de la production d'eau chaude" },
        { id: 31, label: 'État des coupes batteries' },
        { id: 32, label: 'Examen visuel des connexions du tableau électrique et fusibles DC' },
        { id: 33, label: 'Examen visuel des connexions de batteries' },
        { id: 34, label: 'Fixation des batteries dans un coffre ventilé' },
        { id: 35, label: 'Contrôle de tous les feux de navigation et de mouillage' },
        { id: 36, label: 'Circuit 220V (disjoncteur différentiel, disjoncteurs de distribution)' },
      ],
    },
    {
      title: 'MOTEUR',
      items: [
        { id: 37, label: 'Marque, modèle, puissance et année - homologation' },
        { id: 38, label: "Nombre d'heures moteur" },
        { id: 39, label: 'Nable(s) et évent(s) : état et fonctionnement' },
        { id: 40, label: 'Fixation et état du réservoir à carburant' },
        { id: 41, label: 'État des durites et colliers' },
        { id: 42, label: "Essai d'ouverture/fermeture vanne moteur" },
        { id: 43, label: 'Préfiltre décanteur/séparateur' },
        { id: 44, label: 'État des silent-blocks' },
        { id: 45, label: "Présence de fuites d'huile sur le moteur, propreté" },
        { id: 46, label: 'Traces de sel autour de la pompe à eau' },
        { id: 47, label: "Présence d'huile sous la gatte moteur" },
        { id: 48, label: 'Corrosion sur passe coque et vanne moteur' },
        { id: 49, label: "Niveaux d'huile et glycol si échangeur" },
        { id: 50, label: 'Contrôle des courroies' },
        { id: 51, label: 'Démarrage moteur, contrôle température et fumée, arrêt moteur' },
        { id: 52, label: "Contrôle de la charge alternateur" },
        { id: 53, label: 'Vérification factures des 4 dernières années : vidange, filtres, turbine, anodes, presse étoupe' },
      ],
    },
    {
      title: 'TRANSMISSION',
      items: [
        { id: 54, label: 'Essai en charge avant/arrière inverseur, réglage, vibrations' },
        { id: 55, label: "Fissures sur tube d'étambot et renforts" },
        { id: 56, label: "Contrôle en charge de l'arbre d'hélice vs le tube d'étambot" },
        { id: 57, label: "Contrôle de l'étanchéité/lubrification joint d'étambot" },
      ],
    },
    {
      title: 'APPAREIL À GOUVERNER',
      items: [
        { id: 58, label: 'Jeu dans le palier haut de tube de jaumière' },
        { id: 59, label: 'Tension de drosses, présence de contre écrous' },
        { id: 60, label: 'Jeu dans la barre (ou point dur)' },
        { id: 61, label: 'Fixation du rudder pilote' },
      ],
    },
    {
      title: "PROPULSEUR D'ÉTRAVE",
      items: [
        { id: 62, label: "Contrôle de l'étanchéité sous couchette avant (tube et moteur)" },
        { id: 63, label: 'Localisation du disjoncteur de puissance' },
        { id: 64, label: 'Essai tribord/bâbord' },
      ],
    },
    {
      title: 'PONT ET GRÉEMENT',
      items: [
        { id: 65, label: 'Balcons, chandeliers, filières (fixation, jeu, corrosion, …)' },
        { id: 66, label: 'État et fonctionnement du guindeau' },
        { id: 67, label: 'Baille à mouillage, davier, ancre, chaîne' },
        { id: 68, label: 'Taquets, chaumards, cadènes' },
        { id: 69, label: 'Déformation des passavants et roof en zones cadènes' },
        { id: 70, label: 'Fermetures des hublots de coque et panneaux de pont' },
        { id: 71, label: 'État des amarres et défenses' },
        { id: 72, label: 'Tension du gréement dormant, goupilles sur axes' },
        { id: 73, label: "Mât, bôme corrosion (présence d'alumine), rivets/visserie/réas" },
        { id: 74, label: 'Winches : usure, blocage, entretien apparent' },
        { id: 75, label: 'État du gréement courant' },
        { id: 76, label: "Présence, état et points d'accrochage des lignes de vie" },
        { id: 77, label: 'Étanchéité accastillage, hublots, panneaux en visuel' },
        { id: 78, label: 'Étanchéité liaison pont-coque en visuel' },
      ],
    },
    {
      title: 'CONTRÔLES SI NAVIRE À TERRE',
      items: [
        { id: 79, label: 'Chocs sur la coque, lest, traces de réparation et corrosion' },
        { id: 80, label: 'Fissure/jour liaison coque-lest' },
        { id: 81, label: 'Jeu mèche de safran vs palier bas' },
        { id: 82, label: 'Hélice (corrosion, état de surface, coups)' },
        { id: 83, label: "État de la transmission sail drive ou arbre d'hélice et chaise d'arbre" },
        { id: 84, label: 'Anodes' },
        { id: 85, label: 'Crépine de refroidissement, passes coque' },
        { id: 86, label: 'Tunnel de propulseur, hélice, protections' },
      ],
    },
  ],

  semi_rigid: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: 'Vérification conformité et homologation' },
        { id: 3, label: "Numéro d'identification gravé sur la coque" },
        { id: 4, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 5, label: "Présentation des factures d'entretiens et réparations des 4 dernières années" },
        { id: 6, label: "Présence du manuel d'utilisation du bateau, moteur et équipements" },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 7, label: 'Navire à sec : état de la coque' },
        { id: 8, label: "État protection étrave" },
        { id: 9, label: "État de l'anneau de remorquage" },
        { id: 10, label: 'État des renforts structurels de la coque' },
        { id: 11, label: 'État du tableau arrière' },
        { id: 12, label: 'État du dispositif auto-videur' },
        { id: 13, label: 'État du dispositif vidange (coque-plancher)' },
        { id: 14, label: 'Revêtement des chambres de flottabilité' },
        { id: 15, label: 'État des chambres de flottabilité' },
        { id: 16, label: 'État des valves de gonflage' },
      ],
    },
    {
      title: 'SÉCURITÉ (ÉLÉMENTS PRINCIPAUX)',
      items: [
        { id: 19, label: 'Contrôle visuel cap compas' },
        { id: 20, label: 'Nombre de gilets homologués' },
        { id: 21, label: 'Validité des fusées (selon catégorie)' },
        { id: 22, label: "Présence d'un mouillage à bord" },
        { id: 23, label: 'Rame ou pagaie' },
        { id: 24, label: 'Écope ou seau' },
        { id: 25, label: 'Présence traceur' },
        { id: 26, label: 'VHF Présence et essai' },
      ],
    },
    {
      title: 'MOTEUR',
      items: [
        { id: 16, label: 'Marque, puissance et année - vérification conformité et homologation' },
        { id: 17, label: 'État ligne carburant' },
        { id: 18, label: 'État général extérieur du moteur (peinture, corrosion)' },
        { id: 19, label: 'État de la tête motrice et de ses périphériques' },
        { id: 20, label: 'État de la chaise ou du tableau arrière de fixation si moteur HB' },
        { id: 21, label: 'Démarrage moteur, contrôle fumée, arrêt' },
        { id: 22, label: 'Contrôle de la "pissette" de refroidissement' },
        { id: 23, label: "Essai d'embrayage avant/arrière et retour point mort" },
        { id: 24, label: 'Essai de démarrage embrayé' },
        { id: 25, label: 'Poignée de gaz' },
        { id: 26, label: 'Rotation tribord/bâbord' },
        { id: 27, label: "État de l'hélice" },
        { id: 28, label: 'État de la béquille/dérive' },
        { id: 29, label: 'Présence et essai des coupes-circuit "bracelet" sur HB' },
        { id: 30, label: 'Vérification factures : vidange embase, filtre à carburant et turbine' },
      ],
    },
    {
      title: 'PONT ET GRÉEMENT',
      items: [
        { id: 31, label: 'État et propreté' },
        { id: 32, label: 'Ligne de mouillage et guindeau' },
        { id: 33, label: 'Fonctionnement du guindeau' },
        { id: 34, label: 'Présence étalingure' },
        { id: 35, label: 'Poste de barre description' },
        { id: 36, label: 'Direction statut et marque et type (hydraulique, électrique ou câble)' },
        { id: 37, label: 'État de la barre' },
        { id: 38, label: 'Point dur dans la barre' },
        { id: 39, label: 'Coffre avant et arrière contrôle général évacuation et fonctionnement' },
        { id: 40, label: 'État des viviers - pompe(s) de remplissage et vidange(s)' },
        { id: 41, label: 'Capote et Bimini' },
        { id: 42, label: 'État fixation siège(s) - bolster(s) - console - roolbar' },
      ],
    },
  ],

  jet_ski: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation' },
        { id: 2, label: 'Vérification conformité et homologation' },
        { id: 3, label: "Numéro d'identification gravé sur la coque" },
        { id: 4, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 5, label: "Présence du manuel utilisateur bateau, moteur et équipements" },
        { id: 6, label: "Présentation des factures d'entretiens et réparations des 4 dernières années" },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 7, label: 'Fissures sur les structures de fond de coque' },
        { id: 8, label: 'Présence de délaminages ou cassures' },
        { id: 9, label: 'Chocs sur la coque et le "pont", traces de réparation' },
      ],
    },
    {
      title: 'MOTEUR ET TURBINE',
      items: [
        { id: 10, label: 'Marque, modèle, puissance et année - conformité et homologation' },
        { id: 11, label: "Nombre d'heures moteur" },
        { id: 12, label: 'État des durites et colliers' },
        { id: 13, label: 'État des silent-blocks' },
        { id: 14, label: 'Présence de fuites et propreté' },
        { id: 15, label: 'Démarrage moteur, contrôle température et fumée, arrêt' },
        { id: 16, label: 'Rotation tribord/bâbord (réglage de direction)' },
        { id: 17, label: 'Jeu dans la direction' },
        { id: 18, label: 'Présence et essai du coupe circuit "bracelet"' },
      ],
    },
  ],

  day_cruiser: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: "Numéro d'identification gravé sur la coque" },
        { id: 3, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 4, label: "Présentation des factures d'entretiens et réparations 4 dernières années" },
        { id: 5, label: 'Présence des manuels utilisateur bateau, moteur et équipements' },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 6, label: "Présence d'eau dans les fonds (préciser douce ou salée)" },
        { id: 7, label: 'Fissures sur les structures de fond de coque' },
        { id: 8, label: 'Présence de délaminages' },
        { id: 9, label: 'Fissures aux angles du tableau moteur' },
        { id: 10, label: 'Chocs sur la coque, traces de réparation (œuvres vives)' },
        { id: 11, label: 'Chocs sur la coque, traces de réparation (œuvres mortes)' },
      ],
    },
    {
      title: 'PLOMBERIE',
      items: [
        { id: 12, label: 'Fonctionnement de la pompe de cale manuelle' },
      ],
    },
    {
      title: 'ÉLECTRICITÉ ET ÉLECTRONIQUE',
      items: [
        { id: 13, label: 'Tension de batterie(s) moteur(s)' },
        { id: 14, label: 'État des coupes batteries' },
        { id: 15, label: 'Examen visuel des connexions de batteries' },
        { id: 16, label: 'Fixation de(s) la batterie(s) dans un coffre ventilé' },
        { id: 17, label: 'Contrôle de tous les feux de navigation et de mouillage' },
      ],
    },
    {
      title: 'MOTEUR(S) IN BORD',
      items: [
        { id: 18, label: 'Marque, modèle, puissance et année, conformité et homologation' },
        { id: 19, label: "Nombre d'heures moteur (s)" },
        { id: 20, label: 'Nable(s) et évent(s) : état et fonctionnement' },
        { id: 21, label: 'Fixation et état du réservoir à carburant' },
        { id: 22, label: 'État des durites et colliers' },
        { id: 23, label: "Essai d'ouverture/fermeture vanne(s) moteur(s)" },
        { id: 24, label: 'Préfiltre(s) décanteur(s)/séparateur(s)' },
        { id: 25, label: 'État des silent-blocks' },
        { id: 26, label: "Présence de fuites d'huile sur le(s) moteur(s), propreté" },
        { id: 27, label: 'Traces de sel autour de la (des) pompes à eau' },
        { id: 28, label: "Présence d'huile sous la (les) gatte(s) moteur(s)" },
        { id: 29, label: 'Corrosion sur passe(s) coque et vanne(s) moteur(s)' },
        { id: 30, label: "Niveaux d'huile et glycol si échangeur" },
        { id: 31, label: 'Contrôle des courroies' },
        { id: 32, label: 'Démarrage moteur(s), contrôle température et fumée, arrêt' },
        { id: 33, label: "Contrôle de la charge alternateur(s)" },
        { id: 34, label: 'Vérification factures : vidange(s) filtres, turbines, anode, coude antisiphon' },
      ],
    },
    {
      title: "TRANSMISSION(S) IN BORD ET APPAREIL À GOUVERNER",
      items: [
        { id: 35, label: 'Essai en charge avant/arrière inverseur(s), réglage(s), vibrations' },
        { id: 36, label: "Fissures sur tube(s) d'étambot(s) et renforts" },
        { id: 37, label: "Contrôle en charge arbre(s) d'hélice(s) vs le tube d'étambot" },
        { id: 38, label: "Contrôle de l'étanchéité/lubrification joint(s) d'étambot(s)" },
        { id: 39, label: 'Ou essai relevage/descente de (des) l\'embase(s)' },
        { id: 40, label: 'Transmission(s) Z-drive (corrosion, propreté, soufflets,…)' },
        { id: 41, label: "Ou de(s) l'arbre(s) d'hélice(s), chaise(s) d'arbre(s), bague(s) hydro." },
        { id: 42, label: 'Vérification factures : entretien embase(s) (soufflets,…), presse-étoupe, anodes' },
        { id: 43, label: 'Contrôle visuel de (des) hélice(s)' },
        { id: 44, label: 'Essais de barre de butée à butée, jeu dans la barre (ou point dur)' },
      ],
    },
    {
      title: 'OU MOTEUR(S) HORS BORD',
      items: [
        { id: 45, label: 'Marque, modèle, puissance et année, conformité et homologation' },
        { id: 46, label: "Nombre d'heures moteur (s)" },
        { id: 47, label: 'Nable(s) et évent(s) : état et fonctionnement' },
        { id: 48, label: 'Fixation et état du réservoir à carburant' },
        { id: 49, label: 'État des durites et colliers' },
        { id: 50, label: "Essai d'ouverture/fermeture vanne(s) moteur(s)" },
        { id: 51, label: 'Préfiltre(s) décanteur(s)/séparateur(s)' },
        { id: 52, label: 'État général extérieur du (des) moteur(s) (peinture, corrosion)' },
        { id: 53, label: 'État de la (des) tête(s) motrice(s) et de ses périphériques' },
        { id: 54, label: 'État des boulons de fixation' },
        { id: 55, label: 'Démarrage moteur(s), contrôle température(s) et fumée, arrêt' },
        { id: 56, label: 'Contrôle de la (des) "pissette(s)" de refroidissement' },
        { id: 57, label: 'Contrôle de la charge batterie(s)' },
        { id: 58, label: "Essai d'embrayage avant/arrière et retour point mort" },
        { id: 59, label: 'Protection contre le démarrage en prise' },
        { id: 60, label: 'Présence et essai des coupes circuit "bracelet"' },
        { id: 61, label: 'Rotation tribord/bâbord (réglage de direction)' },
        { id: 62, label: 'Jeu dans la direction' },
        { id: 63, label: "Fuites d'huile sur vérins de relevage (et éventuellement direction)" },
        { id: 64, label: 'Essais de relevage/descente du (des) moteur(s) (et trim)' },
        { id: 65, label: 'Vérification factures : vidange embase(s), moteurs, filtre(s) à carburant, turbines' },
        { id: 66, label: 'État des anodes internes et externes (aileron de compensation), des hélices' },
        { id: 67, label: 'État de la (des) béquille(s)/dérive(s)' },
        { id: 68, label: "État de la partie basse de(s) l'embase(s), présence d'algues, …" },
      ],
    },
    {
      title: 'PONT/COCKPIT',
      items: [
        { id: 69, label: 'Balcons et mains courantes (fixation, jeu, corrosion, …)' },
        { id: 70, label: 'Baille à mouillage, davier, ancre, chaîne' },
        { id: 71, label: 'Taquets et chaumards' },
        { id: 72, label: 'État des amarres et défenses' },
        { id: 73, label: 'État des vitrages (fissures, faillançage, UV) et des encadrements' },
      ],
    },
  ],

  motor_yacht: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: "Numéro d'identification gravé sur la coque" },
        { id: 3, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 4, label: "Présentation des factures d'entretiens et réparation 4 dernières années" },
        { id: 5, label: 'Présence manuel utilisateur bateau, moteur et équipements' },
      ],
    },
    {
      title: 'STRUCTURES/FONDS/ŒUVRES VIVES',
      items: [
        { id: 6, label: "Présence d'eau (préciser douce ou salée) ou d'huile dans les fonds" },
        { id: 7, label: 'Fissures sur les varangues et longerons' },
        { id: 8, label: 'Présence de délaminages' },
        { id: 9, label: 'Fissures ou décollement liaisons cloisons/coque-pont' },
        { id: 10, label: 'Fixation des meubles' },
        { id: 11, label: 'Fissures sur le(s) bâti(s) moteur(s)' },
        { id: 12, label: 'Présence des bouchons de sondes de navigation' },
      ],
    },
    {
      title: 'PLOMBERIE',
      items: [
        { id: 13, label: 'Fonctionnement de la pompe de cale manuelle et électrique' },
        { id: 14, label: "Corrosion sur passes coques et vannes de salle d'eau et cuisine" },
        { id: 15, label: "Essai d'ouverture/fermeture vannes de salle d'eau et cuisine" },
        { id: 16, label: 'Présence de 2 colliers sur tous les passes coques' },
        { id: 17, label: "Mise sous pression du circuit d'eau douce, contrôle des fuites" },
        { id: 18, label: 'Essai de coupure du gaz (vanne)' },
        { id: 19, label: 'Date de validité du tuyau souple' },
        { id: 20, label: "Contrôle visuel des réservoirs d'eau douce et tuyauteries" },
        { id: 21, label: "Présence d'un réservoir d'eaux noires" },
        { id: 22, label: 'Fonctionnement du (des) WC' },
      ],
    },
    {
      title: 'ÉLECTRICITÉ ET ÉLECTRONIQUE',
      items: [
        { id: 23, label: 'Tension de batterie(s) de service et moteurs' },
        { id: 24, label: 'Contrôle de la tension de charge (chargeur quai)' },
        { id: 25, label: "Contrôle de la production d'eau chaude" },
        { id: 26, label: 'État des coupes batteries' },
        { id: 27, label: 'Examen visuel des connexions du tableau électrique et fusibles DC' },
        { id: 28, label: 'Examen visuel des connexions de batteries' },
        { id: 29, label: 'Fixation des batteries dans un coffre ventilé' },
        { id: 30, label: 'Vérification factures : date de remplacement des batteries' },
        { id: 31, label: 'Contrôle de tous les feux de navigation et de mouillage' },
        { id: 32, label: 'Circuit 220V (disjoncteur différentiel, disjoncteurs de distribution)' },
      ],
    },
    {
      title: 'MOTEUR(S) IN BORD',
      items: [
        { id: 33, label: 'Marque, modèle, puissance et année, conformité et homologation' },
        { id: 34, label: "Nombre d'heures moteur (s)" },
        { id: 35, label: 'Nable(s) et évent(s) : état et fonctionnement' },
        { id: 36, label: 'Fixation et état du réservoir à carburant, des durites et colliers' },
        { id: 37, label: "Essai d'ouverture/fermeture vanne(s) moteur(s)" },
        { id: 38, label: 'Préfiltre(s) décanteur(s)/séparateur(s)' },
        { id: 39, label: 'État des silent-blocks' },
        { id: 40, label: "Présence de fuites d'huile sur le(s) moteur(s), propreté" },
        { id: 41, label: 'Traces de sel autour de la (des) pompes à eau' },
        { id: 42, label: "Présence d'huile sous la (les) gatte(s) moteur(s)" },
        { id: 43, label: 'Corrosion sur passe(s) coque et vanne(s) moteur(s)' },
        { id: 44, label: "Niveaux d'huile et glycol si échangeur" },
        { id: 45, label: 'Contrôle des courroies' },
        { id: 46, label: 'Démarrage moteur(s), contrôle température et fumée, arrêt' },
        { id: 47, label: "Contrôle de la charge alternateur(s)" },
        { id: 48, label: 'Vérification factures : vidange(s), filtres, turbines, anodes' },
        { id: 49, label: 'Vérification factures : coude(s) antisiphon' },
      ],
    },
    {
      title: "TRANSMISSION(S) IN BORD ET APPAREIL À GOUVERNER",
      items: [
        { id: 50, label: 'Essai en charge avant/arrière inverseur(s), réglage(s), vibrations' },
        { id: 51, label: "Fissures sur tube(s) d'étambot(s) et renforts" },
        { id: 52, label: "Contrôle en charge arbre(s) d'hélice(s) vs le tube d'étambot" },
        { id: 53, label: "Contrôle de l'étanchéité/lubrification joint(s) d'étambot(s)" },
        { id: 54, label: 'Ou essai relevage/descente de (des) l\'embase(s)' },
        { id: 55, label: 'Contrôle visuel parties émergées embase(s), joint(s), soufflets' },
        { id: 56, label: 'Vérification factures : entretien embase(s) (soufflets,...)presse-étoupe' },
        { id: 57, label: 'Contrôle visuel de (des) hélice(s)' },
        { id: 58, label: 'Si doubles commandes, essais des commandes du Fly Bridge' },
        { id: 59, label: 'Essais de barre de butée à butée, jeu dans la barre (ou point dur)' },
        { id: 60, label: 'Fixation du rudder pilote' },
      ],
    },
    {
      title: 'OU MOTEUR(S) HORS BORD',
      items: [
        { id: 61, label: 'Marque, modèle, puissance et année, conformité et homologation' },
        { id: 62, label: "Nombre d'heures moteur (s)" },
        { id: 63, label: 'Nable(s) et évent(s) : état et fonctionnement' },
        { id: 64, label: 'Fixation et état du réservoir à carburant' },
        { id: 65, label: 'État des durites et colliers' },
        { id: 66, label: "Essai d'ouverture/fermeture vanne(s) moteur(s)" },
        { id: 67, label: 'Préfiltre(s) décanteur(s)/séparateur(s)' },
        { id: 68, label: 'État général extérieur du (des) moteur(s) (peinture, corrosion)' },
        { id: 69, label: 'État de la (des) tête(s) motrice(s) et de ses périphériques' },
        { id: 70, label: 'État des boulons de fixation' },
        { id: 71, label: 'Démarrage moteur(s), contrôle température(s) et fumée, arrêt' },
        { id: 72, label: 'Contrôle de la (des) "pissette(s)" de refroidissement' },
        { id: 73, label: 'Contrôle de la charge batterie(s)' },
        { id: 74, label: "Essai d'embrayage avant/arrière et retour point mort" },
        { id: 75, label: 'Protection contre le démarrage en prise' },
        { id: 76, label: 'Présence et essai des coupes circuit "bracelet"' },
        { id: 77, label: 'Rotation tribord/bâbord (réglage de direction)' },
        { id: 78, label: 'Jeu dans la direction' },
        { id: 79, label: "Fuites d'huile sur vérins de relevage (et éventuellement direction)" },
        { id: 80, label: 'Essais de relevage/descente du (des) moteur(s) (et trim)' },
        { id: 81, label: 'Vérification factures : vidange embase(s)moteurs, filtre(s) à carburant,' },
        { id: 82, label: 'Vérification factures : turbine(s)/impeller(s) de refroidissement' },
        { id: 83, label: 'État des anodes internes et externes (aileron de compensation)' },
        { id: 84, label: 'État de(s) l\'hélice(s)' },
        { id: 85, label: 'État de la (des) béquille(s)/dérive(s)' },
        { id: 86, label: "État de la partie basse de(s) l'embase(s), présenced'algues, …" },
      ],
    },
    {
      title: "PROPULSEUR D'ÉTRAVE ET FLAPS",
      items: [
        { id: 87, label: "Contrôle de l'étanchéité sous couchette avant (tube et moteur)" },
        { id: 88, label: 'Localisation du disjoncteur de puissance' },
        { id: 89, label: 'Essai tribord/bâbord' },
        { id: 90, label: 'Fonctionnement Flap tribord & tribord' },
      ],
    },
    {
      title: 'PONT',
      items: [
        { id: 91, label: 'Balcons et mains courantes (fixation, jeu, corrosion, …)' },
        { id: 92, label: 'État et fonctionnement du guindeau' },
        { id: 93, label: 'Baille à mouillage, davier, ancre, chaîne' },
        { id: 94, label: 'Taquets et chaumards' },
        { id: 95, label: 'État des amarres et défenses' },
        { id: 96, label: 'État des vitrages (fissures, faillançage, UV) et des encadrements' },
        { id: 97, label: 'Fermetures des hublots de coque et panneaux de pont' },
        { id: 98, label: 'Étanchéité accastillage, hublots, panneaux contrôle visuel' },
        { id: 99, label: 'Étanchéité liaison pont-coque (contrôle par arrosage)' },
        { id: 100, label: 'Bossoirs' },
      ],
    },
    {
      title: 'CONTRÔLES SI NAVIRE À TERRE',
      items: [
        { id: 101, label: 'Chocs sur la coque, traces de réparation' },
        { id: 102, label: 'Jeu mèche(s) de gouvernail(s)' },
        { id: 103, label: 'Hélice(s) (corrosion, état de surface, coups)' },
        { id: 104, label: 'Transmission(s) Z-drive (corrosion, propreté, soufflets,…)' },
        { id: 105, label: "Ou de(s) l'arbre(s) d'hélice(s), chaise(s) d'arbre(s), bague(s) hydro." },
        { id: 106, label: 'Flaps, anodes, crépines de refroidissement, passes-coque' },
        { id: 107, label: 'Tunnel de propulseur, hélice, protections' },
      ],
    },
  ],

  yacht: [
    {
      title: 'TRAÇABILITÉ',
      items: [
        { id: 1, label: 'Présence et validité de la carte de circulation/acte de francisation' },
        { id: 2, label: "Numéro d'identification gravé sur la coque" },
        { id: 3, label: 'Plaque constructeur présente, conforme et lisible' },
        { id: 4, label: "Présentation des factures d'entretiens et réparation 4 dernières années" },
        { id: 5, label: 'Présence manuel utilisateur bateau, moteur et équipements' },
      ],
    },
    {
      title: 'INSPECTION GÉNÉRALE',
      items: [
        { id: 6, label: 'État général de la coque et du pont' },
        { id: 7, label: 'Systèmes de luxe et confort' },
        { id: 8, label: 'Électronique de navigation avancée' },
        { id: 9, label: 'Systèmes de divertissement' },
        { id: 10, label: 'Aménagements intérieurs haut de gamme' },
      ],
    },
  ],

  division_227_general: [
    {
      title: 'IDENTIFICATION ET DOCUMENTATION',
      items: [
        { id: 1, label: 'Acte de francisation et titre de navigation valide' },
        { id: 2, label: 'Certificat de jauge et marques de jauge' },
        { id: 3, label: 'Certificat de sécurité (navire à passagers, navire de charge)' },
        { id: 4, label: 'Certificat de prévention de la pollution (MARPOL)' },
        { id: 5, label: 'Permis de navigation et permis de circulation' },
        { id: 6, label: 'Rôle d\'équipage à jour' },
        { id: 7, label: 'Journal de bord et registre des opérations' },
        { id: 8, label: 'Plan de sécurité du navire (ISM/ISPS si applicable)' },
      ],
    },
    {
      title: 'STRUCTURE COQUE ET STABILITÉ',
      items: [
        { id: 9, label: 'État de la coque - présence de fissures, déformation, corrosion' },
        { id: 10, label: 'Inspection des œuvres vives et carène' },
        { id: 11, label: 'État des cloisons étanches et portes de cloisons' },
        { id: 12, label: 'Compartimentage et dispositifs de prévention d\'envahissement' },
        { id: 13, label: 'Système de ballast et contrôle de la stabilité' },
        { id: 14, label: 'Lignes de charge - marques visibles et respectées' },
        { id: 15, label: 'Plan de chargement et calculs de stabilité disponibles' },
      ],
    },
    {
      title: 'APPAREIL PROPULSIF ET MACHINES',
      items: [
        { id: 16, label: 'Moteur principal - état général, corrosion, fuites' },
        { id: 17, label: 'Système de refroidissement et pompes' },
        { id: 18, label: 'Circuit carburant - réservoirs, tuyauteries, vannes' },
        { id: 19, label: 'Circuit d\'huile - niveau, fuites, filtres' },
        { id: 20, label: 'Ligne d\'arbre et paliers' },
        { id: 21, label: 'Hélice et gouvernail - état et jeu' },
        { id: 22, label: 'Groupes électrogènes et auxiliaires' },
        { id: 23, label: 'Moteur de secours si requis' },
        { id: 24, label: 'Registres d\'entretien et historique de maintenance' },
      ],
    },
    {
      title: 'SÉCURITÉ INCENDIE',
      items: [
        { id: 25, label: 'Détecteurs de fumée et d\'incendie' },
        { id: 26, label: 'Extincteurs - type, nombre, emplacement, date de validité' },
        { id: 27, label: 'Système fixe d\'extinction (CO2, mousse, eau)' },
        { id: 28, label: 'Volets et clapets coupe-feu' },
        { id: 29, label: 'Exercices incendie - trace écrite et formation équipage' },
        { id: 30, label: 'Plan de lutte contre l\'incendie affiché' },
        { id: 31, label: 'Équipement du pompier (tenue, ARI)' },
      ],
    },
    {
      title: 'SAUVETAGE ET ENGINS DE SAUVETAGE',
      items: [
        { id: 32, label: 'Radeaux de sauvetage - capacité, validité des contrôles' },
        { id: 33, label: 'Embarcations de sauvetage et canots de secours' },
        { id: 34, label: 'Brassières et combinaisons de survie - nombre et état' },
        { id: 35, label: 'Bouées de sauvetage avec ligne et feu autoallumant' },
        { id: 36, label: 'Signaux de détresse (fusées, fumigènes)' },
        { id: 37, label: 'Dispositifs de mise à l\'eau (bossoirs, rampes)' },
        { id: 38, label: 'Exercices d\'abandon - trace écrite' },
      ],
    },
    {
      title: 'NAVIGATION ET COMMUNICATION',
      items: [
        { id: 39, label: 'Compas magnétique principal et de secours' },
        { id: 40, label: 'Système GPS et positionnement électronique' },
        { id: 41, label: 'Radar et ARPA si requis' },
        { id: 42, label: 'AIS (Automatic Identification System)' },
        { id: 43, label: 'VHF et installations radio GMDSS' },
        { id: 44, label: 'EPIRB (balise de détresse satellite)' },
        { id: 45, label: 'SART (transpondeur radar de recherche)' },
        { id: 46, label: 'Cartes marines à jour et publications nautiques' },
        { id: 47, label: 'Feux et marques de navigation - fonctionnement' },
      ],
    },
    {
      title: 'PRÉVENTION DE LA POLLUTION',
      items: [
        { id: 48, label: 'Registre des hydrocarbures (Oil Record Book)' },
        { id: 49, label: 'Installations de traitement des eaux usées' },
        { id: 50, label: 'Gestion des ordures et déchets (MARPOL Annexe V)' },
        { id: 51, label: 'Séparateur d\'eau mazouteuse et dispositif de rejet' },
        { id: 52, label: 'Plan d\'urgence de bord en cas de pollution' },
        { id: 53, label: 'Matériel de lutte antipollution (barrages, absorbants)' },
      ],
    },
    {
      title: 'CONDITIONS DE TRAVAIL ET HABITABILITÉ',
      items: [
        { id: 54, label: 'Logements de l\'équipage - aération, éclairage, chauffage' },
        { id: 55, label: 'Installations sanitaires et eau potable' },
        { id: 56, label: 'Cuisine et réfectoire - hygiène et équipements' },
        { id: 57, label: 'Protection contre le bruit et les vibrations' },
        { id: 58, label: 'Conformité aux conventions du travail maritime (MLC 2006)' },
      ],
    },
    {
      title: 'CONTRÔLES RÉGLEMENTAIRES',
      items: [
        { id: 59, label: 'Visites de mise en service et visites périodiques à jour' },
        { id: 60, label: 'Inspection par société de classification (si applicable)' },
        { id: 61, label: 'Port State Control - historique des inspections' },
        { id: 62, label: 'Conformité aux directives de l\'OMI' },
        { id: 63, label: 'Document de conformité ISM (si applicable)' },
        { id: 64, label: 'Certificat de sûreté ISPS (si applicable)' },
      ],
    },
  ],
};
