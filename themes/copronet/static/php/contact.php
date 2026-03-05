<?php
require_once __DIR__ . '/config.php';

// Configuration
$config = [
    'to'      => MAIL_TO,
    'from'    => 'noreply@qhubegh.cluster121.hosting.ovh.net',
    'subject' => 'Nouveau message de contact',
];

// Headers CORS si nécessaire (Hugo dev server sur un autre port)
// header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain; charset=utf-8');

// Refuser toute méthode autre que POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Méthode non autorisée.');
}

// --- Récupération et nettoyage des champs ---
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

$prenom    = clean($_POST['prenom']    ?? '');
$nom       = clean($_POST['nom']       ?? '');
$email     = trim($_POST['email']      ?? '');
$telephone = clean($_POST['telephone'] ?? '');
$message   = clean($_POST['message']   ?? '');

// --- Validation ---
$errors = [];

if (empty($prenom))                          $errors[] = 'Prénom manquant.';
if (empty($nom))                             $errors[] = 'Nom manquant.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL))
                                             $errors[] = 'Email invalide.';
if (empty($telephone) || !preg_match('/^[\d\s\-\+]{10,}$/', $telephone))
                                             $errors[] = 'Téléphone invalide.';
if (empty($message))                         $errors[] = 'Message manquant.';

if (!empty($errors)) {
    http_response_code(422);
    exit(implode(' ', $errors));
}

// --- Protection anti-injection dans les headers ---
$email = filter_var($email, FILTER_SANITIZE_EMAIL);

// --- Construction du mail ---
$corps  = "Nouveau message reçu depuis le formulaire de contact.\n";
$corps .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";
$corps .= "Prénom    : $prenom\n";
$corps .= "Nom       : $nom\n";
$corps .= "Email     : $email\n";
$corps .= "Téléphone : $telephone\n\n";
$corps .= "Message :\n$message\n";

$headers  = "From: {$config['from']}\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// --- Envoi ---
if (mail($config['to'], $config['subject'], $corps, $headers)) {
    http_response_code(200);
    exit('Message envoyé.');
} else {
    http_response_code(500);
    exit('Échec de l\'envoi. Veuillez réessayer.');
}
?>
