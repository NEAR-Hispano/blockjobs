import React from "react";

import Select from "react-select";

const StatusData = [
  {
    value: "Open",
    label: "Open",
  },
  {
    value: "Voting",
    label: "Voting",
  },
  {
    value: "Executable",
    label: "Executable",
  },
  {
    value: "Finished",
    label: "Finished",
  },
];

export default function DisputesFilter(setDisputes) {
  return (
    <div className="sticky top-4 border-2 shadow-md borde rounded-lg px-6 py-4 mt-4 mr-6 w-[220px]  w-max-[220px] ">
      <div className="text-center font-semibold text-lg">Filtros</div>
      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="mx-1">
        <div className="mb-1">Estatus</div>
        <div>
          <Select options={StatusData} />
        </div>
      </div>

      {/* <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

            <div className="flex justify-between mx-1">
                <div className="mr-2">A la venta</div>
                <input checked={true} onChange={() => { }} type="checkbox" className="checked:bg-[#27C0EF]"></input>
            </div>

            <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

            <div className="flex justify-between mx-1">
                <div className="mr-2">Vendido</div>
                <input checked={true} onChange={() => { }} type="checkbox" className="checked:bg-[#27C0EF]"></input>
            </div> */}

      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="flex justify-center w-full">
        <button className="uppercase py-2 px-4 mt-2 rounded-lg border-transparent text-white text-md mr-4 bg-[#27C0EF] shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80">
          Aplicar
        </button>
      </div>
    </div>
  );
}
