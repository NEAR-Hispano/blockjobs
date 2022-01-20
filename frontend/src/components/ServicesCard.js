import React from "react";

export default function ServicesCard(props) {
    return (
        <div className="rounded-md border-2 border-[#27C0EF] p-4 my-4 mx-4">
            <div className="flex items-center">
                {
                    props.service.metadata.icon ? (
                        <img className="w-28 h-28 rounded-full mr-8" src={props.service.metadata.icon}/>
                    ) :
                    (
                        <></>
                    )

                }
                <div>
                    <div>{props.service.metadata.title}</div>
                    <div>{props.service.metadata.description}</div>
                </div>
            </div>
            <div className="flex">
                <div>Actual Owner {props.service.actual_owner}</div>
                {<span> | </span>}
                <div>Duration {props.service.duration} Days</div>
                {<span> | </span>}
                <div>Sold {String(props.service.sold)}</div>
                {<span> | </span>}
                <div>On Sale {String(props.service.on_sale)}</div>
                {<span> | </span>}
                <div>On Dispute {String(props.service.on_dispute)}</div>
            </div>
            <div>
                Creator {props.service.creator_id}
            </div>
        </div>
    )
}