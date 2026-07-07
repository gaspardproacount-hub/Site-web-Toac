"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Affiche une image du site en acceptant automatiquement plusieurs formats.
 * On donne juste le nom du fichier SANS extension (ex. "hero-accueil") et le
 * composant essaie successivement .jpg, .jpeg, .png puis .webp dans le dossier
 * public/images/. Si aucun fichier n'existe encore, un cadre "placeholder"
 * légendé s'affiche à la place (le site reste donc toujours présentable).
 */
const EXTENSIONS = ["jpg", "jpeg", "png", "webp"] as const;

export default function SiteImage({
  name,
  label,
  className = "",
  priority = false,
}: {
  name: string;
  label: string;
  className?: string;
  priority?: boolean;
}) {
  const [extIndex, setExtIndex] = useState(0);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function handleError() {
    if (extIndex < EXTENSIONS.length - 1) {
      setExtIndex(extIndex + 1);
    } else {
      setFailed(true);
    }
  }

  // Rattrape le cas où l'image a échoué AVANT l'hydratation React (l'événement
  // onError n'aurait alors pas été capté) : on vérifie l'état réel de l'image.
  useEffect(() => {
    const img = imgRef.current;
    if (img && img.complete && img.naturalWidth === 0) {
      handleError();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extIndex]);

  if (failed) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-toac-blue-800 to-toac-blue-950 text-center ${className}`}
        role="img"
        aria-label={label}
      >
        <span className="px-4 font-display text-sm uppercase tracking-wide text-white/70">
          📷 {label}
        </span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={imgRef}
      src={`/images/${name}.${EXTENSIONS[extIndex]}`}
      alt={label}
      loading={priority ? "eager" : "lazy"}
      className={`object-cover ${className}`}
      onError={handleError}
    />
  );
}
