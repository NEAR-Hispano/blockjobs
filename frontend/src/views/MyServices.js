import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import ServicesCard from "../components/ServicesCard";
import CreateServiceDialog from "../components/CreateServiceDialog";

import { getUserServices } from "../utils";


export default function MyServices() {
    let [services, setServices] = useState([]);
    let [loading, setLoading] = useState(true)
    let [isOpen, setIsOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(async () => {
        const _services = await getUserServices()
        console.log(_services)
        if (_services) {
            setServices(await getUserServices())
        }

        setLoading(false)
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
        <div className="m-8 w-full">
            {
                loading ? (
                    <div className="h-screen">
                        <svg className="spinner" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                        </svg>
                    </div>
                ) : (
                    <div>
                        <div>
                            <button
                                className="uppercase py-2 px-4 rounded-lg border-transparent text-white text-md mr-4 bg-[#27C0EF]"
                                onClick={openModal}
                            >
                                Crear Servicio
                            </button>
                        </div>
                        
                        <CreateServiceDialog isOpen={isOpen} closeModal={closeModal} openModal={openModal} service={null} />
                        <div className="border-2 rounded-lg px-6 py-4 w-full mt-4">
                            <div className="text-xl font-bold text-gray-800">Mis servicios</div>
                            {
                                services.filter(v => !v.sold).map((v, i) => {
                                    return (
                                        <div key={v.id} className="hover:cursor-pointer my-4" onClick={()=>{navigate(`/service/${v.id}`)}}>
                                            <ServicesCard service={v} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="border-2 rounded-lg px-6 py-4 w-full mt-4">
                            <div className="text-xl font-bold text-gray-800">Servicios adquiridos</div>
                            {
                                services.filter(v => (v.actual_owner == window.accountId) && (v.sold)).map((v, i) => {
                                    return (
                                        <div key={v.id} className="hover:cursor-pointer my-4" onClick={()=>{navigate(`/service/${v.id}`)}}>
                                            <ServicesCard service={v} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className="border-2 rounded-lg px-6 py-4 w-full mt-4">
                            <div className="text-xl font-bold text-gray-800">Servicios vendidos</div>
                            {
                                services.filter(v => (v.actual_owner != window.accountId) && (v.sold)).map((v, i) => {
                                    return (
                                        <div key={v.id} className="hover:cursor-pointer my-4" onClick={()=>{navigate(`/service/${v.id}`)}}>
                                            <ServicesCard service={v} />
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                )
            }
        </div>
    )
}

