import React from "react";
import FirstAidGuide from "@/components/FirstAidGuide";

export default function PrimeirosSocorros() {
  return (
    <div className="px-5 py-5">
      <h1 className="text-2xl font-extrabold tracking-tight">Primeiros Socorros</h1>
      <p className="text-sm text-muted-foreground">Como agir durante uma crise epiléptica</p>
      <div className="mt-4">
        <FirstAidGuide />
      </div>
    </div>
  );
}