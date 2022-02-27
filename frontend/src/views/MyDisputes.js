import React, { useState, useEffect } from "react";
import DisputeCard from "../components/DisputeCard";
import { getDisputes, getMaxJurors } from "../utils";
import SkeletonLoaderDispute from "../components/SkeletonLoaderDispute";
import DisputesFilter from "../components/DisputesFilter";

export default function MyDisputes() {
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
    <div className="m-8 w-full">
      {loading ? (
        <div className="">
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800 mb-2">
              Mis disputas
            </div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-6">
                  <SkeletonLoaderDispute />
                </div>
              );
            })}
          </div>
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800 mb-2">
              Mis disputas
            </div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-6">
                  <SkeletonLoaderDispute />
                </div>
              );
            })}
          </div>
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800 mb-2">
              Mis disputas
            </div>
            {[0, 1].map((v, i) => {
              return (
                <div key={i} className="my-6">
                  <SkeletonLoaderDispute />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="flex flex-row">
          <div className="relative h-screen">
            <DisputesFilter />
          </div>
          <div className="mx-auto">
            <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
              <div className="text-xl text-center font-bold text-gray-800 mb-2">
                Mis disputas
              </div>
              {/*.filter((v) => window.accountId === v.applicant)*/}
              {disputes.length ? (
                <>
                  {disputes
                    .filter((v) => window.accountId === v.applicant)
                    .map((v, i) => {
                      return (
                        <div className="mb-4" key={i}>
                          <DisputeCard dispute={v} maxJurors={maxJurors} />
                        </div>
                      );
                    })}
                </>
              ) : (
                <>
                  <div className="text-xl mt-4 font-bold text-gray-600">
                    Parece ser que no has creado disputas...
                  </div>
                </>
              )}
            </div>

            <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
              <div className="text-xl text-center font-bold text-gray-800 mb-2">
                Disputas en contra
              </div>
              {/* {disputes
                .filter((v) => window.accountId === v.accused)
                .map((v, i) => {
                  return (
                    <div className="mb-4" key={v.id}>
                      <DisputeCard dispute={v} maxJurors={maxJurors} />
                    </div>
                  );
                })} */}
              {disputes.length ? (
                <>
                  {disputes
                    .filter((v) => window.accountId === v.accused)
                    .map((v, i) => {
                      return (
                        <div className="mb-4" key={i}>
                          <DisputeCard dispute={v} maxJurors={maxJurors} />
                        </div>
                      );
                    })}
                </>
              ) : (
                <>
                  <div className="text-xl mt-4 font-bold text-gray-600">
                    Parece ser que no hay disputas en tu contra...
                  </div>
                </>
              )}
            </div>

            <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
              <div className="text-xl font-bold text-center text-gray-800 mb-2">Juez</div>
              {/* {disputes
                .filter((v) =>
                  v.jury_members.find((v) => v === window.accountId)
                )
                .map((v, i) => {
                  return (
                    <div className="mb-4" key={v.id}>
                      <DisputeCard dispute={v} maxJurors={maxJurors} />
                    </div>
                  );
                })} */}

              {disputes.length ? (
                <>
                  {disputes
                    .filter((v) =>
                      v.jury_members.find((v) => v === window.accountId)
                    )
                    .map((v, i) => {
                      return (
                        <div className="mb-4" key={v.id}>
                          <DisputeCard dispute={v} maxJurors={maxJurors} />
                        </div>
                      );
                    })}
                </>
              ) : (
                <>
                  <div className="text-xl mt-4 font-bold text-gray-600">
                    Parece ser que no eres juez de alguna disputa...
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
