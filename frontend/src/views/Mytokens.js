import React from "react";
import { BiCoinStack } from "react-icons/bi";
export default function MyTokens() {
    return (
        <div className="m-8 w-full">
            <div>
                <button
                    className="uppercase py-2 px-4 rounded-lg border-transparent text-white text-md mr-4 bg-[#27C0EF] shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80"
                    
                >
                    DAME DINERO GRATIS!!!!
                </button>
                <button
                    className="uppercase py-2 px-4 rounded-lg border-transparent text-white text-md mr-4 bg-[#27C0EF] shadow-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-[#27C0EF]/80"
                    
                >
                    NO! Tengo dinero 🤑🤑🤑 y quiero compra 🤑🤑🤑
                </button>
            </div>
            <div className="border-2 rounded-lg px-6 py-4 w-full mt-4">
                <div className="text-xl font-bold text-gray-800 flex items-center whitespace-pre-wrap">
                    <BiCoinStack/>
                    {`Mis JobsCoins: `}
                        <svg className="spinner-normal" viewBox="0 0 50 50">
                            <circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="4"></circle>
                        </svg>
                </div>
            </div>
        </div>
    )
}