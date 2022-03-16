import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";

import Profile from "./Profile";
import MyServices from "../views/MyServices";
import Disputes from "../views/Disputes";

import { ImProfile } from "react-icons/im";
import { RiSuitcaseFill } from "react-icons/ri";
import { MdHowToVote } from "react-icons/md";
import MyTokens from "./Mytokens";
import { BiCoinStack } from "react-icons/bi";
import MyDisputes from "./MyDisputes";

export default function DashBoard() {
  const navigate = useNavigate();
  const location = useLocation();

  let [selectedLeftSize, setSelectedLeftSize] = useState(0);

  const leftSize = ["profile", "services", "disputes", "tokens"];
  const leftSizeIcons = [
    <ImProfile />,
    <RiSuitcaseFill />,
    <MdHowToVote />,
    <BiCoinStack />,
  ];

  useEffect(() => {
    for (let index = 0; index < leftSize.length; index++) {
      let match = location.pathname == `/dashboard/${leftSize[index]}`;
      if (match) {
        setSelectedLeftSize(index);
        break;
      }
    }
  }, [location]);

  return (
    <div className="flex min-h-screen">
      <div className="relative bg-[#F8F7FF]">
        <div className="max-w-[150px] h-auto sticky top-4 ">
          {["Profile", "Services", "Disputes", "Tokens"].map((v, i) => {
            return (
              <div className="flex justify-between" key={i}>
                <button
                  onClick={() => {
                    setSelectedLeftSize(i);
                    navigate(`/dashboard/${leftSize[i]}`);
                  }}
                  className={
                    selectedLeftSize == i
                      ? "text-[#352E5B] border-violet-600 border-r-2 text-left py-4 pl-6 w-full pr-14"
                      : "text-[#A5A2B8] text-left py-4 pl-6 w-full pr-14 transition ease-in-out hover:text-[#352E5B] duration-300"
                  }
                >
                  <div className="flex items-center">
                    <span className="mr-2">{leftSizeIcons[i]}</span>
                    {v}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <Routes>
        <Route path="/profile" element={<Profile />} />
        <Route path="/services" element={<MyServices />} />
        <Route path="/disputes" element={<MyDisputes />} />
        <Route path="/tokens" element={<MyTokens />} />
      </Routes>
    </div>
  );
}
