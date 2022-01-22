import React, { useEffect, useState } from "react";

import ServicesCard from "../components/ServicesCard";

import { utils } from "near-api-js";
import { toast } from "react-toastify";
import { buyService, getServiceById, getUser } from "../utils";
import { useParams } from "react-router-dom";
import UserProfile from "../components/UserProfile";
import { async } from "regenerator-runtime";

export default function Service() {
    let [service, setService] = useState();
    let [user, setUser] = useState();
    let [loading, setLoading] = useState(true)

    const params = useParams();

    useEffect(async ()=>{
        let loadingService = true
        let loadingUser = true
        let s = await getServiceById(Number(params.id))
        console.log(s)
        if (s) {
            setService(s)
            loadingService = false
        }

        let user = await getUser(s.creator_id)
        if (user) {
            user.personal_data = JSON.parse(user.personal_data)
            console.log(user)
            setUser(user)
            loadingUser = false
        }
        if (!loadingService && !loadingUser) {
            setLoading(false)
        }

    }, [])
    
    const handleBuyService = async () => {
        const userBalance = utils.format.formatNearAmount((await window.walletConnection.account().getAccountBalance()).available)
        
        if (service.metadata.price < userBalance) {
            const amount = utils.format.parseNearAmount(String(service.metadata.price))
            console.log(amount)
            await buyService(service.id, amount)
            return
        }
        
        toast.error("No tienes suficientes fondos para adquirir este servicio")
    }

    return (
        <div className="">
            <div className="m-8">
                {
                    loading ? (
                        <div className="h-screen">
                            <svg className="spinner" viewBox="0 0 50 50">
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                            </svg>
                        </div>
                    ) : (
                        <div>
                            {
                                !window.accountId ? (
                                    <></>
                                ) : (((service.actual_owner != window.accountId) || (service.creator_id != window.accountId)) && (!service.sold)) ? (
                                    <button onClick={handleBuyService} className="uppercase py-2 px-4 rounded-lg bg-green-500 border-transparent text-white text-md mr-4">Comprar servicio</button>
                                ) : ((service.actual_owner == window.accountId) || (service.creator_id == window.accountId)) ? (
                                    <span className="uppercase py-2 px-4 rounded-lg bg-green-500 border-transparent text-white text-md mr-4">Usted es el dueño de este servicio!</span>
                                ): (
                                    <span className="uppercase py-2 px-4 rounded-lg bg-green-500 border-transparent text-white text-md mr-4">Usted ya adquirio este servicio!</span>
                                )
                            }
                            <div className="border-2 rounded-lg px-6 py-4 mt-4">
                                <div className="text-2xl font-bold text-gray-800 mb-4">Servicio</div>
                                <ServicesCard service={service}/>
                            </div>
                            <div className="border-2 rounded-lg px-6 py-4 mt-4">
                                <div className="text-2xl font-bold text-gray-800 mb-4">Perfil del usuario</div>
                                <UserProfile user={user} />
                            </div>
                        </div>
                    )
                }
            </div>
        </div>
    )
}