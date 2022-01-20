import React, { Fragment, useEffect, useState } from "react";
import { Transition, Dialog } from '@headlessui/react'
import Select from 'react-select';
import makeAnimated from 'react-select/animated';

import ServicesCard from "../components/ServicesCard";

import { utils } from "near-api-js";
import { toast } from "react-toastify";

const animatedComponents = makeAnimated();

export default function Services() {
    let [services, setServices] = useState([]);
    let [loading, setLoading] = useState(true)
    let [isOpen, setIsOpen] = useState(false)

    useEffect(async ()=>{
        try {
			setServices(await window.contract.get_user_services({account_id: window.accountId, only_on_sale: false}))
			setLoading(false)
		} catch(e) {
			setLoading(false)
			toast.error(String(e.message.match("\".*\"")))
			console.log(e)
		}
    }, [])
    
    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    useEffect(() => {

    }, [])

    return (
        <div className="p-4">
            {
                loading ? (
                    <div className="h-screen">
                        <svg className="spinner" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                    </div>
                ) : (
                    <>
                        <div>
                            <button
                                className="uppercase py-2 px-4 rounded-lg border-transparent text-gray-900 text-md mr-4 bg-[#27C0EF]"
                                onClick={openModal}
                            >
                                Create Service
                            </button>
                        </div>
                        <CreateService isOpen={isOpen} closeModal={closeModal} openModal={openModal} />
                        <div>Servicios</div>
                        {
                            services.map((v, i) => {return (
                                <ServicesCard service={v} key={v.id}/>
                            )})
                        }
                    </>
                )
            }
        </div>
    )
}

function CreateService({ isOpen, closeModal, openModal }) {

    let [titleService, setTitleService] = useState("")
    let [descriptionService, setDescriptionService] = useState("")
    let [categoriesService, setCategoriesService] = useState("")
    let [iconService, setIconService] = useState("")
    let [priceService, setPriceService] = useState(0)
    let [durationService, setDurationService] = useState(0)
    let [amountOfServices, setAmountOfServicesService] = useState(0)

    const options = [
        { value: 'Chocolate', label: 'Prueba' },
        { value: 'Strawberry', label: 'Prueba' },
        { value: 'Vanilla', label: 'Prueba' }
    ]

    const handleOnChangeDuration = (e) => {
        const final = Number(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
        setDurationService(final)
    }

    const handleOnChangeAmount = (e) => {
        const final = Number(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
        setAmountOfServicesService(final)
    }

    const handleOnChangePrice = (e) => {
        const final = Number(e.target.value.replace(/[^0-9.]/g, '').replace(/(\..*?)\..*/g, '$1'))
        setPriceService(final)
    }

    const handleCounter = (mul, v, setterHook) => {
        if ((v == 0) && mul <= 0) {
            return
        }

        v = v + (1 * mul)
        console.log(v)
        setterHook(v)
    }

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
                        <div className="min-w-[50%] inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                            <Dialog.Title
                                as="h3"
                                className="text-lg font-semibold leading-6 text-gray-900"
                            >
                                Crear un nuevo servicio
                            </Dialog.Title>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 border-b-2 pb-2">
                                    Por favor, rellene este formulario para poder crear un nuevo servicio. Al finalizar se va a cobrar un peaje de 0.05 NEARS para cubrir el storage,
                                    el sobrante se rotornara.
                                </p>
                            </div>
                            <div className="mt-2">
                                <label className="text-gray-700 text-sm font-semibold">
                                    Titulo
                                </label>
                                <input
                                    value={titleService}
                                    onChange={(e) => { setTitleService(e.target.value) }}
                                    className={
                                        "mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]" }
                                ></input>

                                <label className="text-gray-700 text-sm font-semibold">
                                    Descripcion
                                </label>
                                <textarea
                                    value={descriptionService}
                                    onChange={(e) => { setDescriptionService(e.target.value) }}
                                    className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                ></textarea>

                                <label className="text-gray-700 text-sm font-semibold">
                                    Imagen
                                </label>
                                <input
                                    value={iconService}
                                    onChange={(e) => { setIconService(e.target.value) }}
                                    className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                ></input>

                                <label className="text-gray-700 text-sm font-semibold">
                                    Categorias
                                </label>
                                <div>
                                    <Select
                                        closeMenuOnSelect={false}
                                        // components={animatedComponents}
                                        isMulti
                                        options={options}
                                        className="react-select" classNamePrefix="react-select"
                                    />
                                </div>

                                <div className="flex flex-row mb-2">
                                    {


                                        [
                                            {title: "Duracion (dias)", value: durationService, action: handleOnChangeDuration, counter: handleCounter, value: durationService, setter: setDurationService},
                                            {title: "Cantidad", value: amountOfServices, action: handleOnChangeAmount, counter: handleCounter, value: amountOfServices, setter: setAmountOfServicesService},
                                            {title: "Precio", value: priceService, action: handleOnChangePrice, counter: handleCounter, value: priceService, setter: setPriceService},
                                        ].map((v, i) => {return (
                                                <div className="h-auto w-32 mr-4" key={i}>
                                                    <label className="w-full text-gray-700 text-sm font-semibold">{v.title}
                                                    </label>
                                                    <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
                                                        <button className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none" onClick={() => {v.counter(-1, v.value, v.setter)}}>
                                                            <span className="m-auto text-2xl font-thin">−</span>
                                                        </button>
                                                        <input className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700  outline-none"
                                                            value={v.value} onChange={v.action}
                                                        ></input>
                                                        <button className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer" onClick={() => {v.counter(1, v.value, v.setter)}}>
                                                            <span className="m-auto text-2xl font-thin">+</span>
                                                        </button>
                                                    </div>
                                                </div>
                                        )})
                                    }
                                </div>

                                <div className="mt-4">
                                    <button
                                        type="button"
                                        className="inline-flex justify-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                                        onClick={async () => {
                                            // metadata: ServiceMetadata, quantity: u16, duration: u16
                                            
                                            const validateInputs = [
                                                {
                                                    ok: titleService.length > 0,
                                                    msg: "Falta el titulo"
                                                },
                                                {
                                                    ok: descriptionService.length > 0,
                                                    msg: "Falta la descripcion"
                                                },
                                                {
                                                    ok: iconService.length > 0,
                                                    msg: "Falta el icono"
                                                },
                                                {
                                                    ok: priceService > 0,
                                                    msg: "Falta el precio"
                                                },
                                                {
                                                    ok: durationService > 0,
                                                    msg: "Falta la duracion"
                                                },
                                                {
                                                    ok: amountOfServices > 0,
                                                    msg: "Falta la cantidad"
                                                },
                                            ]

                                            let amt = utils.format.parseNearAmount("0.05");
                                            let serviceMetadata = {
                                                title: titleService,
                                                description: descriptionService,
                                                icon: iconService,
                                                price: priceService,
                                                categories: categoriesService,
                                            }
                                            try {
                                                let finalValidatorMsg = ""
                                                let finalOk = true
                                                validateInputs.forEach((v) => {
                                                    finalOk &= v.ok
                                                    if (!v.ok) {
                                                        finalValidatorMsg += (v.msg + '. ')
                                                    }
                                                })
                                                
                                                if (finalOk) {
                                                    await window.contract.mint_service({ metadata: serviceMetadata, quantity: amountOfServices, duration: durationService }, "300000000000000", amt);
                                                    
                                                    setTitleService("")
                                                    setDescriptionService("")
                                                    setCategoriesService("")
                                                    setIconService("")
                                                    setPriceService(0)
                                                    setDurationService(0)
                                                    setAmountOfServicesService(0)
                                                } else {
                                                    toast.error(finalValidatorMsg)
                                                }
                                                console.log(serviceMetadata)
                                                

                                            } catch (e) {
                                                console.log(e.error)
                                            }
                                        }}
                                    >
                                        Crear!
                                    </button>
                                    <button
                                        type="button"
                                        className="inline-flex justify-center px-4 py-2 text-white bg-[#FF0000] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                                        onClick={closeModal}
                                    >
                                        Ahora no!
                                    </button>
                                </div>
                            </div>
                        </div>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    )
}