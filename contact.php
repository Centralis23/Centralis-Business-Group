<?php
// ============================================================
// CENTRALIS BUSINESS GROUP — Formulaire de contact
// Destination : contact@centralisbusinessgroup.com
// ============================================================

header('Content-Type: application/json; charset=utf-8');

// Seules les requêtes POST sont acceptées
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Méthode non autorisée.']);
    exit;
}

// --- Fonctions de nettoyage ---
function clean($str) {
    return htmlspecialchars(strip_tags(trim($str)), ENT_QUOTES, 'UTF-8');
}

// --- Récupération des champs ---
$name       = clean($_POST['name']        ?? '');
$email      = clean($_POST['email']       ?? '');
$phone      = clean($_POST['phone']       ?? '');
$company    = clean($_POST['company']     ?? '');
$subject    = clean($_POST['subject']     ?? '');
$date_start = clean($_POST['date_start']  ?? '');
$nb_persons = clean($_POST['nb_personnes']?? '');
$message    = clean($_POST['message']     ?? '');
$rgpd       = isset($_POST['rgpd']) ? true : false;

// --- Validation ---
$errors = [];

if (empty($name))    $errors[] = 'Le nom est obligatoire.';
if (empty($email) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) $errors[] = 'Email invalide.';
if (empty($subject)) $errors[] = 'Veuillez choisir un sujet.';
if (empty($message)) $errors[] = 'Le message est obligatoire.';
if (!$rgpd)          $errors[] = 'Veuillez accepter la politique de confidentialité.';

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
    exit;
}

// --- Sujets lisibles ---
$subjects_map = [
    'salle-reunion'   => 'Réservation salle de réunion',
    'salle-formation' => 'Réservation salle de formation',
    'evenement'       => 'Événement / Séminaire',
    'studio-podcast'  => 'Réservation studio podcast',
    'production'      => 'Production de contenu',
    'formation-bts'   => 'Formation BTS (NDRC / GPME / MCO)',
    'formation-pro'   => 'Formation professionnelle',
    'alternance'      => 'Alternance',
    'conseil'         => 'Conseil en entreprise',
    'partenariat'     => 'Partenariat',
    'devis'           => 'Demande de devis',
    'autre'           => 'Autre demande',
];
$subject_label = $subjects_map[$subject] ?? ucfirst($subject);

// --- Construction de l'email ---
$to      = 'contact@centralisbusinessgroup.com';
$subject_line = '[CBG] Nouveau message — ' . $subject_label;

$body  = "==========================================================\n";
$body .= "  NOUVEAU MESSAGE — CENTRALIS BUSINESS GROUP\n";
$body .= "==========================================================\n\n";
$body .= "EXPÉDITEUR\n";
$body .= "----------\n";
$body .= "Nom       : {$name}\n";
$body .= "Email     : {$email}\n";
if ($phone)   $body .= "Téléphone : {$phone}\n";
if ($company) $body .= "Entreprise: {$company}\n";
$body .= "\nDEMANDE\n";
$body .= "-------\n";
$body .= "Sujet     : {$subject_label}\n";
if ($date_start) $body .= "Date souh.: {$date_start}\n";
if ($nb_persons) $body .= "Personnes : {$nb_persons}\n";
$body .= "\nMESSAGE\n";
$body .= "-------\n";
$body .= $message . "\n\n";
$body .= "==========================================================\n";
$body .= "Reçu le   : " . date('d/m/Y à H:i') . "\n";
$body .= "IP        : " . ($_SERVER['REMOTE_ADDR'] ?? 'inconnue') . "\n";
$body .= "==========================================================\n";

$headers  = "From: noreply@centralisbusinessgroup.com\r\n";
$headers .= "Reply-To: {$email}\r\n";
$headers .= "X-Mailer: CBG-ContactForm/1.0\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: 8bit\r\n";

// --- Email de confirmation à l'expéditeur ---
$confirm_subject = 'Nous avons bien reçu votre message — Centralis Business Group';
$confirm_body  = "Bonjour {$name},\n\n";
$confirm_body .= "Merci de nous avoir contactés. Nous avons bien reçu votre demande concernant : {$subject_label}.\n\n";
$confirm_body .= "Notre équipe vous répondra dans les 24 heures ouvrées.\n\n";
$confirm_body .= "---\n";
$confirm_body .= "Centralis Business Group\n";
$confirm_body .= "contact@centralisbusinessgroup.com\n";
$confirm_body .= "Alfortville, Île-de-France\n";
$confirm_body .= "https://centralisbusinessgroup.com\n";

$confirm_headers  = "From: contact@centralisbusinessgroup.com\r\n";
$confirm_headers .= "X-Mailer: CBG-ContactForm/1.0\r\n";
$confirm_headers .= "MIME-Version: 1.0\r\n";
$confirm_headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

// --- Envoi ---
$sent = mail($to, $subject_line, $body, $headers);
if ($sent) {
    mail($email, $confirm_subject, $confirm_body, $confirm_headers);
    echo json_encode(['success' => true, 'message' => 'Message envoyé ! Vous recevrez une confirmation par email.']);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Erreur d\'envoi. Veuillez réessayer ou nous écrire directement à contact@centralisbusinessgroup.com']);
}
