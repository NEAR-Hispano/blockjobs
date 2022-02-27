import React from "react";

import { ImCross, ImCheckmark } from "react-icons/im";
import { useNavigate } from "react-router-dom";

const tokenIcons = [
  {
    value: "near",
    path: require("../../assets/logo-black.svg"),
  },
  {
    value: "usdc",
    path: require("../../assets/usd-coin-usdc-logo.svg"),
  },
  {
    value: "jobs",
    path: require("../../assets/JobsCoinIcon.svg"),
  },
];

export default function ServicesCard({ service }) {
  const navigate = useNavigate();
  return (
    <div
      onClick={() => {
        navigate(`/service/${service.id}`);
      }}
      className="hover:cursor-pointer rounded-md border-2 shadow-md border-[#27C0EF] p-4 bg-[#F8F7FF] font-semibold text-[#74787B] transition ease-in-out hover:scale-[1.02]"
    >
      <div className="flex">
        <div className="flex self-baseline">
          {service.metadata.icon ? (
            <img
              className="w-24 h-24 rounded-full mr-4 object-cover"
              src={service.metadata.icon}
            />
          ) : (
            <></>
          )}
          <div>
            <div className="text-[#034D82] text-lg">
              {service.metadata.title}
            </div>
            <div className="truncate text-slate-900">
              {service.metadata.description}
            </div>
          </div>
        </div>
        {/* <div class="border mx-2"></div> */}
      </div>

      <div className="font-light text-sm mt-1 whitespace-pre-wrap">
        <div>
          <div className="mr-2">
            <span className="font-semibold">Creador: </span>
            {service.creator_id}
          </div>
          <div className="mr-2">
            <span className="font-semibold">Dueño: </span>
            {service.actual_owner}
          </div>
        </div>
        <div className="flex items-center whitespace-pre-wrap">
          <div className="mr-2 font-semibold">
            Duration:
            <span className="font-light"> {service.duration} Days</span>
          </div>

          <div className="mr-2 flex items-center font-semibold">
            Sold:
            <div className=" font-light mx-1">
              {service.sold ? (
                <ImCheckmark color="green" />
              ) : (
                <ImCross color="red" />
              )}
            </div>
          </div>

          <div className="flex items-center mr-2 font-semibold">
            On Sale:
            <div className="font-light mx-1">
              {service.on_sale ? (
                <ImCheckmark color="green" />
              ) : (
                <ImCross color="red" />
              )}
            </div>
          </div>

          <div className="flex items-center mr-2 font-semibold">
            On Dispute:
            <div className="font-light mx-1">
              {service.on_dispute ? (
                <ImCheckmark color="green" />
              ) : (
                <ImCross color="red" />
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-between mt-4">
        <div className=" text-sm flex items-center">
          {service.metadata.price}
          <img
            className="w-[26px] ml-1"
            src={
              tokenIcons.find((v) => {
                return v.value === service.metadata.token;
              }).path
            }
          ></img>
        </div>
        <div></div>
        <div className="flex flex-row flex-wrap">
          {service.metadata.categories.map((v, i) => {
            return (
              <div
                key={i}
                className="mx-0.5 px-2 py-1 rounded-xl bg-[#27C0EF] text-white font-light text-xs transition ease-in-out hover:scale-[1.02]"
              >
                {v}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
