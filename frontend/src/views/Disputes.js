import React, { useEffect, useState } from "react";
import IntersectionVisible from "react-intersection-visible";

import DisputeCard from "../components/DisputeCard";
import DisputesFilter from "../components/DisputesFilter";
import SkeletonLoaderDispute from "../components/SkeletonLoaderDispute";
import { getDisputes, getMaxJurors, getTotalDisputes } from "../utils";

const maxAmountOfDisputesPerPag = 10;

export default function Disputes() {
  let [loading, setLoading] = useState(true);
  let [maxJurors, setMaxJurors] = useState(0);
  let [disputes, setDisputes] = useState([]);
  let [totalOfDisputes, setTotalOfDisputes] = useState(0);

  useEffect(() => {
    const foo = async () => {
      setTotalOfDisputes(await getTotalDisputes());

      const d = await getDisputes(0, maxAmountOfDisputesPerPag);

      setDisputes(d);
      setMaxJurors(await getMaxJurors());
      setLoading(false);
    };

    foo()
  }, []);

  async function onShow(entries) {
    const d = await getDisputes(disputes.length, maxAmountOfDisputesPerPag);
    setDisputes([...disputes, ...d]);
  }

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

              {disputes.length < totalOfDisputes ? (
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
  );
}
