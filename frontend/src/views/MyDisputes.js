import React, { useState, useEffect } from "react";
import DisputeCard from "../components/DisputeCard";
import { getDisputes, getMaxJurors } from "../utils";
import SkeletonLoaderDispute from "../components/SkeletonLoaderDispute";
import DisputesFilter from "../components/DisputesFilter";

export default function MyDisputes() {
  let [loading, setLoading] = useState(true);
  let [maxJurors, setMaxJurors] = useState(0);
  let [disputes, setDisputes] = useState();

  useEffect(() => {
    const foo = async () => {
      const d = await getDisputes(0, 10);

      setDisputes(d);
      setMaxJurors(await getMaxJurors());
      setLoading(false);
    };

    foo()
  }, []);

  return (
    <div className="m-8 w-full">
      {loading ? (
        <div className="">
          <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
            <div className="text-xl font-bold text-gray-800 mb-2">
              My disputes
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
              My disputes
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
              My disputes
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
                My disputes
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
                  It seems that you have not created disputes...
                  </div>
                </>
              )}
            </div>

            <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
              <div className="text-xl text-center font-bold text-gray-800 mb-2">
                Disputes against you
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
                  It seems that there are no disputes against you...
                  </div>
                </>
              )}
            </div>

            <div className="shadow-md border-2 rounded-lg px-6 py-4 w-full mt-4">
              <div className="text-xl font-bold text-center text-gray-800 mb-2">
                Judge
              </div>
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
                  It seems that you are not a judge of some dispute...
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
