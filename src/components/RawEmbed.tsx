"use client";

import { useEffect, useRef } from "react";

/**
 * Injecte un code d'intégration (embed) externe — typiquement un widget
 * Instagram à base de <script> (Behold, LightWidget, Elfsight…). Contrairement
 * à `dangerouslySetInnerHTML`, ce composant ré-exécute les balises <script>
 * du code collé, ce qui est nécessaire pour que le widget se charge.
 */
export default function RawEmbed({ html }: { html: string }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = ref.current;
    if (!container) return;
    container.innerHTML = html;

    // Ré-exécute les scripts (innerHTML ne les exécute pas automatiquement).
    container.querySelectorAll("script").forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) =>
        newScript.setAttribute(attr.name, attr.value)
      );
      newScript.textContent = oldScript.textContent;
      oldScript.replaceWith(newScript);
    });
  }, [html]);

  return <div ref={ref} />;
}
