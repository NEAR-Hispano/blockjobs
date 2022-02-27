import React, { useEffect, useState } from "react";
import DisputeCard from "../components/DisputeCard";
import DisputesFilter from "../components/DisputesFilter";
import SkeletonLoaderDispute from "../components/SkeletonLoaderDispute";
import { getDisputes, getMaxJurors } from "../utils";

export default function Disputes() {
  let [loading, setLoading] = useState(true);
  let [maxJurors, setMaxJurors] = useState(0);
  let [disputes, setDisputes] = useState();

  useEffect(async () => {
    const d = await getDisputes(0, 10);

    console.log(d);
    setDisputes(d);
    setMaxJurors(await getMaxJurors());
    setLoading(false);
  }, []);

  return (
    <div className="m-8">
      {loading ? (
        <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
          <div className="text-xl font-bold text-gray-800">Mis servicios</div>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((v, i) => {
            return (
              <div key={i} className="my-6">
                <SkeletonLoaderDispute />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-row">
          <div className="relative">
            <DisputesFilter />
          </div>
          <div className="mx-auto">
            <div className="border-2 shadow-md rounded-lg px-8 py-8 mt-4">
              {disputes.length ? (
                <>
                  {disputes.map((v, i) => {
                    return (
                      <div className="mb-4">
                        <DisputeCard
                          key={v.id}
                          dispute={v}
                          maxJurors={maxJurors}
                        />
                      </div>
                    );
                  })}
                </>
              ) : (
                <>
                  <div className="text-xl font-bold text-gray-800">
                    Parece ser que nadie ha creado una disputa...
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
