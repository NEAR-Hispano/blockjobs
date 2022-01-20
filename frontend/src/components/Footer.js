import React from "react"
import {VscTwitter} from "react-icons/vsc"
import {FaInstagram, FaLinkedin} from "react-icons/fa"
export default function Footer() {
    return (
        <div className="bg-[#081315]">
            <div className="flex justify-around font-sans py-14 px-10">
                <div className="">
                    <div className="text-white font-bold text-xl">
                        <span className="font-normal">Block</span>
                        Jobs
                    </div>
                    <span className="text-[#D3D6D8] my-2 font-light">Find your next job in Martketplace</span>
                    <div className="flex mt-8">
                        <div className="mr-2 p-2 rounded-full bg-[#D5E2E4]">
                            <VscTwitter size={38}/>
                        </div>
                        <div className="mx-2 p-2 rounded-full bg-[#D5E2E4]">
                            <FaInstagram size={38}/>
                        </div>
                        <div className="mx-2 p-2 rounded-full bg-[#D5E2E4]">
                            <FaLinkedin size={38}/>
                        </div>
                    </div>
                </div>
                <div className="">
                    <div className="text-white font-bold">Learn More</div>
                    <span className="text-[#D3D6D8] font-light">
                        <div className="my-2">About us</div>
                        <div className="my-2">How it works</div>
                        <div className="my-2">Blog</div>
                    </span>
                </div>
                <div className="">
                    <div className="text-white font-bold">Get Started</div>
                    <span className="text-[#D3D6D8]">
                        <div className="my-2 font-light">Become a freelancer</div>
                        <div className="my-2 font-light">Become a employer</div>
                        <div className="my-2 font-light">Find a work</div>
                        <div className="my-2 font-light">Find candidates</div>
                    </span>
                </div>
            </div>
        </div>
    )
}