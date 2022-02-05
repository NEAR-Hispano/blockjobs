import React, { Fragment, useState } from "react"

import { Transition, Dialog } from '@headlessui/react'
import { toast } from "react-toastify";

import { addAccusedProves, reclaimDispute } from "../utils";
import MarkdownViewer from "./MarkdowViewer";

export default function CreateDisputeDialog({ isOpen, closeModal, openModal, serviceId, disputeId }) {
    const [typing, setTyping] = useState(false)
    const [sendinigProves, setSendinigProves] = useState(false)
    const [typingTimeout, ssendinigProvesimeout] = useState(0)
    const [proveInput, setProveInput] = useState("")

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
                        <div className="min-w-[80%] inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-semibold leading-6 text-gray-900"
                            >
                                {
                                    disputeId == null ? `Crear una nueva disputa` : `Agrege pruebas a su favor`
                                }
                            </Dialog.Title>
                            <div className="mt-2">
                                {
                                    <p className="text-sm text-gray-500 border-b-2 pb-2 whitespace-pre-line">
                                        Por favor, rellene este formulario para agregar pruebas a su favor.
                                        <span className="font-semibold text-gray-700"> El formato de las pruebas es <span className="font-extrabold text-gray-900">Markdown.</span>
                                        </span>
                                    </p>
                                }
                            </div>
                            <div className="mt-2">
                                <label className="text-gray-700 text-sm font-semibold">
                                    Pruebas
                                </label>
                                {/* proveInput, setProveInput */}
                                <textarea
                                    value={proveInput}
                                    onChange={(e) => { setProveInput(e.target.value) }}
                                    className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                ></textarea>
                            </div>
                            <div className="mt-2 max-h-[500px]">
                                <div className="text-gray-700 text-sm font-semibold">Pre visualizacion</div>
                                <div className="border-[#27C0EF] border-2 w-full min-h-[100px] rounded py-2 px-4 max-h-[400px] overflow-y-scroll overflow-x-scroll">
                                    <MarkdownViewer text={proveInput} />
                                </div>
                            </div>
                            <div className="mt-8">
                                <button
                                    type="button"
                                    className={sendinigProves ?
                                        "inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-slate-400 cursor-not-allowed border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold" :
                                        "inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                                    }
                                    disabled={sendinigProves}
                                    onClick={async () => {
                                        if (proveInput.length > 0) {
                                            if(disputeId == null) {
                                                setSendinigProves(true)
                                                await reclaimDispute(serviceId, proveInput)
                                                setSendinigProves(false)
                                                console.log("a")
                                            } else {
                                                await addAccusedProves(disputeId, proveInput)
                                            }
                                        } else {
                                            toast.error("Por favor, agrege las pruebas")
                                        }
                                    }}
                                >
                                    Enviar!
                                    {
                                        sendinigProves ? (
                                            <div className="ml-2">
                                                <svg className="spinner-normal" viewBox="0 0 50 50">
                                                    <circle className="path !stroke-white" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                                                </svg>
                                            </div>
                                        ) : (
                                            <></>
                                        )
                                    }
                                </button>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}