import React, { Fragment, useState } from "react";
import { useNavigate } from "react-router-dom";

import { VscArrowRight } from "react-icons/vsc";
import { GrUpdate } from "react-icons/gr";

import { Transition, Dialog } from "@headlessui/react";
import { updateDisputeStatus } from "../utils";
//getMaxJurors let [maxJurors, serMaxJurors] = useState(0)
export default function DisputeCard({ dispute, maxJurors }) {
  let [isOpen, setIsOpen] = useState(false);

  const navigate = useNavigate();

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (
    <div className="rounded-md border-2 border-[#27C0EF] p-4 bg-[#F8F7FF] font-semibold text-[#313335] relative hover:cursor-pointer transition ease-in-out hover:scale-[1.02]">
      <div
        onClick={() => {
          navigate(`/dispute/${dispute.id}`);
        }}
        className="flex"
      >
        <div className="">
          <div className="flex items-center whitespace-pre-wrap mb-2">
            <div className="mr-6">Dispute № {dispute.id}</div>
          </div>
          <div className="flex items-center whitespace-pre-wrap font-normal">
            <div className="mr-4">
              Votes: <span className="">{dispute.votes.length}</span> /{" "}
              {maxJurors}
            </div>
            <div className="mr-4">
              Status:{" "}
              <span className="text-green-700">{dispute.dispute_status}</span>
            </div>
            <div className="">
              Service ID: <span className="">{dispute.service_id}</span>
            </div>
          </div>
        </div>
        <div
          style={{ borderLeftWidth: 2 }}
          className="border-l-1 border-gray-600 mx-4"
        ></div>
        <div>
          <div className="flex items-center whitespace-pre-wrap">
            {dispute.applicant}{" "}
            <VscArrowRight className="mx-2 stroke-2" width={34} height={20} />{" "}
            <span className="text-red-600">{dispute.accused}</span>
          </div>
          <div className="font-normal">
            <div className="mr-4">
              Judges: [{dispute.jury_members.toString()}]
            </div>
          </div>
        </div>
      </div>
      <div
        className="absolute hover:animate-spin hover:cursor-pointer right-0 top-0 -m-[13px] p-2 bg-[#27C0EF] rounded-full"
        onClick={openModal}
        key={"update-dipute"}
      >
        <GrUpdate />
      </div>
      <Transition appear show={isOpen} as={Fragment}>
        <Dialog
          as="div"
          className="fixed inset-0 z-50 overflow-y-auto"
          onClose={closeModal}
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
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  Actualizar disputa
                </Dialog.Title>
                <div className="mt-4">
                  <button
                    onClick={async () => {
                      await updateDisputeStatus(dispute.id);
                    }}
                    className="inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                  >
                    Ok
                  </button>
                  <button
                    onClick={closeModal}
                    className="inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-red-600 border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                  >
                    No
                  </button>
                </div>
              </div>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}
