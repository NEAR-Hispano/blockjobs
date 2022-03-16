import React from "react";
import { VscArrowRight, VscArrowDown } from "react-icons/vsc";
import Fade from "react-reveal/Fade";
import { Link } from "react-router-dom";
import { login } from "../utils";
import { useGlobalState } from "../state";
import freelanceWoman from "../assets/freelancer.svg";
import iphoneLogo from "../assets/iphone-12.svg";
import nearBlackLogo from "../assets/logo-black.svg";
import createAService from "../assets/create_a_service.svg";
import getHired from "../assets/get_hired.svg";
import roadmap from "../assets/roadmap.svg";

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
              <p className="text-sm sm:text-base text-white">
                BlockJob is a dapp to search for jobs and freelancers. In
                addition to being an arbitrator to ensure that both parties are
                compliant.
              </p>
              <div className="flex mt-8">
                {isUserCreated ? (
                  <>
                    <div
                      onClick={() => {
                        window.open("https://dariofs153.gitbook.io/blockjobs-eng/");
                      }}
                      className="uppercase py-2 px-4 rounded-lg bg-white border-transparent text-cyan-500 text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg shadow-sky-500"
                    >
                      See how it works
                    </div>
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
                )}
              </div>
            </div>
          </Fade>
          <Fade right className="lg:hidden">
            <div className="flex lg:h-auto lg:w-1/2">
              <div className="object-cover w-full max-w-full rounded-md lg:h-full">
                <img
                  src={freelanceWoman}
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
                src={iphoneLogo}
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
                src={nearBlackLogo}
              ></img>
            </div>
          </Fade>
        </div>
      </div>

      {/* Cuarta seccion */}
      <div className="bg-[#d2f0fa] p-10">
        <div className="font-bebas-neue flex justify-center gap-4">
          <Fade top cascade>
            <div className="flex flex-col justify-center items-center">
              <div className="text-center text-[#034D82] text-4xl italic font-bold ">
                Become a Freelancer
              </div>
              <img
                className=" max-w-[150px] mt-4 mb-1"
                src={createAService}
              ></img>
              <div className="text-center text-[#034D82] text-2xl font-bold ">
                Create a Serivce
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[150px] mb-1"
                src={getHired}
              ></img>
              <div className="text-center text-[#034D82] text-2xl font-bold ">
                Get Hired
              </div>
              <VscArrowDown size={40} color="#034D82" className="w-full my-4" />
              <img
                className="max-w-[150px] mb-1"
                src={nearBlackLogo}
              ></img>
              <div className="text-center text-[#034D82] text-2xl font-bold ">
                Receive Tokens
              </div>
            </div>
          </Fade>
        </div>
      </div>
      <div className="py-10">
        <div className="font-bebas-neue">
          <div className="flex flex-col justify-center items-center pb-10">
            <div className="text-center text-[#034D82] text-4xl italic font-bold ">
              Roadmap
            </div>
          </div>
          <div className=" flex justify-center">
            <img
              className="h-screen rounded-lg border-2 shadow-md px-2 py-2"
              src={roadmap}
            ></img>
          </div>
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
