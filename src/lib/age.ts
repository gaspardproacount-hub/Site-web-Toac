/**
 * Calcul d'âge à partir d'une date de naissance au format `YYYY-MM-DD`
 * (celui d'un `<input type="date">`). Partagé entre le formulaire de décharge
 * musculation (affichage conditionnel du bloc « autorisation parentale ») et
 * l'API qui le reçoit — le serveur recalcule toujours, il ne fait pas confiance
 * à ce que le navigateur déclare.
 */

/** Âge en années révolues, ou null si la date est absente ou invalide. */
export function ageAt(dateNaissance: string, reference: Date = new Date()): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateNaissance.trim());
  if (!match) return null;

  const [, yearStr, monthStr, dayStr] = match;
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  // Rejette les dates qui n'existent pas (31 février…) : Date les décale
  // silencieusement sur le mois suivant.
  const birth = new Date(Date.UTC(year, month - 1, day));
  if (
    birth.getUTCFullYear() !== year ||
    birth.getUTCMonth() !== month - 1 ||
    birth.getUTCDate() !== day
  ) {
    return null;
  }

  let age = reference.getFullYear() - year;
  const anniversairePasse =
    reference.getMonth() + 1 > month ||
    (reference.getMonth() + 1 === month && reference.getDate() >= day);
  if (!anniversairePasse) age -= 1;

  return age < 0 ? null : age;
}

/**
 * Vrai si la personne a moins de 18 ans. Une date absente ou invalide renvoie
 * false : la validation des champs obligatoires s'en charge par ailleurs, et on
 * ne veut pas exiger une autorisation parentale sur une simple faute de frappe.
 */
export function isMineur(dateNaissance: string, reference: Date = new Date()): boolean {
  const age = ageAt(dateNaissance, reference);
  return age !== null && age < 18;
}
