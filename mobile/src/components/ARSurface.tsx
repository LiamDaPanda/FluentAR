import React from "react";
import SceneCanvas from "./SceneCanvas";
import FloatingObjects, { type FloatingItem } from "./FloatingObjects";

type Props = {
  hint: string;
  theme?: string;
  items: FloatingItem[];
  highlightId?: string | null;
  onTap: (item: FloatingItem) => void;
};

export default function ARSurface({ hint, theme, items, highlightId, onTap }: Props) {
  return (
    <>
      <SceneCanvas theme={theme} hint={hint} />
      <FloatingObjects items={items} highlightId={highlightId} onTap={onTap} />
    </>
  );
}
