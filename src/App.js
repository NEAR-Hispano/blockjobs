import 'regenerator-runtime/runtime'
import React, { useEffect } from 'react'

export default function App() {
    useEffect(()=> {
        console.log(__dirname)
    }, [])
    return (
        <>
            <div className="landing-background relative overflow-hidden h-screen">
                <header className="h-24 flex items-center z-30 w-full">
                    <div className="container mx-auto px-6 flex items-center justify-between">
                        <div className="text-white font-bold text-4xl">
                            <span className="font-normal">Block</span>
                            Jobs
                        </div>
                        <div className="flex items-center">
                            <nav className="font-sen text-white uppercase text-base lg:flex items-center hidden">
                                <a href="#" className="py-2 px-6 flex">
                                    Home
                                </a>
                                <a href="#" className="py-2 px-6 flex">
                                    Docs
                                </a>
                                <a href="#" className="py-2 px-6 flex">
                                    Help
                                </a>
                                <a href="#" className="py-2 px-6 flex items-center">
                                    <img src={require("/assets/logo-white.svg")}></img>
                                    <div>Login</div>
                                </a>
                            </nav>
                        </div>
                    </div>
                </header>
                <div className="flex mx-10 mb-20 justify-between ">
                    <div className="sm:w-2/3 lg:w-2/5 flex flex-col relative z-20 justify-center">
                        <h1 className="mb-8 font-bebas-neue uppercase text-8xl sm:text-5xl font-black flex flex-col leading-none text-white pr-4">
                            Find your next job
                        </h1>
                        {/* <img src={require("/assets/Smile.svg")} className="w-120 h-10 mt-6 mb-8"></img> */}
                        <p className="text-sm sm:text-base text-white">
                        BlockJob is a dapp to search for jobs and freelancers. In addition to being an arbitrator to ensure that both parties are compliant.
                        </p>
                        <div className="flex mt-8">
                            <a href="#" className="uppercase py-2 px-4 rounded-lg bg-white border-transparent text-cyan-500 text-md mr-4">
                                See how it works
                            </a>
                            <a href="#" className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 text-white text-md">
                                Start now
                            </a>
                        </div>
                    </div>
                    <div className="flex lg:h-auto lg:w-1/2">
                        <div className="object-cover w-full max-w-full rounded-md lg:h-full">
                            <img src={require("/assets/freelancer.svg")} className=""/>
                        </div>
                    </div>
                </div>
            </div>
            <div className="bg-[#d2f0fa] p-10 flex justify-center">
                <div className="font-sans font-bold text-center">
                    <div className="text-[#034D82] text-4xl">The future of work is now</div>
                    <div className="text-xl text-gray-600">hire or work for Near cryptocurrency</div>
                </div>
                <div className="font-sans font-bold text-center">
                    <div className="text-[#034D82] text-4xl">
                        No artificial costs or restrictions
                    </div>
                    <div className="text-xl text-gray-600">
                        BlockJob doesn’t take a percentage of your earned Near. The amount of Near the employer pays is the amount the freelancer gets.
                    </div>
                    <a>Learn about this</a>
                </div>
            </div>
            <div className="bg-[#081315]">
                <div className="flex justify-between font-sans py-14 px-10">
                    <div className="">
                        <div className="text-white font-bold text-xl">
                            <span className="font-normal">Block</span>
                            Jobs
                        </div>
                    </div>
                    <div className="">
                        <div className="text-white font-bold">Learn More</div>
                        <span className="text-[#D3D6D8]">
                            <div className="">Learn More</div>
                            <div className="">Learn More</div>
                        </span>
                    </div>
                    <div className="">
                        <div className="text-white font-bold">Get Started</div>
                        <span className="text-[#D3D6D8]">
                            <div className="">Get Started</div>
                            <div className="">Get Started</div>
                            <div className="">Get Started</div>
                        </span>
                    </div>
                </div>
            </div>
        </>
    )
}
