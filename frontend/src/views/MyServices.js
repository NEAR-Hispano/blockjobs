import React, { useEffect, useState } from "react";

import ServicesCard from "../components/ServicesCard";
import CreateServiceDialog from "../components/CreateServiceDialog";
import SkeletonLoaderService from "../components/SkeletonLoaderService";

import { getUserServices } from "../utils";
import ServicesFilter from "../components/ServicesFilter";

export default function MyServices() {
  let [services, setServices] = useState([]);
  let [loading, setLoading] = useState(true);
  let [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const foo = async () => {
      const _services = await getUserServices();
      let finalServices = [];
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

      setServices(finalServices);

      setLoading(false);
    };

    foo()
  }, []);

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  useEffect(() => {}, []);

  return (
    <div className="m-8 w-full">
      {loading ? (
        <div className="">
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800">Mis servicios</div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-6">
                  <SkeletonLoaderService />
                </div>
              );
            })}
          </div>
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800">
              Servicios adquiridos
            </div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-4">
                  <SkeletonLoaderService />
                </div>
              );
            })}
          </div>
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800">
              Servicios vendidos
            </div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-4">
                  <SkeletonLoaderService />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-row">
          <CreateServiceDialog
            isOpen={isOpen}
            closeModal={closeModal}
            openModal={openModal}
            service={null}
          />
          <div className="relative">
            <div className="flex justify-center">
              <button
                className="uppercase shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80 py-2 px-4 rounded-lg border-transparent font-semibold text-white text-md mr-4 bg-[#27C0EF]"
                onClick={openModal}
              >
                Crear Servicio
              </button>
            </div>
            <ServicesFilter mains={true} />
          </div>
          <div className="mx-auto">
            <div>
              <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
                <div className="text-xl text-center font-bold text-gray-800">
                  Mis servicios
                </div>
                {services.length ? (
                  <>
                    {services
                      .filter((v) => !v.sold)
                      .map((v, i) => {
                        return (
                          <div key={i} className="my-6">
                            <ServicesCard service={v} />
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <>
                    <div className="text-xl mt-4 font-bold text-gray-600">
                      Parece ser que no has creado servicios aun...
                    </div>
                  </>
                )}
              </div>
              <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
                <div className="text-xl text-center font-bold text-gray-800">
                  Servicios adquiridos
                </div>
                {services.length ? (
                  <>
                    {services
                      .filter(
                        (v) => v.actual_owner == window.accountId && v.sold
                      )
                      .map((v, i) => {
                        return (
                          <div key={i} className="my-6">
                            <ServicesCard service={v} />
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <>
                    <div className="text-xl mt-4 font-bold text-gray-600">
                      Parece ser que no has adquirido servicios aun...
                    </div>
                  </>
                )}
              </div>
              <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
                <div className="text-xl font-bold text-center text-gray-800">
                  Servicios vendidos
                </div>
                {services.length ? (
                  <>
                    {services
                      .filter(
                        (v) => v.actual_owner != window.accountId && v.sold
                      )
                      .map((v, i) => {
                        return (
                          <div key={i} className="my-6">
                            <ServicesCard service={v} />
                          </div>
                        );
                      })}
                  </>
                ) : (
                  <>
                    <div className="text-xl mt-4 font-bold text-gray-600">
                      Parece ser que no has adquirido servicios aun...
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
