<?php
header("Content-Type: application/json; charset=utf-8");

define("DEST_EMAIL", "xxx@gmail.com");
define("SITE_NAME", "Copronet TEST");
define("FROM_EMAIL", "noreply@" . $_SERVER["HTTP_HOST"]); // Important !

function sanitize($data)
{
    return htmlspecialchars(strip_tags(trim($data)), ENT_QUOTES, "UTF-8");
}

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    echo json_encode([
        "success" => false,
        "message" => "Méthode non autorisée",
    ]);
    exit();
}

$prenom = sanitize($_POST["prenom"] ?? "");
$nom = sanitize($_POST["nom"] ?? "");
$email = sanitize($_POST["email"] ?? "");
$telephone = sanitize($_POST["telephone"] ?? "");
$adresse = sanitize($_POST["adresse"] ?? "");
$cpville = sanitize($_POST["cpville"] ?? "");
$syndic = sanitize($_POST["syndic"] ?? "");
$message = sanitize($_POST["message"] ?? "");

if (
    empty($prenom) ||
    empty($nom) ||
    empty($email) ||
    empty($telephone) ||
    empty($cpville) ||
    empty($message)
) {
    echo json_encode([
        "success" => false,
        "message" => "Champs obligatoires manquants",
    ]);
    exit();
}

// Headers corrects (crucial pour mail())
$headers = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: " . SITE_NAME . " <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion();

// Email admin
$subject_admin = "Nouveau contact - " . SITE_NAME;
$body_admin = "Prénom : $prenom\nNom : $nom\nEmail : $email\nTéléphone : $telephone\nCP/Ville : $cpville\n\nMessage :\n$message";

$mail1 = @mail(DEST_EMAIL, $subject_admin, $body_admin, $headers);

// Email user
$subject_user = "Confirmation - " . SITE_NAME;
$body_user =
    "Bonjour $prenom,\n\nNous avons bien reçu votre message.\n\nCordialement,\n" .
    SITE_NAME;

$mail2 = @mail($email, $subject_user, $body_user, $headers);

echo json_encode([
    "success" => $mail1 && $mail2,
    "message" => $mail1 && $mail2 ? "Message envoyé !" : "Erreur serveur mail",
    "debug" => ["mail1" => $mail1, "mail2" => $mail2], // Retire en prod
]);
?>
