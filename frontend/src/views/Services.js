import React, { useEffect, useState } from "react";
import IntersectionVisible from "react-intersection-visible";

import SkeletonLoaderService from "../components/SkeletonLoaderService";
import ServicesCard from "../components/ServicesCard";
import CreateServiceDialog from "../components/CreateServiceDialog";
import ServicesFilter from "../components/ServicesFilter";

import { getServices, getTotalServices } from "../utils";

import { useGlobalState } from "../state";

const MAX_AMOUNT_OF_SERVICES_PER_PAG = 10;

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [amountOfServices, setAmountOfServices] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [totalOfServices, setTotalOfServices] = useState(0);
  const [isUserCreated] = useGlobalState("isUserCreated");
  const [filter, setFilter] = useState(null);

  useEffect(() => {
    const foo = async () => {
      setTotalOfServices(await getTotalServices());
      let _services = await getServices(
        amountOfServices,
        MAX_AMOUNT_OF_SERVICES_PER_PAG
      );
      let finalServices = [];
      console.log(_services);
      if (_services.length > 0) {
        for (let i = 0; i < _services.length; i++) {
          try {
            _services[i].metadata.categories = JSON.parse(
              _services[i].metadata.categories
            );
            finalServices.push(_services[i]);
          } catch (e) {
            console.log(
              "La categoria",
              _services[i].id,
              "no tiene el formato correcto"
            );
          }
        }
      }

      setLoading(false);
      setServices(finalServices);
      setAmountOfServices(_services.length);
    };

    foo()
  }, []);

  async function onShow(entries) {
    let _services = await getServices(
      amountOfServices,
      MAX_AMOUNT_OF_SERVICES_PER_PAG
    );
    let finalServices = [];
    console.log(_services);
    if (_services.length > 0) {
      for (let i = 0; i < _services.length; i++) {
        try {
          _services[i].metadata.categories = JSON.parse(
            _services[i].metadata.categories
          );
          finalServices.push(_services[i]);
        } catch (e) {
          console.log(
            "La categoria",
            _services[i].id,
            "no tiene el formato correcto"
          );
        }
      }
    }

    // console.log(services)
    setServices([...services, ...finalServices]);
    setAmountOfServices(amountOfServices + _services.length);
  }

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  return (
    <div className="w-full">
      <div className="m-8 ">
        {loading ? (
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800"></div>
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v, i) => {
              return (
                <div key={i} className="my-6">
                  <SkeletonLoaderService />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-row">
            <div className="relative">
              {isUserCreated ? (
                <div className="flex justify-center">
                  <button
                    className="uppercase shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80 py-2 px-4 rounded-lg border-transparent font-semibold text-white text-md mr-4 bg-[#27C0EF]"
                    onClick={openModal}
                  >
                    Crear Servicio
                  </button>
                </div>
              ) : (
                <></>
              )}
              <ServicesFilter mains={false} />
            </div>
            <div className=" mx-auto">
              <div className="border-2 shadow-md rounded-lg px-8 py-4 mt-4">
                {services.length > 0 ? (
                  <>
                    {services.map((v, i) => {
                      return (
                        <div className="my-4" key={v.id}>
                          <ServicesCard service={v} />
                        </div>
                      );
                    })}
                  </>
                ) : (
                  <>
                    <div className="text-xl font-bold text-gray-800">
                      Parece ser que nadie ha creado servicios...
                    </div>
                  </>
                )}
                {amountOfServices < totalOfServices ? (
                  <IntersectionVisible
                    onIntersect={(e) => {}}
                    onHide={(e) => {}}
                    onShow={onShow}
                  >
                    <div className="h-40 flex items-center justify-center">
                      <svg className="spinner-normal" viewBox="0 0 50 50">
                        <circle
                          className="path"
                          cx="25"
                          cy="25"
                          r="20"
                          fill="none"
                          strokeWidth="5"
                        ></circle>
                      </svg>
                    </div>
                  </IntersectionVisible>
                ) : (
                  <></>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
      <CreateServiceDialog
        closeModal={closeModal}
        isOpen={isOpen}
        openModal={openModal}
      />
    </div>
  );
}
