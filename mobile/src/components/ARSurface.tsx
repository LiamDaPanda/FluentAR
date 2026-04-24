import React from "react";
import ARCameraView from "./ARCameraView";
import FloatingObjects, { type FloatingItem } from "./FloatingObjects";

type Props = {
  hint: string;
  items: FloatingItem[];
  highlightId?: string | null;
  onTap: (item: FloatingItem) => void;
};

export default function ARSurface({ hint, items, highlightId, onTap }: Props) {
  return (
    <>
      <ARCameraView hint={hint} />
      <FloatingObjects items={items} highlightId={highlightId} onTap={onTap} />
    </>
  );
}
