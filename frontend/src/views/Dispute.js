import React, { useEffect, useState, Fragment } from "react";
import { useParams } from "react-router-dom";
import CreateDisputeDialog from "../components/CreateDisputeDialog";
import DisputeCard from "../components/DisputeCard";
import MarkdownViewer from "../components/MarkdowViewer";
import { Transition, Dialog } from "@headlessui/react";
import { toast } from "react-toastify";

import { useGlobalState } from "../state";
import {
  getDispute,
  getMaxJurors,
  preVote,
  updateDisputeStatus,
  vote,
} from "../utils";

export default function Dispute() {
  const [loading, setLoading] = useState(true);
  let [isOpenCreateDispute, setIsOpenCreateDispute] = useState(false);
  let [isOpenVoting, setIsOpenVoting] = useState(false);
  let [voteInFavor, setVoteInFavor] = useState(false);
  let [voteAgaints, setVoteAgaints] = useState(false);
  const [isUserCreated] = useGlobalState("isUserCreated");
  let [maxJurors, setMaxJurors] = useState(0);
  const [dispute, setDispute] = useState();

  const params = useParams();

  useEffect(() => {
    const foo = async () => {
      // await updateDisputeStatus(Number(params.id))
      setMaxJurors(await getMaxJurors());
      const d = await getDispute(Number(params.id));
      setDispute(d);
      setLoading(false);
    };

    foo();
  }, []);

  function openModalCreateDispute() {
    setIsOpenCreateDispute(true);
  }

  function closeModalCreateDispute() {
    setIsOpenCreateDispute(false);
  }
  function openModalOpenVoting() {
    setIsOpenVoting(true);
  }

  function closeModalOpenVoting() {
    setIsOpenVoting(false);
  }

  const handleVoteInFavor = (e) => {
    if (voteAgaints) {
      setVoteAgaints(false);
    }
    setVoteInFavor(e.target.value);
  };

  const handleVoteAgaints = (e) => {
    if (voteInFavor) {
      setVoteInFavor(false);
    }
    setVoteAgaints(e.target.value);
  };

  const _MS_PER_DAY = 1000 * 60 * 60 * 24;

  // a and b are javascript Date objects
  function dateDiffInDays(a, b) {
    // Discard the time and time-zone information.
    const utc1 = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
    const utc2 = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());

    return Math.floor((utc2 - utc1) / _MS_PER_DAY);
  }
  const getDate = () => {
    // let s = new Date(Math.round((sold_moment) / 1000000)) - clock
    let s = new Date(Math.round(dispute.initial_timestamp / 1000000));
    return getTimeStamp(s);
  };

  const getTimeStamp = (s) => {
    return (
      s.getDate() +
      "/" +
      (s.getMonth() + 1) +
      "/" +
      s.getFullYear() +
      "  (" +
      s.getHours() +
      ":" +
      s.getMinutes() +
      ":" +
      s.getSeconds() +
      ")"
    );
  };

  const getStatus = () => {
    // let s = new Date(Math.round((sold_moment) / 1000000)) - clock
    let s = new Date(Math.round(dispute.initial_timestamp / 1000000));
    let now = new Date();
    const diff = dateDiffInDays(s, now);
    if (diff <= 5) {
      let f = s;
      f.setDate(f.getDate() + 5);
      return (
        "La etapa de Open acabara el " +
        getTimeStamp(f) +
        "\n" +
        "La etapa de votacion " +
        getTimeStamp(new Date(f.setDate(f.getDate() + 10)))
      );
    }
  };

  return (
    <div>
      {loading ? (
        <div className="h-screen">
          <svg className="spinner" viewBox="0 0 50 50">
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
      ) : (
        <div className="m-8">
          {!dispute.accused_proves &&
            dispute.accused == window.accountId &&
            dispute.dispute_status == "Open" &&
            isUserCreated && (
              <div className="flex justify-center">
                <button
                  onClick={openModalCreateDispute}
                  className="uppercase py-2 px-4 rounded-lg bg-red-500 border-transparent text-white text-md mb-4"
                >
                  Agregar pruebas!!!
                </button>
                <CreateDisputeDialog
                  isOpen={isOpenCreateDispute}
                  closeModal={closeModalCreateDispute}
                  openModal={openModalCreateDispute}
                  disputeId={dispute.id}
                />
              </div>
            )}

          {window.accountId != dispute.accused &&
            window.accountId != dispute.applicant &&
            (!dispute.jury_members.length ||
              dispute.jury_members.find((v) => v !== window.accountId)) &&
            isUserCreated &&
            dispute.dispute_status == "Open" && (
              <div className="flex justify-center">
                <button
                  onClick={async () => {
                    await preVote(dispute.id);
                  }}
                  className="uppercase py-2 px-4 rounded-lg bg-red-500 border-transparent text-white text-md mb-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                >
                  Ser parte del jurado!!!
                </button>
              </div>
            )}

          {window.accountId != dispute.accused &&
            window.accountId != dispute.applicant &&
            dispute.jury_members.find((v) => v === window.accountId) &&
            (!dispute.votes.length ||
              dispute.votes.find((v) => v.account !== window.accountId)) &&
            dispute.dispute_status == "Voting" && (
              <div className="flex justify-center">
                <button
                  onClick={openModalOpenVoting}
                  className="uppercase py-2 px-4 rounded-lg bg-red-500 border-transparent text-white text-md mb-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                >
                  Votar
                </button>
                <Transition appear show={isOpenVoting} as={Fragment}>
                  <Dialog
                    as="div"
                    className="fixed inset-0 z-50 overflow-y-auto"
                    onClose={closeModalOpenVoting}
                  >
                    <div className="min-h-screen px-4 text-center">
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0"
                        enterTo="opacity-0"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-0"
                        leaveTo="opacity-0"
                      >
                        <Dialog.Overlay className="fixed inset-0" />
                      </Transition.Child>
                      {/* This element is to trick the browser into centering the modal contents. */}
                      <span
                        className="inline-block h-screen align-middle"
                        aria-hidden="true"
                      >
                        &#8203;
                      </span>
                      <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                      >
                        <div className="w-auto inline-block max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                          <Dialog.Title
                            as="h3"
                            className="text-lg font-semibold leading-6 text-gray-900 flex justify-center"
                          >
                            Votar
                          </Dialog.Title>
                          <div className="mt-4 flex justify-center">
                            <div className="mr-4">
                              <div className=" text-gray-900 pl-2">
                                En favor
                              </div>
                              <input
                                checked={voteInFavor}
                                onChange={handleVoteInFavor}
                                type="checkbox"
                                className="checked:bg-[#27C0EF] w-full"
                              ></input>
                            </div>

                            <div>
                              <div className="text-gray-900 pl-2">
                                En contra
                              </div>
                              <input
                                checked={voteAgaints}
                                onChange={handleVoteAgaints}
                                type="checkbox"
                                className="checked:bg-[#27C0EF] w-full"
                              ></input>
                            </div>
                          </div>
                          <div className="mt-4">
                            <button
                              type="button"
                              className="inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                              onClick={async () => {
                                if (!voteAgaints && !voteInFavor) {
                                  toast.error(
                                    "Por favor, medite, analice y vote por algun lado."
                                  );
                                  return;
                                }
                                const finalVote = voteInFavor ? true : false;

                                await vote(dispute.id, finalVote);
                              }}
                            >
                              Votar!
                            </button>
                            <button
                              type="button"
                              className="inline-flex justify-center px-4 py-2 text-white bg-[#FF0000] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                              onClick={closeModalOpenVoting}
                            >
                              Ahora no!
                            </button>
                          </div>
                        </div>
                      </Transition.Child>
                    </div>
                  </Dialog>
                </Transition>
              </div>
            )}

          <div className="shadow-lg border-2 rounded-lg px-6 py-4 ">
            <div className="text-2xl flex justify-center font-bold text-gray-800 mb-2">
              Disputa
            </div>
            <DisputeCard dispute={dispute} maxJurors={maxJurors} />
          </div>
          <div className="shadow-lg border-2 rounded-lg px-6 py-4 mt-8">
            <div className="text-2xl  flex justify-center font-bold text-gray-800 mb-1">
              Pruebas
            </div>
            <div className="flex flex-row">
              <div className="w-[50%]">
                <div className="text-lg flex justify-center font-bold text-gray-800 mb-2">
                  Acusador
                </div>
                <div className="border-[#27C0EF] border-2 w-full min-h-[400px] rounded py-2 px-4 max-h-[400px] overflow-y-scroll overflow-x-scroll">
                  <MarkdownViewer text={dispute.applicant_proves} />
                </div>
              </div>
              <div className="mx-2" />
              <div className="w-[50%]">
                <div className="text-lg font-bold flex justify-center text-gray-800 mb-2">
                  Acusado
                </div>
                {dispute.accused_proves && (
                  <div className="border-[#27C0EF] border-2 w-full min-h-[400px] rounded py-2 px-4 max-h-[400px] overflow-y-scroll overflow-x-scroll">
                    <MarkdownViewer text={dispute.accused_proves} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="shadow-lg border-2 rounded-lg px-6 py-4 mt-8">
            <div className="text-2xl font-bold text-gray-800 mb-1 text-center">Etapas</div>
            <div>Momento de creacion {getDate()}</div>
            <div>{getStatus()}</div>
          </div>
        </div>
      )}
    </div>
  );
}
