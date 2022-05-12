import React, { useState } from "react";

import Select from "react-select";
import AsyncSelect from "react-select/async";

import tokensData from "../assets/tokensData.json";
import categoriesData from "../assets/categoriesData.json";

export default function ServicesFilter({ mains, setServices }) {
  const [categoriesService, setCategoriesService] = useState(null);

  const filterCategories = (inputValue) => {
    return categoriesData.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = (inputValue) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(filterCategories(inputValue));
      }, 500);
    });

  return (
    <div className="sticky top-4 border-2 shadow-md borde rounded-lg px-6 py-4 mt-4 mr-6 w-[260px] w-max-[260px] max-h-[400px] overflow-y-scroll">
      <div className="text-center font-semibold text-lg">Filtros</div>
      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>
      <div className="mx-1">
        <div className="mb-2">Duracion</div>
        <input
          className="!w-max-[148px] px-2 !w-[148px] rounded outline-2 outline outline-[#27C0EF] bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
          type={"number"}
        />
      </div>

      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="mx-1">
        <div className="mb-2">Precio</div>
        <input
          className="!w-max-[148px] !w-[148px] rounded px-2 outline-2 outline outline-[#27C0EF] bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
          type={"number"}
        />
      </div>

      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="mx-1">
        <div className="mb-1">Token</div>
        <div>
          <Select options={tokensData} />
        </div>
      </div>

      {mains ? (
        <></>
      ) : (
        <>
          <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>
          <div className="flex justify-between mx-1">
            <div className="mr-2">A la venta</div>
            <input
              checked={true}
              onChange={() => {}}
              type="checkbox"
              className="checked:bg-[#27C0EF]"
            ></input>
          </div>

          <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

          <div className="flex justify-between mx-1">
            <div className="mr-2">Vendido</div>
            <input
              checked={true}
              onChange={() => {}}
              type="checkbox"
              className="checked:bg-[#27C0EF]"
            ></input>
          </div>
        </>
      )}
      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="flex justify-between mx-1">
        <div className="mr-2">En Dispute</div>
        <input
          checked={true}
          onChange={() => {}}
          type="checkbox"
          className="checked:bg-[#27C0EF]"
        ></input>
      </div>

      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="mx-1">
        <div className="mb-1">Categoria</div>
        <div>
          <AsyncSelect
            cacheOptions
            defaultOptions
            isMulti
            value={categoriesService}
            onChange={(value) => {
              setCategoriesService(value);
            }}
            loadOptions={promiseOptions}
          />
        </div>
      </div>

      <div className="border rounded-lg my-4 border-[#27C0EF] w-full"></div>

      <div className="flex justify-center w-full">
        <button className="uppercase py-2 px-4 mt-2 rounded-lg border-transparent text-white text-md mr-4 bg-[#27C0EF] shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80">
          Apply
        </button>
      </div>
    </div>
  );
}
