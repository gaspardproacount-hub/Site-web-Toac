import "server-only";
import {
  sendPartnerSignupStaffNotification,
  sendPartnerSignupMemberConfirmation,
  type PartnerSignupNotificationOutcome,
} from "@/lib/partnerSignupNotification";
import { recordPartnerSignupNotification, type PartnerSignupRow } from "@/lib/db";

/**
 * Envoie la notification au responsable partenariat et consigne le résultat
 * sur la demande. Deux appelants : l'envoi du formulaire par l'adhérent, et
 * le renvoi manuel depuis la vue bureau.
 *
 * Ne lève jamais : un envoi raté ne doit ni faire échouer la démarche de
 * l'adhérent, ni le chargement de la vue bureau — seule trace visible du
 * résultat, consignée dans tous les cas (y compris l'échec).
 */
export async function notifyStaffAndRecord(
  signup: Pick<PartnerSignupRow, "id" | "partenaire" | "token" | "nom" | "prenom" | "email">,
  origin: string
): Promise<PartnerSignupNotificationOutcome> {
  let outcome: PartnerSignupNotificationOutcome;

  try {
    outcome = await sendPartnerSignupStaffNotification({
      origin,
      partenaire: signup.partenaire,
      token: signup.token ?? "",
      nom: signup.nom,
      prenom: signup.prenom,
      email: signup.email,
    });
  } catch (error) {
    console.error("Échec de l'envoi de la notification partenariat :", error);
    outcome = {
      statut: "echec",
      destinataires: [],
      erreur: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    await recordPartnerSignupNotification(signup.id, outcome);
  } catch (error) {
    console.error("Échec de l'enregistrement du suivi de notification partenariat :", error);
  }

  return outcome;
}

/**
 * Envoie la confirmation à l'adhérent une fois ajouté côté partenaire. Ne
 * lève jamais : un échec d'envoi ne doit pas faire échouer la confirmation
 * de la demande elle-même (déjà enregistrée en base à ce stade).
 */
export async function notifyMember(
  signup: Pick<PartnerSignupRow, "partenaire" | "nom" | "prenom" | "email">
): Promise<PartnerSignupNotificationOutcome> {
  try {
    return await sendPartnerSignupMemberConfirmation(signup);
  } catch (error) {
    console.error("Échec de l'envoi de la confirmation à l'adhérent (partenariat) :", error);
    return {
      statut: "echec",
      destinataires: [signup.email],
      erreur: error instanceof Error ? error.message : String(error),
    };
  }
}
