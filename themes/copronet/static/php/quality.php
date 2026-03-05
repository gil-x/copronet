<?php
require_once __DIR__ . '/config.php';

// Configuration
$config = [
    'to'      => MAIL_TO,
    'from'    => 'noreply@qhubegh.cluster121.hosting.ovh.net',
    'subject' => 'Rapport de visite',
];

header('Content-Type: text/plain; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Méthode non autorisée.');
}

// --- Nettoyage ---
function clean(string $value): string {
    return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// Valeurs autorisées pour les radios Bien/Moyen/Mauvais
$bmm    = ['bien', 'moyen', 'mauvais'];
$bmi    = ['impeccable', 'bon', 'correct', 'mauvais'];

function radio(string $name, array $allowed): string {
    $val = clean($_POST[$name] ?? '');
    return in_array($val, $allowed) ? ucfirst($val) : '—';
}

// --- INFORMATIONS GÉNÉRALES ---
$date_visite    = clean($_POST['date_visite']    ?? '');
$jours_passage  = clean($_POST['jours_passage']  ?? '');
$superviseur    = clean($_POST['superviseur']     ?? '');
$photos         = radio('photos', ['oui', 'non']);

// --- AGENT / ÉQUIPE ---
$nom_agent      = clean($_POST['nom_agent']      ?? '');
$matricule      = clean($_POST['matricule']      ?? '');
$ponctualite    = radio('ponctualite',    $bmm);
$port_tenue     = radio('port_tenue',     $bmm);
$respect_binome = radio('respect_binome', $bmm);

// --- IMMEUBLE ---
$nom_immeuble   = clean($_POST['nom_immeuble']   ?? '');
$adresse        = clean($_POST['adresse']        ?? '');
$etat_immeuble  = radio('etat_immeuble', $bmi);

// --- PRESTATIONS ---
// Conteneurs
$local_poubelle          = radio('local_poubelle',          $bmm);
$desinfection_conteneurs = radio('desinfection_conteneurs', $bmm);
$entree_sortie_conteneurs= radio('entree_sortie_conteneurs',$bmm);
// Hall(s)
$proprete_exterieure     = radio('proprete_exterieure',     $bmm);
$portes_acces            = radio('portes_acces',            $bmm);
$boite_lettres           = radio('boite_lettres',           $bmm);
$interrupteurs_hall      = radio('interrupteurs_hall',      $bmm);
$corbeille_papiers       = radio('corbeille_papiers',       $bmm);
$cuivre                  = radio('cuivre',                  $bmm);
$plinthes_boiseries_hall = radio('plinthes_boiseries_hall', $bmm);
$tapis_hall              = radio('tapis_hall',              $bmm);
$sols_hall               = radio('sols_hall',               $bmm);
// Ascenseur(s)
$ascenseur_porte         = radio('ascenseur_porte',         $bmm);
$ascenseur_miroir        = radio('ascenseur_miroir',        $bmm);
$ascenseur_parois        = radio('ascenseur_parois',        $bmm);
$ascenseur_sol           = radio('ascenseur_sol',           $bmm);
// Escalier(s)
$escalier_rampe          = radio('escalier_rampe',          $bmm);
$escalier_barreaudage    = radio('escalier_barreaudage',    $bmm);
$escalier_plinthes       = radio('escalier_plinthes',       $bmm);
$marches_balayage        = radio('marches_balayage',        $bmm);
$marches_cirage          = radio('marches_cirage',          $bmm);
// Paliers
$vitrerie                = radio('vitrerie',                $bmm);
$palier_plinthes         = radio('palier_plinthes',         $bmm);
$rebords_fenetres        = radio('rebords_fenetres',        $bmm);
$interrupteurs_palier    = radio('interrupteurs_palier',    $bmm);
$palier_sols             = radio('palier_sols',             $bmm);
$tapis_residents         = radio('tapis_residents',         $bmm);
// Divers
$acces_caves             = radio('acces_caves',             $bmm);
$remplacement_lumineux   = radio('remplacement_lumineux',   $bmm);
$proprete_lumineux       = radio('proprete_lumineux',       $bmm);
$proprete_cour           = radio('proprete_cour',           $bmm);
$toiles_araignees        = radio('toiles_araignees',        $bmm);
$rangement_local         = radio('rangement_local',         $bmm);
$acces_parking           = radio('acces_parking',           $bmm);

// --- SIGNATURES ---
$nom_representant = clean($_POST['nom_representant'] ?? '');
$nom_salarie      = clean($_POST['nom_salarie']      ?? '');

// --- Validation des champs obligatoires ---
$errors = [];
if (empty($date_visite))   $errors[] = 'Date de visite manquante.';
if (empty($superviseur))   $errors[] = 'Superviseur manquant.';
if (empty($nom_agent))     $errors[] = "Nom de l'agent manquant.";
if (empty($nom_immeuble))  $errors[] = "Nom de l'immeuble manquant.";

// Validation format date
if (!empty($date_visite) && !preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_visite)) {
    $errors[] = 'Format de date invalide.';
}

if (!empty($errors)) {
    http_response_code(422);
    exit(implode(' ', $errors));
}

// Formater la date en français
$date_fr = $date_visite;
if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $date_visite)) {
    $d = DateTime::createFromFormat('Y-m-d', $date_visite);
    if ($d) $date_fr = $d->format('d/m/Y');
}

// --- Construction du mail ---
$col = 42; // largeur colonne gauche

function ligne(string $label, string $valeur, int $col): string {
    return str_pad($label, $col) . ": $valeur\n";
}

$corps  = "RAPPORT DE VISITE\n";
$corps .= "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n";

$corps .= "[ INFORMATIONS GÉNÉRALES ]\n\n";
$corps .= ligne("Date de la visite",           $date_fr,       $col);
$corps .= ligne("Superviseur",                 $superviseur,   $col);
if ($jours_passage) $corps .= ligne("Jour(s) de passage au contrat", $jours_passage, $col);
$corps .= ligne("Photo(s) prise(s)",           $photos,        $col);

$corps .= "\n[ AGENT / ÉQUIPE ]\n\n";
$corps .= ligne("Nom et prénom de l'agent",    $nom_agent,     $col);
if ($matricule) $corps .= ligne("Matricule",   $matricule,     $col);
$corps .= ligne("Ponctualité",                 $ponctualite,   $col);
$corps .= ligne("Port de la tenue",            $port_tenue,    $col);
$corps .= ligne("Respect du binôme",           $respect_binome,$col);

$corps .= "\n[ IMMEUBLE ]\n\n";
$corps .= ligne("Nom de l'immeuble",           $nom_immeuble,  $col);
if ($adresse) $corps .= ligne("Adresse",       $adresse,       $col);
$corps .= ligne("État général",                $etat_immeuble, $col);

$corps .= "\n[ ÉVALUATION DES PRESTATIONS ]\n\n";

$corps .= "  Conteneurs\n";
$corps .= ligne("  Nettoyage du local poubelle",          $local_poubelle,           $col);
$corps .= ligne("  Nettoyage et désinfection conteneurs", $desinfection_conteneurs,  $col);
$corps .= ligne("  Entrée et sortie des conteneurs",      $entree_sortie_conteneurs, $col);

$corps .= "\n  Hall(s)\n";
$corps .= ligne("  Propreté extérieure (abords)",         $proprete_exterieure,      $col);
$corps .= ligne("  Portes, plaques, digicode",            $portes_acces,             $col);
$corps .= ligne("  Boîte aux lettres",                    $boite_lettres,            $col);
$corps .= ligne("  Interrupteurs",                        $interrupteurs_hall,       $col);
$corps .= ligne("  Corbeille à papiers",                  $corbeille_papiers,        $col);
$corps .= ligne("  Cuivre",                               $cuivre,                   $col);
$corps .= ligne("  Plinthes et boiseries",                $plinthes_boiseries_hall,  $col);
$corps .= ligne("  Tapis",                                $tapis_hall,               $col);
$corps .= ligne("  Sols",                                 $sols_hall,                $col);

$corps .= "\n  Ascenseur(s)\n";
$corps .= ligne("  Porte",                                $ascenseur_porte,          $col);
$corps .= ligne("  Miroir",                               $ascenseur_miroir,         $col);
$corps .= ligne("  Parois + platine",                     $ascenseur_parois,         $col);
$corps .= ligne("  Sol + rail",                           $ascenseur_sol,            $col);

$corps .= "\n  Escalier(s)\n";
$corps .= ligne("  Rampe",                                $escalier_rampe,           $col);
$corps .= ligne("  Barreaudage",                          $escalier_barreaudage,     $col);
$corps .= ligne("  Plinthes et boiseries",                $escalier_plinthes,        $col);
$corps .= ligne("  Marches (balayage/aspiration)",        $marches_balayage,         $col);
$corps .= ligne("  Marches (cirage)",                     $marches_cirage,           $col);

$corps .= "\n  Paliers\n";
$corps .= ligne("  Vitrerie et encadrement fenêtres",     $vitrerie,                 $col);
$corps .= ligne("  Plinthes et boiseries",                $palier_plinthes,          $col);
$corps .= ligne("  Rebords de fenêtres",                  $rebords_fenetres,         $col);
$corps .= ligne("  Interrupteurs",                        $interrupteurs_palier,     $col);
$corps .= ligne("  Sols",                                 $palier_sols,              $col);
$corps .= ligne("  Tapis des résidents",                  $tapis_residents,          $col);

$corps .= "\n  Divers\n";
$corps .= ligne("  Propreté des accès caves",             $acces_caves,              $col);
$corps .= ligne("  Remplacement des points lumineux",     $remplacement_lumineux,    $col);
$corps .= ligne("  Propreté des points lumineux",         $proprete_lumineux,        $col);
$corps .= ligne("  Propreté cour ou courette",            $proprete_cour,            $col);
$corps .= ligne("  Toiles d'araignées",                   $toiles_araignees,         $col);
$corps .= ligne("  Rangement et propreté du local",       $rangement_local,          $col);
$corps .= ligne("  Propreté des accès parking",           $acces_parking,            $col);

$corps .= "\n[ SIGNATURES ]\n\n";
if ($nom_representant) $corps .= ligne("Représentant syndical / syndic", $nom_representant, $col);
if ($nom_salarie)      $corps .= ligne("Nom du salarié",                 $nom_salarie,      $col);

// --- Construction du CSV ---
function csv_row(array $fields): string {
    return implode(';', array_map(function($f) {
        // Encapsuler dans des guillemets, échapper les guillemets internes
        return '"' . str_replace('"', '""', $f) . '"';
    }, $fields)) . "\r\n";
}

// BOM UTF-8 pour compatibilité Excel
$csv  = "\xEF\xBB\xBF";

// En-têtes
$csv .= csv_row(['Catégorie', 'Champ', 'Valeur']);

// Données
$csv .= csv_row(['Informations générales', 'Date de la visite',              $date_fr]);
$csv .= csv_row(['Informations générales', 'Superviseur',                    $superviseur]);
$csv .= csv_row(['Informations générales', 'Jour(s) de passage au contrat',  $jours_passage]);
$csv .= csv_row(['Informations générales', 'Photo(s) prise(s)',              $photos]);

$csv .= csv_row(['Agent / Équipe', "Nom et prénom de l'agent", $nom_agent]);
$csv .= csv_row(['Agent / Équipe', 'Matricule',                $matricule]);
$csv .= csv_row(['Agent / Équipe', 'Ponctualité',              $ponctualite]);
$csv .= csv_row(['Agent / Équipe', 'Port de la tenue',         $port_tenue]);
$csv .= csv_row(['Agent / Équipe', 'Respect du binôme',        $respect_binome]);

$csv .= csv_row(['Immeuble', "Nom de l'immeuble", $nom_immeuble]);
$csv .= csv_row(['Immeuble', 'Adresse',           $adresse]);
$csv .= csv_row(['Immeuble', 'État général',      $etat_immeuble]);

$csv .= csv_row(['Conteneurs', 'Nettoyage du local poubelle',          $local_poubelle]);
$csv .= csv_row(['Conteneurs', 'Nettoyage et désinfection conteneurs', $desinfection_conteneurs]);
$csv .= csv_row(['Conteneurs', 'Entrée et sortie des conteneurs',      $entree_sortie_conteneurs]);

$csv .= csv_row(['Hall(s)', 'Propreté extérieure (abords)',  $proprete_exterieure]);
$csv .= csv_row(['Hall(s)', 'Portes, plaques, digicode',     $portes_acces]);
$csv .= csv_row(['Hall(s)', 'Boîte aux lettres',             $boite_lettres]);
$csv .= csv_row(['Hall(s)', 'Interrupteurs',                 $interrupteurs_hall]);
$csv .= csv_row(['Hall(s)', 'Corbeille à papiers',           $corbeille_papiers]);
$csv .= csv_row(['Hall(s)', 'Cuivre',                        $cuivre]);
$csv .= csv_row(['Hall(s)', 'Plinthes et boiseries',         $plinthes_boiseries_hall]);
$csv .= csv_row(['Hall(s)', 'Tapis',                         $tapis_hall]);
$csv .= csv_row(['Hall(s)', 'Sols',                          $sols_hall]);

$csv .= csv_row(['Ascenseur(s)', 'Porte',          $ascenseur_porte]);
$csv .= csv_row(['Ascenseur(s)', 'Miroir',         $ascenseur_miroir]);
$csv .= csv_row(['Ascenseur(s)', 'Parois + platine',$ascenseur_parois]);
$csv .= csv_row(['Ascenseur(s)', 'Sol + rail',     $ascenseur_sol]);

$csv .= csv_row(['Escalier(s)', 'Rampe',                       $escalier_rampe]);
$csv .= csv_row(['Escalier(s)', 'Barreaudage',                 $escalier_barreaudage]);
$csv .= csv_row(['Escalier(s)', 'Plinthes et boiseries',       $escalier_plinthes]);
$csv .= csv_row(['Escalier(s)', 'Marches (balayage/aspiration)',$marches_balayage]);
$csv .= csv_row(['Escalier(s)', 'Marches (cirage)',            $marches_cirage]);

$csv .= csv_row(['Paliers', 'Vitrerie et encadrement fenêtres', $vitrerie]);
$csv .= csv_row(['Paliers', 'Plinthes et boiseries',            $palier_plinthes]);
$csv .= csv_row(['Paliers', 'Rebords de fenêtres',              $rebords_fenetres]);
$csv .= csv_row(['Paliers', 'Interrupteurs',                    $interrupteurs_palier]);
$csv .= csv_row(['Paliers', 'Sols',                             $palier_sols]);
$csv .= csv_row(['Paliers', 'Tapis des résidents',              $tapis_residents]);

$csv .= csv_row(['Divers', 'Propreté des accès caves',          $acces_caves]);
$csv .= csv_row(['Divers', 'Remplacement des points lumineux',  $remplacement_lumineux]);
$csv .= csv_row(['Divers', 'Propreté des points lumineux',      $proprete_lumineux]);
$csv .= csv_row(['Divers', 'Propreté cour ou courette',         $proprete_cour]);
$csv .= csv_row(['Divers', "Toiles d'araignées",                $toiles_araignees]);
$csv .= csv_row(['Divers', 'Rangement et propreté du local',    $rangement_local]);
$csv .= csv_row(['Divers', 'Propreté des accès parking',        $acces_parking]);

$csv .= csv_row(['Signatures', 'Représentant syndical / syndic', $nom_representant]);
$csv .= csv_row(['Signatures', 'Nom du salarié',                 $nom_salarie]);

// Nom du fichier CSV : visite_NomImmeuble_YYYYMMDD.csv
$csv_filename = 'visite_'
    . preg_replace('/[^a-z0-9]/i', '_', $nom_immeuble)
    . '_' . str_replace('/', '', $date_visite)   // YYYYMMDD (format natif input date)
    . '.csv';

$csv_b64 = base64_encode($csv);

// --- Construction du mail multipart avec pièce jointe ---
$subject  = "Rapport de visite – {$nom_immeuble} – {$date_fr}";
$boundary = '----=_Boundary_' . md5(uniqid('', true));

$headers  = "From: {$config['from']}\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/mixed; boundary=\"{$boundary}\"\r\n";

$body  = "--{$boundary}\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $corps . "\r\n";

$body .= "--{$boundary}\r\n";
$body .= "Content-Type: text/csv; charset=UTF-8; name=\"{$csv_filename}\"\r\n";
$body .= "Content-Transfer-Encoding: base64\r\n";
$body .= "Content-Disposition: attachment; filename=\"{$csv_filename}\"\r\n\r\n";
$body .= chunk_split($csv_b64) . "\r\n";

$body .= "--{$boundary}--";

if (mail($config['to'], $subject, $body, $headers)) {
    http_response_code(200);
    exit('Rapport envoyé.');
} else {
    http_response_code(500);
    exit('Échec de l\'envoi. Veuillez réessayer.');
}
?>