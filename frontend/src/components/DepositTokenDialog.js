import React, { Fragment, useState } from "react";
import { Transition, Dialog } from "@headlessui/react";
import { buyFT, ftTransferCallJOBS, ftTransferCallUSDC, withdrawFT } from "../utils";
import tokensData from "../../assets/tokensData.json"

export default function DepositTokenDialog({ isOpen, closeModal, openModal, token, withdraw }) {
  const [amountOfTokens, setAmountOfTokens] = useState("0.0");

  const handleNumber = (e) => {
    console.log(e.target.value.length)
    let input = e.target.value.length > 10 ? amountOfTokens : e.target.value;

    if (input.match(/^[0-9]*\.[0-9]+([eE][0-9]+)?$/)) {
      setAmountOfTokens(input);
    }
  };

  return (
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
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 bg-[#F8F7FF]" />
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
                className="text-lg font-semibold leading-6 text-gray-900 text-center"
              >
                {!withdraw ? `Depositar ${token}` : `Retirar ${token}`}
              </Dialog.Title>
              <div className="mt-2">
                <div className="h-auto w-32 mr-4">
                  <div className="flex items-center">
                    <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1 mr-4">
                      <input
                        className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
                        value={amountOfTokens}
                        onChange={handleNumber}
                        required
                      ></input>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                  onClick={async () => {
                    // let address = tokensData.find((v) => {v.label == token});
                    let amount = parseFloat(amountOfTokens);
                    console.log(amount * (10**18));
                    
                    if (token == "JOBS") {
                      if (!withdraw) {
                        await ftTransferCallJOBS( String(amount * (10**18)) )
                      }
                      else {
                        await withdrawFT(amount * (10**18), window.ftContract.contractId)
                      }
                    } else {
                      if (!withdraw) {
                        await ftTransferCallUSDC( String(amount * (10**18)) )
                      }
                      else {
                        await withdrawFT(amount * (10**18), window.USDCConstract.contractId)
                      }
                    }
                  }}
                >
                  {!withdraw ? "Depositar!" : "Retirar!"}
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
