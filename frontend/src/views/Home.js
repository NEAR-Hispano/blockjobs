import React from "react";
import { VscArrowRight, VscArrowDown } from "react-icons/vsc";
import Fade from "react-reveal/Fade";
import { Link } from "react-router-dom";


import { useGlobalState } from "../state";

export default function Home() {
  const [isUserCreated] = useGlobalState("isUserCreated");
  return (
    <>
      <div className="bg-[#27C0EF] relative overflow-hidden h-screen">
        {/* Primera seccion */}
        <div className="flex mx-10 mb-20 justify-between">
          <Fade left cascade>
            <div className="sm:w-2/3 lg:w-2/5 flex flex-col relative z-20 justify-center">
              <h1 className="mb-8 font-bebas-neue uppercase text-8xl sm:text-5xl font-black flex flex-col leading-none text-white pr-4">
                Find your next job
              </h1>
              {/* <img src={require("../assets/Smile.svg")} className="w-120 h-10 mt-6 mb-8"></img> */}
              <p className="text-sm sm:text-base text-white">
                BlockJob is a dapp to search for jobs and freelancers. In
                addition to being an arbitrator to ensure that both parties are
                compliant.
              </p>
              <div className="flex mt-8">
                {
                  isUserCreated ? (
                    <>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/help"
                        className="uppercase py-2 px-4 rounded-lg bg-white border-transparent text-cyan-500 text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg shadow-sky-500"
                      >
                        See how it works
                      </Link>
                      <button
                        className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 text-white text-md transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg shadow-sky-500"
                        onClick={login}
                      >
                        Start now
                      </button>
                    </>
                  )
                }
              </div>
            </div>
          </Fade>
          <Fade right>
            <div className="flex lg:h-auto lg:w-1/2">
              <div className="object-cover w-full max-w-full rounded-md lg:h-full">
                <img
                  src={require("../../assets/freelancer.svg")}
                  className=""
                />
              </div>
            </div>
          </Fade>
        </div>
      </div>

      {/* Segunda seccion */}
      <div className="bg-[#d2f0fa] p-10">
        <div className="font-bebas-neue grid grid-cols-2 gap-4">
          <Fade left>
            <div className="flex justify-center">
              <img
                className="-skew-y-3"
                src={require("../../assets/iphone-12.svg")}
              ></img>
            </div>
          </Fade>
          <Fade right cascade>
            <div className="flex items-center">
              <div>
                <div className="text-[#034D82] font-bold text-4xl pb-10">
                  No artificial costs or restrictions
                </div>
                <div className="text-xl text-gray-600">
                  BlockJob doesn’t take a percentage of your earned Near. The
                  amount of Near the employer pays is the amount the freelancer
                  gets.
                </div>
                <LearnMore />
              </div>
            </div>
          </Fade>
        </div>
      </div>

      {/* Tercera seccion */}
      <div className="p-10">
        <div className="font-bebas-neue grid grid-cols-2 gap-4">
          <Fade left cascade>
            <div className="flex items-center">
              <div>
                <div className="text-[#034D82] font-bold text-4xl pb-10">
                  It’s all on blockchain!
                </div>
                <div className="text-xl text-gray-600">
                  The BlockJob database is distributed on the Near public
                  blockchain and the source files are on IPFS. BlockJob is
                  accessible to everyone forever, without any central authority
                  having control over it.
                </div>
                <LearnMore />
              </div>
            </div>
          </Fade>
          <Fade right>
            <div className="flex justify-center">
              <img
                className="skew-y-6"
                src={require("../../assets/logo-black.svg")}
              ></img>
            </div>
          </Fade>
        </div>
      </div>

      {/* Cuarta seccion */}
      <div className="bg-[#d2f0fa] p-10">
        <div className="font-bebas-neue grid grid-cols-2 gap-4">
          <Fade top cascade>
            <div className="flex flex-col justify-center items-center">
              <div className="text-center text-[#034D82] text-2xl italic font-bold ">
                Become a Freelancer
              </div>
              <img
                className=" max-w-[100px] mt-4 mb-1"
                src={require("../../assets/image 4.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Find Job
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 5.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Apply for a Job
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 8.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Get Hired
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 10.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Create Invoices
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 11.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Receive Near
              </div>
            </div>
          </Fade>
          <Fade bottom cascade>
            <div className="flex flex-col justify-center items-center">
              <div className="text-center text-[#034D82] text-2xl italic font-bold ">
                Become an Employer
              </div>
              <img
                className="max-w-[100px]"
                src={require("../../assets/image 6.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Create Job
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 7.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Invite Freelancers
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 12.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Accept Job Proposals
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 13.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Get Tasks Done
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[100px] mb-1"
                src={require("../../assets/image 14.png")}
              ></img>
              <div className="text-center text-[#034D82] text-xl font-bold ">
                Pay Invoices in Near
              </div>
            </div>
          </Fade>
        </div>
      </div>
    </>
  );
}

function LearnMore() {
  return (
    <Link to="/" className="mt-10 flex items-center">
      <div className="text-[#04AADD] font-bold mr-3">Learn about this</div>
      <VscArrowRight size={24} color="#04AADD" />
    </Link>
  );
}
