import React, { Fragment, useEffect, useState } from "react";

import SkeletonLoaderService from "../components/SkeletonLoaderService";
import ServicesCard from "../components/ServicesCard";
import { getServices, getUserServices } from "../utils";

import ServicesFilter from "../components/ServicesFilter";

export default function Services() {
  let [services, setServices] = useState([]);
  let [loading, setLoading] = useState(true);

  useEffect(async () => {
    let services = await getServices(0, 15);
    let finalServices = [];
    console.log(services);
    if (services.length > 0) {
      for (let i = 0; i < services.length; i++) {
        try {
          services[i].metadata.categories = JSON.parse(
            services[i].metadata.categories
          );
          finalServices.push(services[i]);
        } catch (e) {
          console.log(
            "La categoria",
            services[i].id,
            "no tiene el formato correcto"
          );
        }
      }
    }

    setLoading(false);
    setServices(finalServices);
  }, []);
  // const final = Number(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
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
                {}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
