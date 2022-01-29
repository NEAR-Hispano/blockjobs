import React from "react";

import {ImCross, ImCheckmark} from "react-icons/im"

export default function ServicesCard(props) {
    return (
        <div className="rounded-md border-2 border-[#27C0EF] p-4 bg-[#F8F7FF] font-semibold text-[#74787B]">
            <div className="flex justify-between">
                <div className="flex self-baseline">
                    {
                        props.service.metadata.icon ? (
                            <img className="w-24 h-24 rounded-full mr-4 object-cover" src={props.service.metadata.icon}/>
                        ) :
                        (
                            <></>
                        )

                    }
                    <div>
                        <div className="text-[#034D82] text-lg">{props.service.metadata.title}</div>
                        <div className="truncate text-slate-700">{props.service.metadata.description}</div>
                    </div>
                </div>
                {/* <div class="border mx-2"></div> */}
                <div className="flex whitespace-pre-wrap self-start">
                    <div>Duration: 
                        <span className="font-light"> {props.service.duration} Days</span>
                    </div>
                    {<span> | </span>}
                    
                    <div className="flex items-center">Sold: 
                        <span className="font-light mx-1">
                            {
                                props.service.sold ? (<ImCheckmark color="green"/>) : (<ImCross color="red"/>)
                            }
                        </span>
                    </div>
                    {<span> | </span>}

                    <div className="flex items-center">On Sale: 
                        <span className="font-light mx-1">
                            {
                                props.service.on_sale ? (<ImCheckmark color="green"/>) : (<ImCross color="red"/>)
                            }
                        </span>
                    </div>
                    {<span> | </span>}

                    <div className="flex items-center">On Dispute: 
                        <span className="font-light mx-1">
                            {
                                props.service.on_dispute ? (<ImCheckmark color="green"/>) : (<ImCross color="red"/>)
                            }
                        </span>
                    </div>
                </div>
            </div>

            <div className="font-light text-sm flex justify-between items-center mt-1 whitespace-pre-wrap">
                <div className="flex whitespace-pre-wrap">
                    <div>
                        <span className="font-semibold">Creador: </span>{props.service.creator_id}
                        <span className="font-semibold"> | </span>
                    </div>
                    <div><span className="font-semibold">Dueño: </span>{props.service.actual_owner}</div>
                </div>

                <div className=" text-sm flex items-center">
                    {props.service.metadata.price}
                    <img className="w-[26px]" src={require("../../assets/logo-black.svg")}></img>
                </div>
            </div>
        </div>
    )
}