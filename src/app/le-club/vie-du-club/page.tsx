import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "La vie du club",
  description: "Soirées, stages, sortie club et challenges D3 : toute la vie du TOAC Triathlon.",
};

const D3_DUATHLON = [
  { epreuve: "Draft — Carcassonne", date: "8 mars 2026" },
  { epreuve: "Lunel", date: "14 mars 2026" },
  { epreuve: "Demi-finale — Saint-Cyr (86)", date: "29 mars 2026" },
  { epreuve: "Finale — Bray-Dunes (59)", date: "21 juin 2026" },
];

const D3_TRIATHLON = [
  { epreuve: "Draft — Marseillan", date: "10 mai 2026" },
  { epreuve: "Nailloux", date: "6 juin 2026" },
  { epreuve: "Lavaur (CLM)", date: "7 juin 2026" },
  { epreuve: "Demi-finale — Montauban", date: "4 juin 2026" },
  { epreuve: "Finale — Arques (62)", date: "12 septembre 2026" },
];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-toac-gray-200 py-12">
      <h2 className="section-title font-display text-xl uppercase text-toac-blue-950 sm:text-2xl">
        {title}
      </h2>
      <div className="mt-5 space-y-3 text-toac-blue-900/90">{children}</div>
    </section>
  );
}

export default function VieDuClubPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-display text-3xl uppercase text-toac-blue-950 sm:text-4xl">La vie du club</h1>

      <Section title="Soirées">
        <p>
          Rentrée (barbecue auberge espagnole), Noël, Assemblée Générale, et des apéros conviviaux après
          l'entraînement tout au long de la saison.
        </p>
      </Section>

      <Section title="Stage Mer — Argelès-sur-Mer">
        <p><strong>Du 3 au 7 avril 2026</strong> — 75 participants, 4 jours de sport et de convivialité au bord de la
        Méditerranée (sortie longue, multi-triathlons).</p>
        <p>Paiement en ligne — 234 € (séjour complet) ou 155 € (3 jours).</p>
      </Section>

      <Section title="Stage Montagne — Argelès-Gazost">
        <p><strong>Du 20 au 30 mai 2026</strong> — 13 participants, 7 jours (sortie longue, multi-enchaînements).</p>
        <p>Paiement en ligne — 462 €.</p>
      </Section>

      <Section title="Sortie club 2026 — Triathlon de Lacanau">
        <p>
          <strong>2-3 mai 2026</strong> —{" "}
          <a
            href="https://triathlonlacanau.fr/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-toac-blue-600 underline"
          >
            triathlonlacanau.fr
          </a>
          , formats M et L. Un maximum de Toacistes alignés le même week-end, logement compris (bungalows).
        </p>
        <p>
          Participation subventionnée par le club en fonction du bénévolat aux Triathlons du Lauragais : reste
          à charge 25 € (format M) ou 35 € (format L).
        </p>
      </Section>

      <Section title="D3 — Challenges régionaux 2026">
        <p className="text-sm text-toac-blue-900/70">Licence compétition obligatoire.</p>
        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div>
            <h3 className="font-display text-sm uppercase text-toac-blue-950">Duathlon</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {D3_DUATHLON.map((e) => (
                <li key={e.epreuve} className="flex justify-between border-b border-toac-gray-100 py-1">
                  <span>{e.epreuve}</span>
                  <span className="text-toac-blue-900/60">{e.date}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="font-display text-sm uppercase text-toac-blue-950">Triathlon</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {D3_TRIATHLON.map((e) => (
                <li key={e.epreuve} className="flex justify-between border-b border-toac-gray-100 py-1">
                  <span>{e.epreuve}</span>
                  <span className="text-toac-blue-900/60">{e.date}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <p className="mt-4 text-sm">
          + championnats régionaux individuels, ouverts à tous (calendrier de la ligue).
        </p>
      </Section>

      <Section title="Tenues du club">
        <p>
          La trifonction aux couleurs du TOAC est <strong>obligatoire pour les nouveaux adhérents en
          compétition</strong>. Une commande groupée est organisée chaque année en début de saison ; le stock des
          anciennes commandes reste disponible via le club.
        </p>
        <a
          href="#"
          className="inline-block text-sm font-medium text-toac-blue-600 underline"
        >
          Lien de commande des tenues (LIEN_COMMANDE_TENUES — à compléter)
        </a>
      </Section>
    </div>
  );
}
