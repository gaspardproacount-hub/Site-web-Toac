import "server-only";
import {
  sendMusculationNotification,
  type NotificationOutcome,
} from "@/lib/musculationNotification";
import { recordMusculationNotification, type MusculationDechargeRow } from "@/lib/db";

/**
 * Envoie la notification au bureau et consigne le résultat sur le dossier.
 *
 * Deux appelants : la validation par l'adhérent et le renvoi manuel depuis la
 * vue bureau. Le résultat est enregistré dans tous les cas — y compris en cas
 * d'échec — car c'est la seule trace visible par le bureau : les journaux de la
 * fonction ne sont accessibles qu'au propriétaire du compte d'hébergement.
 *
 * Ne lève jamais : un envoi raté ne doit pas faire échouer la démarche de
 * l'adhérent, ni le chargement de la vue bureau.
 */
export async function notifyAndRecord(
  decharge: Pick<MusculationDechargeRow, "token" | "decharge_url" | "nom" | "prenom">,
  origin: string
): Promise<NotificationOutcome> {
  let outcome: NotificationOutcome;

  try {
    outcome = await sendMusculationNotification({
      origin,
      documentPath: decharge.decharge_url,
      token: decharge.token,
      nom: decharge.nom,
      prenom: decharge.prenom,
    });
  } catch (error) {
    console.error("Échec de l'envoi de la notification musculation :", error);
    outcome = {
      statut: "echec",
      destinataires: [],
      erreur: error instanceof Error ? error.message : String(error),
    };
  }

  try {
    await recordMusculationNotification(decharge.token, outcome);
  } catch (error) {
    console.error("Échec de l'enregistrement du suivi de notification :", error);
  }

  return outcome;
}
