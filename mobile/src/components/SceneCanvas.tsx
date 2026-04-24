import React from "react";
import ARCameraView from "./ARCameraView";

type Props = {
  theme?: string;
  hint?: string;
};

export default function SceneCanvas({ hint }: Props) {
  return <ARCameraView hint={hint} />;
}
