import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { utils } from "near-api-js";

import ServicesCard from "../components/ServicesCard";
import { getServices, getUserServices } from "../utils";

export default function Services() {
    let [services, setServices] = useState([]);
    let [loading, setLoading] = useState(true)

    useEffect(async ()=>{
        let s = await getServices(0, 15)
        setLoading(false)
        console.log(s)
        setServices(s)
    }, [])

    return (
        <div className="w-full">
            <div className="m-8 ">
                {
                    loading ? (
                        <div className="h-screen">
                            <svg className="spinner" viewBox="0 0 50 50">
                                <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                            </svg>
                        </div>
                    ) : (
                        <div className="border-2 rounded-lg px-6 py-4 mt-4">
                            {/* <div className="text-xl font-bold text-gray-800">Servicios</div> */}
                            {
                                services.map((v, i) => {return (
                                    <div className="my-4" key={v.id}>
                                        <ServicesCard service={v} />
                                    </div>
                                )})
                            }
                        </div>
                    )
                }
            </div>
        </div>
    )
}