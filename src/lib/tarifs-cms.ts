import "server-only";
import {
  ADHESION_CLUB_TARIFS,
  LICENCE_FFTRI_TARIFS,
  ASSURANCE_TARIFS,
  STAGE_TARIFS,
  CAUTION_CENTIMES,
  type Tarif,
  type ProfilAdherent,
  type LicenceType,
} from "@/content/tarifs";
import { getCmsCatalog, type CmsCatalogSection } from "@/lib/cms";

/**
 * Résout les tarifs d'adhésion/licence/assurance/stages/caution depuis le
 * catalogue CMS quand les rubriques correspondantes existent ("Adhésion
 * club", "Licence FFTri", "Assurance FFTri", "Stages", "Caution"), sinon
 * retombe sur les valeurs statiques de content/tarifs.ts.
 *
 * Utilisé à la fois par la page "Nous rejoindre" (affichage) et par les
 * routes /api/adhesion et /api/monetico/init (calcul du montant réellement
 * facturé, TOUJOURS recalculé côté serveur à partir de ces mêmes données —
 * jamais depuis une valeur envoyée par le client) : le prix affiché au
 * visiteur et le prix facturé viennent donc toujours de la même source.
 */

function productToTarif(p: { id: string; name: string; price: number | null }, fallbackCentimes = 0): Tarif {
  return {
    id: p.id,
    label: p.name,
    montantCentimes: p.price != null ? Math.round(p.price * 100) : fallbackCentimes,
  };
}

export interface ResolvedTarifs {
  adhesionClub: Record<ProfilAdherent, Tarif>;
  adhesionClubIsCms: boolean;
  licenceFFTri: Record<LicenceType, Tarif>;
  licenceFFTriIsCms: boolean;
  assurance: Tarif[];
  assuranceIsCms: boolean;
  stages: Tarif[];
  stagesIsCms: boolean;
  caution: Tarif;
  cautionIsCms: boolean;
}

const DEFAULT_CAUTION: Tarif = {
  id: "caution-benevolat",
  label: "Caution bénévolat (Toac)",
  montantCentimes: CAUTION_CENTIMES,
};

export async function resolveTarifs(): Promise<ResolvedTarifs> {
  const cmsCatalog = await getCmsCatalog();
  return resolveTarifsFromCatalog(cmsCatalog);
}

export function resolveTarifsFromCatalog(cmsCatalog: CmsCatalogSection[] | null): ResolvedTarifs {
  const section = (name: string) => cmsCatalog?.find((s) => s.name === name);

  const adhesionSection = section("Adhésion club");
  const adhesionClubIsCms = Boolean(adhesionSection && adhesionSection.products.length >= 2);
  const adhesionClub: Record<ProfilAdherent, Tarif> = adhesionClubIsCms
    ? {
        plein: productToTarif(adhesionSection!.products[0]),
        reduit: productToTarif(adhesionSection!.products[1]),
      }
    : ADHESION_CLUB_TARIFS;

  const licenceSection = section("Licence FFTri");
  const licenceFFTriIsCms = Boolean(licenceSection && licenceSection.products.length >= 2);
  const licenceFFTri: Record<LicenceType, Tarif> = licenceFFTriIsCms
    ? {
        loisir: productToTarif(licenceSection!.products[0]),
        competition: productToTarif(licenceSection!.products[1]),
      }
    : LICENCE_FFTRI_TARIFS;

  const assuranceSection = section("Assurance FFTri");
  const assuranceIsCms = Boolean(assuranceSection && assuranceSection.products.length > 0);
  const assurance: Tarif[] = assuranceIsCms
    ? assuranceSection!.products.map((p) => productToTarif(p))
    : ASSURANCE_TARIFS;

  const stagesSection = section("Stages");
  const stagesIsCms = Boolean(stagesSection && stagesSection.products.length > 0);
  const stages: Tarif[] = stagesIsCms ? stagesSection!.products.map((p) => productToTarif(p)) : STAGE_TARIFS;

  const cautionSection = section("Caution");
  const cautionIsCms = Boolean(cautionSection && cautionSection.products.length > 0);
  const caution: Tarif = cautionIsCms
    ? productToTarif(cautionSection!.products[0], CAUTION_CENTIMES)
    : DEFAULT_CAUTION;

  return {
    adhesionClub,
    adhesionClubIsCms,
    licenceFFTri,
    licenceFFTriIsCms,
    assurance,
    assuranceIsCms,
    stages,
    stagesIsCms,
    caution,
    cautionIsCms,
  };
}
