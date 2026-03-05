<?php
require_once __DIR__ . '/config.php';

// Configuration
$config = [
    'to'      => MAIL_TO,
    'from'    => 'noreply@qhubegh.cluster121.hosting.ovh.net',
    'subject' => 'Nouvelle demande de devis',
];

header('Content-Type: text/plain; charset=utf-8');

// Refuser toute méthode autre que POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Méthode non autorisée.');
}

// --- Nettoyage ---
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// --- Fréquences lisibles ---
$freq_labels = [
    '1-in-week' => '1 fois par semaine',
    '2-in-week' => '2 fois par semaine',
    '3-in-week' => '3 fois par semaine',
    '4-in-week' => '4 fois par semaine',
    '5-in-week' => '5 fois par semaine',
    'all-days'  => 'Tous les jours',
];

// --- Step 1 : Résidence ---
$nb_logements  = clean($_POST['nb_logements']  ?? '');
$nb_batiments  = clean($_POST['nb_batiments']  ?? '');
$nb_etages     = clean($_POST['nb_etages']     ?? '');
$ascenseur     = clean($_POST['ascenseur']      ?? '');
$parking       = clean($_POST['parking']        ?? '');
$nb_niveaux    = clean($_POST['nb_niveaux']    ?? '');
$nb_poubelles  = clean($_POST['nb_poubelles']  ?? '');

// --- Step 2 : Fréquences ---
$freq_entretien_raw = clean($_POST['freq_entretien'] ?? '');
$freq_collecte_raw  = clean($_POST['freq_collecte']  ?? '');
$freq_entretien     = $freq_labels[$freq_entretien_raw] ?? $freq_entretien_raw;
$freq_collecte      = $freq_labels[$freq_collecte_raw]  ?? $freq_collecte_raw;

// --- Step 3 : Informations ---
$prenom    = clean($_POST['prenom']    ?? '');
$nom       = clean($_POST['nom']       ?? '');
$email     = trim($_POST['email']      ?? '');
$telephone = clean($_POST['telephone'] ?? '');
$adresse   = clean($_POST['adresse']   ?? '');
$cpville   = clean($_POST['cpville']   ?? '');
$syndic    = clean($_POST['syndic']    ?? '');
$gdpr      = isset($_POST['gdpr']) ? true : false;

// --- Validation ---
$errors = [];

// Step 1
if (empty($nb_logements) || !is_numeric($nb_logements) || (int)$nb_logements < 1)
    $errors[] = 'Nombre de logements invalide.';
if (empty($nb_batiments) || !is_numeric($nb_batiments) || (int)$nb_batiments < 1)
    $errors[] = 'Nombre de bâtiments invalide.';
if (!isset($_POST['nb_etages']) || $_POST['nb_etages'] === '')
    $errors[] = "Nombre d'étages manquant.";
if (!in_array($ascenseur, ['oui', 'non']))
    $errors[] = 'Ascenseur : choix invalide.';
if (!in_array($parking, ['oui', 'non']))
    $errors[] = 'Parking : choix invalide.';

// Step 2
if (!array_key_exists($freq_entretien_raw, $freq_labels))
    $errors[] = "Fréquence d'entretien invalide.";
if (!array_key_exists($freq_collecte_raw, $freq_labels))
    $errors[] = 'Fréquence de collecte invalide.';

// Step 3
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
    $errors[] = 'Email invalide.';
if (empty($telephone) || !preg_match('/^[\d\s\-\+]{10,}$/', $telephone))
    $errors[] = 'Téléphone invalide.';
if (empty($adresse))
    $errors[] = 'Adresse manquante.';
if (empty($cpville))
    $errors[] = 'CP et Ville manquants.';
if (!$gdpr)
    $errors[] = 'Le consentement GDPR est requis.';

if (!empty($errors)) {
    http_response_code(422);
    exit(implode(' ', $errors));
}

// --- Sanitize email ---
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// --- Construction du mail ---
$corps  = "Nouvelle demande de devis reçue depuis le site.\n";
$corps .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$corps .= "[ VOTRE RÉSIDENCE ]\n\n";
$corps .= "Nb de logements          : $nb_logements\n";
$corps .= "Nb de bâtiment(s)        : $nb_batiments\n";
$corps .= "Nb d'étage(s) (moy.)     : $nb_etages\n";
$corps .= "Ascenseur                : $ascenseur\n";
$corps .= "Parking                  : $parking\n";
if ($nb_niveaux !== '') $corps .= "Nb de niveaux parking    : $nb_niveaux\n";
if ($nb_poubelles !== '') $corps .= "Nb de locaux poubelles   : $nb_poubelles\n";

$corps .= "\n[ QUESTION DE FRÉQUENCE ]\n\n";
$corps .= "Entretien parties communes : $freq_entretien\n";
$corps .= "Collecte containers        : $freq_collecte\n";

$corps .= "\n[ VOS INFORMATIONS ]\n\n";
if ($prenom || $nom) $corps .= "Nom / Prénom : $prenom $nom\n";
$corps .= "Email        : $email\n";
$corps .= "Téléphone    : $telephone\n";
$corps .= "Adresse      : $adresse\n";
$corps .= "CP et Ville  : $cpville\n";
if ($syndic) $corps .= "Syndic       : $syndic\n";
$corps .= "\nConsentement GDPR : OUI\n";

$headers  = "From: {$config['from']}\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// --- Envoi ---
if (mail($config['to'], $config['subject'], $corps, $headers)) {
    http_response_code(200);
    exit('Votre demande de devis a bien été envoyée.');
} else {
    http_response_code(500);
    exit('Échec de l\'envoi. Veuillez réessayer.');
}
?>