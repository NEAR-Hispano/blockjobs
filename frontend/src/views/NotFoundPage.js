import React from "react";

export default function NotFoundPage() {
  return (
    <div>
      <div className="flex items-center justify-center">
        <div className="font-black text-[120px] text-center">Pagina no encontrada!!!</div>
      </div>
      <div className="flex items-center justify-center mb-10">
        <img className="w-[512px]" src={require("../assets/no-results.png")}></img>
      </div>
    </div>
  );
}