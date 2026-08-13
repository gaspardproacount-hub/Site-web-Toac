import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Règlement intérieur",
  description: "Règlement intérieur du TOAC Triathlon.",
};

const SOMMAIRE = [
  { id: "article-1", label: "Article 1 – Objet du règlement intérieur" },
  { id: "article-2", label: "Article 2 – Adhésion au club" },
  { id: "article-3", label: "Article 3 – Les valeurs du TOAC Triathlon" },
  { id: "article-4", label: "Article 4 – Respect des personnes et comportement attendu" },
  { id: "article-5", label: "Article 5 – Communication avec les adhérents" },
  { id: "article-6", label: "Article 6 – Les entraînements et modalités d'inscription" },
  { id: "article-7", label: "Article 7 – Organisation des entraînements de natation" },
  { id: "article-8", label: "Article 8 – Engagement bénévole" },
  { id: "article-9", label: "Article 9 – Participation à la vie du club" },
  { id: "article-10", label: "Article 10 – Matériel et installations" },
  { id: "article-11", label: "Article 11 – Sécurité" },
  { id: "article-12", label: "Article 12 – Droit à l'image" },
  { id: "article-13", label: "Article 13 – Protection des données personnelles" },
  { id: "article-14", label: "Article 14 – Assurances" },
  { id: "article-15", label: "Article 15 – Démission et retrait volontaire" },
  { id: "article-16", label: "Article 16 – Procédure disciplinaire" },
  { id: "article-17", label: "Article 17 – Application du règlement intérieur" },
  { id: "annexe-1", label: "Annexe 1 – Organisation des entraînements de natation" },
  { id: "annexe-2", label: "Annexe 2 – Engagement bénévole et dépôt de garantie" },
];

const CRENEAUX_NATATION = [
  { jour: "Lundi", horaire: "7h00", lignes: "4 lignes", bassin: "25 m", nageurs: "8", capacite: "32" },
  { jour: "Mardi", horaire: "21h00", lignes: "3 lignes", bassin: "50 m", nageurs: "12", capacite: "36" },
  { jour: "Jeudi", horaire: "7h00", lignes: "3 lignes", bassin: "25 m", nageurs: "8", capacite: "24" },
  {
    jour: "Vendredi",
    horaire: "7h00",
    lignes: "5 lignes (partagées avec le TOAC Natation)",
    bassin: "25 m",
    nageurs: "6",
    capacite: "30",
  },
];

function Article({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-24 border-t border-toac-gray-200 pt-8">
      <h2 className="font-display text-lg uppercase text-toac-blue-950">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export default function ReglementInterieurPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="section-title font-display text-3xl uppercase text-toac-blue-950">
        Règlement intérieur
      </h1>
      <p className="mt-2 text-xs uppercase tracking-wide text-toac-blue-900/50">
        TOAC Triathlon — Dernière mise à jour : août 2026
      </p>

      <div className="mt-8 space-y-3 text-sm text-toac-blue-900/90">
        <h2 className="font-display text-base uppercase text-toac-blue-950">Préambule</h2>
        <p>
          Le TOAC Triathlon est une association sportive affiliée à la Fédération Française de Triathlon
          (FFTri). Au-delà de la pratique sportive, le club a pour vocation de développer un esprit de
          convivialité, d&rsquo;entraide et de respect, en permettant à chacun de progresser dans les
          meilleures conditions, quel que soit son niveau ou ses objectifs.
        </p>
        <p>
          Le présent règlement intérieur complète les statuts de l&rsquo;association. Il précise les règles
          de fonctionnement du club ainsi que les droits et obligations de chacun.
        </p>
        <p>
          Toute adhésion au TOAC Triathlon implique l&rsquo;acceptation sans réserve des statuts et du
          présent règlement intérieur.
        </p>
      </div>

      <nav className="mt-10 rounded-lg border border-toac-gray-200 bg-toac-gray-50 p-4">
        <p className="font-display text-xs uppercase tracking-wide text-toac-blue-950">Sommaire</p>
        <ul className="mt-2 grid gap-x-6 gap-y-1 text-sm text-toac-blue-600 sm:grid-cols-2">
          {SOMMAIRE.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} className="underline decoration-toac-blue-600/30 hover:decoration-toac-blue-600">
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-10 space-y-8 text-sm text-toac-blue-900/90">
        <Article id="article-1" title="Article 1 – Objet du règlement intérieur">
          <p>
            Le présent règlement a pour objet de définir les modalités de fonctionnement du TOAC Triathlon.
            Il précise notamment :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>les conditions d&rsquo;adhésion au club ;</li>
            <li>les règles de participation aux entraînements et aux activités proposées ;</li>
            <li>les droits et devoirs des adhérents ;</li>
            <li>les modalités de participation à la vie associative ;</li>
            <li>les règles permettant de garantir la sécurité, le respect et la convivialité au sein du club.</li>
          </ul>
          <p>
            Les modalités pratiques d&rsquo;organisation (créneaux d&rsquo;entraînement, composition des
            groupes, calendrier des événements, montants, etc.) sont précisées chaque saison en annexe par
            le Bureau ou le Conseil d&rsquo;Administration, sans nécessiter une modification du présent
            règlement.
          </p>
        </Article>

        <Article id="article-2" title="Article 2 – Adhésion au club">
          <p>L&rsquo;adhésion au TOAC Triathlon est valable jusqu&rsquo;au 31/08 de l&rsquo;année suivante.</p>
          <p>Elle devient effective après :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>la pré-inscription incluant l&rsquo;acceptation du règlement intérieur du club ;</li>
            <li>la validation de la licence FFTri ;</li>
            <li>
              le paiement sur la plateforme FFTri des éléments suivants :
              <ul className="mt-1 list-disc space-y-1 pl-5">
                <li>la licence FFTri ;</li>
                <li>la formule d&rsquo;assurance ;</li>
                <li>
                  la part club — montant calculé en fonction du profil de l&rsquo;adhérent et incluant :
                  <ul className="mt-1 list-disc space-y-1 pl-5">
                    <li>
                      la cotisation au club (tarif réduit pour les étudiants, demandeurs d&rsquo;emploi,
                      ayant-droit Airbus Opérations) ;
                    </li>
                    <li>
                      le dépôt de garantie bénévolat (en cas de nouvelle adhésion — voir Article 8 et
                      Annexe 2) ;
                    </li>
                    <li>
                      la trifonction officielle du club (en cas de nouvelle adhésion — modèle d&rsquo;entrée
                      de gamme).
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
          <p>
            Les modalités d&rsquo;essayage et de remise de la trifonction sont communiquées au cours de la
            saison. Les adhérents qui souhaitent un modèle plus haut de gamme peuvent l&rsquo;indiquer après
            les essayages et régler le complément correspondant.
          </p>
          <p>L&rsquo;adhésion donne notamment accès :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>aux entraînements proposés par le club selon les modalités définies chaque saison ;</li>
            <li>à l&rsquo;encadrement assuré par les entraîneurs et intervenants du club ;</li>
            <li>aux événements sportifs et conviviaux organisés par l&rsquo;association ;</li>
            <li>aux informations et services proposés aux adhérents.</li>
          </ul>
        </Article>

        <Article id="article-3" title="Article 3 – Les valeurs du TOAC Triathlon">
          <p>
            Le TOAC Triathlon est avant tout un club associatif. Son fonctionnement repose sur
            l&rsquo;implication de ses bénévoles et sur la participation de chacun à la vie du club.
          </p>
          <p>Chaque adhérent contribue, à son niveau, à faire vivre les valeurs de l&rsquo;association :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>le respect des personnes ;</li>
            <li>la convivialité ;</li>
            <li>la solidarité ;</li>
            <li>l&rsquo;entraide ;</li>
            <li>le fair-play ;</li>
            <li>le dépassement de soi ;</li>
            <li>la bienveillance.</li>
          </ul>
          <p>
            Les entraînements, les compétitions et les événements organisés par le club doivent rester des
            moments de plaisir, de partage et de progression. Chaque adhérent est invité à participer à la
            vie du club, tant lors des activités sportives que des événements associatifs.
          </p>
        </Article>

        <Article id="article-4" title="Article 4 – Respect des personnes et comportement attendu">
          <p>
            Chaque adhérent s&rsquo;engage à adopter en toute circonstance un comportement respectueux
            envers :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>les autres adhérents ;</li>
            <li>les entraîneurs ;</li>
            <li>les bénévoles ;</li>
            <li>les arbitres ;</li>
            <li>les partenaires ;</li>
            <li>les représentants du club ;</li>
            <li>les salariés et agents des équipements sportifs utilisés.</li>
          </ul>
          <p>Les comportements suivants sont incompatibles avec les valeurs du club :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>les propos injurieux ou diffamatoires ;</li>
            <li>les comportements agressifs ou intimidants ;</li>
            <li>toute forme de discrimination ou de harcèlement ;</li>
            <li>les atteintes volontaires à l&rsquo;image ou au bon fonctionnement de l&rsquo;association ;</li>
            <li>tout comportement portant préjudice à la sécurité ou à la convivialité du groupe.</li>
          </ul>
          <p>
            Chaque adhérent est également tenu de respecter le matériel mis à disposition ainsi que les
            installations utilisées par le club.
          </p>
        </Article>

        <Article id="article-5" title="Article 5 – Communication avec les adhérents">
          <p>
            Les informations relatives à la vie du club sont diffusées principalement par courrier
            électronique et/ou via les outils numériques utilisés par le TOAC Triathlon.
          </p>
          <p>
            Chaque adhérent s&rsquo;engage à maintenir ses coordonnées à jour et à consulter régulièrement
            ces supports afin de prendre connaissance des informations importantes concernant :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>les entraînements ;</li>
            <li>les événements du club ;</li>
            <li>les compétitions ;</li>
            <li>les convocations ;</li>
            <li>les évolutions du fonctionnement de l&rsquo;association.</li>
          </ul>
          <p>
            L&rsquo;absence de consultation de ces supports ne saurait exonérer un adhérent du respect des
            informations qui y sont diffusées.
          </p>
        </Article>

        <Article id="article-6" title="Article 6 – Les entraînements et modalités d'inscription">
          <p>
            Le TOAC Triathlon propose des entraînements dans les différentes disciplines du triathlon selon
            les créneaux définis chaque saison.
          </p>
          <p>
            Les horaires, lieux, groupes d&rsquo;entraînement et modalités d&rsquo;organisation sont
            communiqués aux adhérents en début de saison et peuvent être adaptés en cours d&rsquo;année en
            fonction des contraintes d&rsquo;organisation ou de disponibilité des infrastructures.
          </p>
          <p>Les adhérents s&rsquo;engagent à :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>respecter les horaires des entraînements ;</li>
            <li>appliquer les consignes données par les entraîneurs et les responsables de séance ;</li>
            <li>adopter une attitude respectueuse envers l&rsquo;ensemble des participants ;</li>
            <li>utiliser le matériel et les installations avec soin.</li>
          </ul>
          <p>
            Pour des raisons de sécurité ou d&rsquo;organisation, le club peut limiter le nombre de
            participants sur certains entraînements et mettre en place une inscription préalable obligatoire
            sur certains créneaux.
          </p>
          <p>
            Lorsqu&rsquo;une inscription préalable est requise, l&rsquo;adhérent s&rsquo;engage à respecter
            les modalités communiquées par le club et à se désinscrire dès que possible en cas
            d&rsquo;empêchement, afin de permettre à un autre membre de bénéficier de la place disponible.
          </p>
          <p>
            Les absences répétées sans désinscription préalable (« no-shows ») pourront entraîner une
            suspension temporaire de l&rsquo;accès aux créneaux concernés, selon les modalités précisées
            chaque saison en annexe par discipline (cf. Annexe 1 pour la natation).
          </p>
        </Article>

        <Article id="article-7" title="Article 7 – Organisation des entraînements de natation">
          <p>
            Les créneaux de natation constituent une ressource limitée dont l&rsquo;utilisation doit
            permettre à chacun de s&rsquo;entraîner dans les meilleures conditions de sécurité et de
            progression.
          </p>
          <p>Afin d&rsquo;assurer un fonctionnement équilibré, le Bureau peut mettre en place, selon les besoins :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>des groupes de niveau établis à partir de tests chronométriques ou de l&rsquo;observation des entraîneurs ;</li>
            <li>des limitations du nombre de nageurs sur certains créneaux, selon la configuration des bassins utilisés ;</li>
            <li>un système d&rsquo;inscription préalable aux séances ;</li>
            <li>des règles de priorité d&rsquo;accès à certains créneaux ;</li>
            <li>toute autre mesure destinée à améliorer la sécurité, la qualité des entraînements ou le confort des adhérents.</li>
          </ul>
          <p>
            Les modalités pratiques (créneaux, composition des groupes, capacités d&rsquo;accueil, règles
            d&rsquo;inscription et sanctions applicables en cas d&rsquo;absence non signalée) sont précisées
            chaque saison en Annexe 1 du présent règlement et peuvent être adaptées en cours d&rsquo;année
            par le Bureau.
          </p>
          <p>Les adhérents s&rsquo;engagent à respecter ces modalités.</p>
        </Article>

        <Article id="article-8" title="Article 8 – Engagement bénévole">
          <p>
            Le TOAC Triathlon organise chaque année les Triathlons du Lauragais, un événement majeur de la
            vie du club qui mobilise plus de 200 bénévoles.
          </p>
          <p>
            En adhérant au club, chaque membre s&rsquo;engage à participer au minimum une journée par saison
            à la vie de l&rsquo;association, idéalement lors du week-end des Triathlons du Lauragais.
          </p>
          <p>
            Le club encourage naturellement toute aide apportée en amont ou après les Triathlons du
            Lauragais. Toutefois, le besoin en bénévoles est particulièrement important pendant le
            déroulement de l&rsquo;événement lui-même : les adhérents sont donc invités à privilégier leur
            participation durant ce week-end.
          </p>
          <p>
            En cas d&rsquo;empêchement exceptionnel (contraintes professionnelles, familiales, médicales ou
            toute autre situation jugée légitime par le Bureau), une autre journée de bénévolat pourra être
            proposée d&rsquo;un commun accord. En revanche, la participation à une autre manifestation
            sportive organisée le même week-end ne constitue pas, à elle seule, un motif justifiant cette
            dérogation.
          </p>
          <p>
            Afin de garantir cet engagement, un dépôt de garantie est demandé à chaque adhérent lors de sa
            première adhésion. Son montant, ses modalités de conservation et de remboursement, ainsi que les
            conséquences du non-respect de l&rsquo;engagement bénévole, sont précisés en Annexe 2 du présent
            règlement.
          </p>
        </Article>

        <Article id="article-9" title="Article 9 – Participation à la vie du club">
          <p>
            Le TOAC Triathlon est une association reposant en grande partie sur l&rsquo;engagement de ses
            bénévoles.
          </p>
          <p>
            Au-delà de la pratique sportive, chaque adhérent est invité à contribuer, selon ses
            disponibilités et ses compétences, à la vie de l&rsquo;association. Cette participation peut
            notamment prendre la forme :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>d&rsquo;une aide lors des événements organisés par le club ;</li>
            <li>d&rsquo;une participation à l&rsquo;organisation des compétitions ;</li>
            <li>d&rsquo;un soutien logistique ;</li>
            <li>d&rsquo;une implication dans les actions de communication ;</li>
            <li>de l&rsquo;encadrement ou de l&rsquo;animation d&rsquo;activités ;</li>
            <li>de toute autre contribution utile au fonctionnement de l&rsquo;association.</li>
          </ul>
        </Article>

        <Article id="article-10" title="Article 10 – Matériel et installations">
          <p>
            Chaque adhérent est responsable du matériel personnel qu&rsquo;il utilise lors des entraînements
            et des compétitions. Il lui appartient de vérifier régulièrement l&rsquo;état de son matériel
            afin de garantir sa sécurité ainsi que celle des autres participants.
          </p>
          <p>Chaque adhérent s&rsquo;engage également à respecter :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>le matériel appartenant au club ;</li>
            <li>le matériel prêté par les partenaires ;</li>
            <li>les installations sportives et les locaux mis à disposition lors des entraînements et événements.</li>
          </ul>
          <p>
            Lorsqu&rsquo;un équipement est mis à disposition par le club, les adhérents s&rsquo;engagent à
            l&rsquo;utiliser conformément à sa destination et à en prendre soin.
          </p>
          <p>
            Toute dégradation volontaire ou résultant d&rsquo;une utilisation manifestement inappropriée
            pourra donner lieu à une demande de réparation financière et/ou à une sanction disciplinaire
            (cf. Article 16).
          </p>
        </Article>

        <Article id="article-11" title="Article 11 – Sécurité">
          <p>La sécurité constitue une priorité pour le TOAC Triathlon.</p>
          <p>
            Chaque adhérent est responsable de sa propre sécurité ainsi que de son comportement lors des
            entraînements et activités organisés par le club. Il s&rsquo;engage notamment à :
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>respecter le Code de la route lors des sorties cyclistes ;</li>
            <li>porter les équipements de sécurité adaptés à chaque discipline (casque obligatoire à vélo notamment) ;</li>
            <li>appliquer les consignes données par les entraîneurs et les responsables de séance ;</li>
            <li>signaler toute situation présentant un risque pour les personnes ou les biens.</li>
          </ul>
          <p>
            Le club se réserve le droit d&rsquo;interdire l&rsquo;accès à une séance à toute personne dont le
            comportement mettrait en danger sa sécurité ou celle des autres.
          </p>
        </Article>

        <Article id="article-12" title="Article 12 – Droit à l'image">
          <p>
            Dans le cadre des activités du club, des photographies ou vidéos peuvent être réalisées afin
            d&rsquo;illustrer les supports de communication du TOAC Triathlon.
          </p>
          <p>L&rsquo;autorisation d&rsquo;utilisation de l&rsquo;image est recueillie lors de la demande d&rsquo;adhésion.</p>
          <p>
            Chaque adhérent peut demander à tout moment le retrait d&rsquo;une photographie le concernant,
            dans la mesure où cela reste techniquement possible.
          </p>
          <p>
            Le club s&rsquo;engage à utiliser ces images dans le respect des personnes et exclusivement dans
            le cadre de ses activités.
          </p>
        </Article>

        <Article id="article-13" title="Article 13 – Protection des données personnelles">
          <p>
            Dans le cadre de la gestion de ses adhérents et de son fonctionnement associatif, le TOAC
            Triathlon est amené à collecter et à traiter des données à caractère personnel (identité,
            coordonnées, informations relatives à la licence FFTri, etc.).
          </p>
          <p>
            Ce traitement est effectué conformément au Règlement (UE) 2016/679 du 27 avril 2016 (« RGPD »)
            et à la loi n° 78-17 du 6 janvier 1978 modifiée relative à l&rsquo;informatique, aux fichiers et
            aux libertés.
          </p>

          <p className="font-medium text-toac-blue-950">Finalités du traitement</p>
          <p>Les données collectées sont utilisées exclusivement aux fins suivantes :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>gestion administrative des adhésions et des licences ;</li>
            <li>organisation des entraînements et des événements du club ;</li>
            <li>communication avec les adhérents ;</li>
            <li>respect des obligations légales et réglementaires applicables à l&rsquo;association.</li>
          </ul>

          <p className="font-medium text-toac-blue-950">Destinataires</p>
          <p>
            Les données sont destinées aux membres du Bureau et du Conseil d&rsquo;Administration en charge
            de la gestion du club, ainsi qu&rsquo;à la FFTri dans le cadre de la délivrance de la licence.
            Elles ne sont ni cédées ni vendues à des tiers à des fins commerciales.
          </p>

          <p className="font-medium text-toac-blue-950">Durée de conservation</p>
          <p>
            Les données sont conservées pendant la durée de l&rsquo;adhésion, augmentée de la durée
            nécessaire au respect des obligations légales et comptables de l&rsquo;association.
          </p>

          <p className="font-medium text-toac-blue-950">Droits des adhérents</p>
          <p>
            Conformément à la réglementation applicable, chaque adhérent dispose d&rsquo;un droit
            d&rsquo;accès, de rectification, d&rsquo;effacement et de limitation du traitement de ses
            données, ainsi que d&rsquo;un droit d&rsquo;opposition pour motif légitime. Ces droits peuvent
            être exercés par écrit auprès du Bureau du TOAC Triathlon, à l&rsquo;adresse{" "}
            <a href="mailto:toac-triathlon-bureau@googlegroups.com" className="text-toac-blue-600 underline">
              toac-triathlon-bureau@googlegroups.com
            </a>
            .
          </p>
          <p>
            En cas de difficulté, l&rsquo;adhérent dispose également du droit d&rsquo;introduire une
            réclamation auprès de la Commission Nationale de l&rsquo;Informatique et des Libertés (CNIL).
          </p>
        </Article>

        <Article id="article-14" title="Article 14 – Assurances">
          <p>
            Chaque adhérent du TOAC Triathlon est titulaire d&rsquo;une licence délivrée par la Fédération
            Française de Triathlon (FFTri), condition indispensable à son adhésion (cf. Article 2).
          </p>
          <p>
            À ce titre, il bénéficie du programme d&rsquo;assurances souscrit par la FFTri auprès de la
            MAIF, par l&rsquo;intermédiaire du courtier AIAC, dans le cadre des dispositions des articles
            L. 321-1, L. 321-4, L. 321-5 et L. 321-6 du Code du sport. Ce programme répond aux obligations
            d&rsquo;assurance de responsabilité civile et d&rsquo;information relative aux accidents
            corporels que peuvent subir les adhérents licenciés.
          </p>
          <p>
            Lors de la prise de sa licence, chaque adhérent choisit lui-même, sous sa propre responsabilité,
            le niveau de garantie individuelle accident correspondant à sa pratique et à ses besoins, parmi
            les options proposées par la FFTri. Le TOAC Triathlon n&rsquo;intervient pas dans ce choix et
            invite chaque adhérent à consulter attentivement les notices d&rsquo;assurance en vigueur avant
            de valider sa licence, disponibles à l&rsquo;adresse suivante :{" "}
            <a
              href="https://www.fftri.com/assurance-2026-notices-dassurance/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-toac-blue-600 underline"
            >
              fftri.com/assurance-2026-notices-dassurance
            </a>
            .
          </p>
        </Article>

        <Article id="article-15" title="Article 15 – Démission et retrait volontaire">
          <p>
            Tout adhérent souhaitant quitter le club en cours de saison en informe le Bureau par écrit dans
            les meilleurs délais.
          </p>
          <p>
            Sauf décision exceptionnelle du Bureau, aucun remboursement de cotisation, même partiel ou au
            prorata, n&rsquo;est effectué en cas de départ en cours de saison.
          </p>
          <p>
            Le départ en cours de saison ne dispense pas l&rsquo;adhérent de son engagement bénévole au
            titre de la saison en cours (cf. Article 8), sauf dérogation accordée par le Bureau en cas de
            situation exceptionnelle (mobilité professionnelle imposée, déménagement contraint, motif
            médical ou familial grave, ou toute autre situation jugée légitime).
          </p>
          <p>Le sort du dépôt de garantie en cas de départ est précisé en Annexe 2 du présent règlement.</p>
        </Article>

        <Article id="article-16" title="Article 16 – Procédure disciplinaire">
          <p>
            Tout manquement aux statuts, au présent règlement intérieur ou aux décisions régulièrement
            prises par les instances dirigeantes du club peut donner lieu à une procédure disciplinaire.
          </p>
          <p>Selon la gravité des faits, les mesures suivantes pourront être envisagées :</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>un rappel des règles ;</li>
            <li>un avertissement écrit ;</li>
            <li>une suspension temporaire de certaines activités du club ;</li>
            <li>une proposition de radiation conformément aux statuts de l&rsquo;association.</li>
          </ul>
          <p>
            Avant toute décision susceptible d&rsquo;entraîner une sanction, l&rsquo;adhérent concerné est
            invité à présenter ses observations, conformément aux dispositions prévues par les statuts.
          </p>
        </Article>

        <Article id="article-17" title="Article 17 – Application du règlement intérieur">
          <p>Le présent règlement intérieur est adopté par le Conseil d&rsquo;Administration du TOAC Triathlon.</p>
          <p>Il est communiqué à chaque adhérent lors de sa demande d&rsquo;adhésion.</p>
          <p>Toute adhésion au club vaut acceptation pleine et entière du présent règlement.</p>
          <p>
            Le Bureau est chargé de son application et peut préciser, lorsque cela est nécessaire, les
            modalités pratiques de fonctionnement du club, dans le respect des statuts et du présent
            règlement intérieur.
          </p>
        </Article>

        <Article id="annexe-1" title="Annexe 1 – Organisation des entraînements de natation">
          <p>
            Cette annexe précise chaque saison les modalités pratiques d&rsquo;application de l&rsquo;Article
            7 et de l&rsquo;Article 6. Elle peut être mise à jour par le Bureau sans modification du
            règlement intérieur en cours d&rsquo;année et selon les besoins opérationnels afin de garantir le
            bon fonctionnement des activités.
          </p>

          <p className="font-medium text-toac-blue-950">1. Créneaux actuels</p>
          <div className="overflow-x-auto rounded-md border border-toac-gray-200">
            <table className="w-full min-w-[560px] border-collapse text-left text-sm">
              <thead>
                <tr className="bg-toac-gray-50 text-xs uppercase tracking-wide text-toac-blue-900/70">
                  <th className="border-b border-toac-gray-200 px-3 py-2">Jour</th>
                  <th className="border-b border-toac-gray-200 px-3 py-2">Horaire</th>
                  <th className="border-b border-toac-gray-200 px-3 py-2">Lignes d&rsquo;eau</th>
                  <th className="border-b border-toac-gray-200 px-3 py-2">Bassin</th>
                  <th className="border-b border-toac-gray-200 px-3 py-2">Nageurs max / ligne</th>
                  <th className="border-b border-toac-gray-200 px-3 py-2">Capacité maximum</th>
                </tr>
              </thead>
              <tbody>
                {CRENEAUX_NATATION.map((c) => (
                  <tr key={c.jour} className="border-b border-toac-gray-200 last:border-0">
                    <td className="px-3 py-2 font-medium text-toac-blue-950">{c.jour}</td>
                    <td className="px-3 py-2">{c.horaire}</td>
                    <td className="px-3 py-2">{c.lignes}</td>
                    <td className="px-3 py-2">{c.bassin}</td>
                    <td className="px-3 py-2">{c.nageurs}</td>
                    <td className="px-3 py-2">{c.capacite}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="font-medium text-toac-blue-950">
            2. Évolutions prévues à compter de la rentrée 2026/2027
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Tests chronométriques sur 400 m, organisés deux fois par saison (un en septembre, un en
              janvier) ; possibilité pour l&rsquo;adhérent d&rsquo;effectuer le test chronométrique de son
              côté et de fournir le chrono au club ensuite.
            </li>
            <li>
              Constitution de 4 groupes de niveau (groupes 1 à 4), établis en fonction de la vitesse de nage
              de chaque adhérent.
            </li>
            <li>Inscription obligatoire aux séances via l&rsquo;outil IDO (suivi par Damien).</li>
            <li>
              Si le nombre de nageurs présents est supérieur à la capacité maximum définie, les nageurs non
              inscrits seront priés de quitter le bassin.
            </li>
            <li>
              Règle d&rsquo;assiduité : toute absence à 2 séances sans désinscription préalable (« no-show »)
              entraîne une suspension temporaire de l&rsquo;accès au créneau concerné pendant 2 semaines.
            </li>
            <li>
              Toute désinscription doit être effectuée 24h avant le début de la séance, sinon elle sera
              considérée comme un no-show.
            </li>
            <li>
              Alternance des groupes sur les créneaux à capacité limitée : les groupes 1 et 2
              s&rsquo;entraînent les semaines paires, les groupes 3 et 4 les semaines impaires. Pour la
              saison 2026-2027, cette alternance va être mise en place sur la séance du jeudi.
            </li>
          </ul>
          <p>
            Ces modalités sont précisées et mises à jour chaque saison par le Bureau, sans qu&rsquo;une
            modification du règlement intérieur ne soit nécessaire.
          </p>
        </Article>

        <Article id="annexe-2" title="Annexe 2 – Engagement bénévole et dépôt de garantie">
          <p>
            Cette annexe précise chaque saison les modalités pratiques d&rsquo;application de l&rsquo;Article
            8 et de l&rsquo;Article 15. Elle peut être mise à jour par le Bureau sans modification du
            règlement intérieur.
          </p>

          <p className="font-medium text-toac-blue-950">1. Montant du dépôt de garantie</p>
          <p>
            Le montant du dépôt de garantie est fixé chaque saison par le Conseil d&rsquo;Administration.
            Pour la saison 2026/2027 : 100 €.
          </p>

          <p className="font-medium text-toac-blue-950">2. Fonctionnement</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Le dépôt de garantie est versé lors de la première adhésion au club et intégré à la cotisation.</li>
            <li>
              Il est conservé par le club tant que l&rsquo;adhérent reste membre et respecte son engagement
              bénévole (cf. Article 8).
            </li>
            <li>Il n&rsquo;est pas demandé lors des renouvellements, sauf dans le cas prévu au paragraphe 3 ci-dessous.</li>
            <li>
              Il est remboursé uniquement en cas de départ définitif du club, et sous réserve que
              l&rsquo;engagement bénévole de la dernière saison ait été respecté.
            </li>
            <li>
              En cas de départ volontaire en cours de saison sans motif exceptionnel reconnu par le Bureau
              (cf. Article 15), le dépôt de garantie n&rsquo;est pas remboursé.
            </li>
          </ul>

          <p className="font-medium text-toac-blue-950">
            3. Sanction en cas de non-respect de l&rsquo;engagement bénévole
          </p>
          <p>
            Un adhérent qui n&rsquo;a pas honoré son engagement bénévole sur une saison, sans motif légitime
            reconnu par le Bureau, fait l&rsquo;objet d&rsquo;une sanction financière : le dépôt de garantie
            n&rsquo;est pas remboursé et est considéré comme définitivement acquis au club.
          </p>
          <p>
            Si cet adhérent souhaite renouveler son adhésion la saison suivante, il est alors considéré
            comme un nouvel adhérent à la fois concernant la date de traitement de sa demande de licence et
            au regard du dépôt de garantie : un nouveau dépôt lui est demandé, dans les mêmes conditions
            qu&rsquo;une première adhésion.
          </p>
        </Article>
      </div>
    </div>
  );
}
