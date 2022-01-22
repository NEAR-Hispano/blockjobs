import 'regenerator-runtime/runtime'
import React, { Fragment, useState, useEffect } from 'react'
import { BsPersonFill } from "react-icons/bs"
import { Menu, Transition, Dialog } from '@headlessui/react'
import { useNavigate, Link } from "react-router-dom";
import { utils } from "near-api-js";
import { getUser, login, logout } from '../utils'
import { toast } from 'react-toastify';
import Select from 'react-select'

import { ImProfile } from "react-icons/im"
import { RiSuitcaseFill } from "react-icons/ri"
import { MdHowToVote, MdLogout } from "react-icons/md"

export default function NavBar(props) {
    return (
        <div className="bg-[#27C0EF] h-20 flex items-center z-30 w-full relative">
            <div className="container mx-auto px-6 flex items-center justify-between">
                <div className="flex items-center">
                    <Link to="/" className="text-white font-bold text-4xl">
                        <span className="font-normal">Block</span>
                        Jobs
                    </Link>
                </div>
                <div className="flex items-center">
                    <Link to="/services" className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 text-white text-md mr-4">
                        Buscar Servicios
                    </Link>
                    <NavBarContent countries={props.countriesData} />
                </div>
            </div>
        </div>
    )
}

function NavBarContent(props) {
    let [isOpen, setIsOpen] = useState(false)
    let [isUserCreated, setIsUserCreated] = useState(true)
    let [beEmployeer, setbeEmployeer] = useState(false)

    let [educacionInput, setEducacionInput] = useState("")
    let [legalNameInput, setLegalNameInput] = useState("")
    let [linksInputs, setLinksInputs] = useState(["", "", "", ""])
    let [pictureInput, setPictureInput] = useState("")
    let [bioInput, setBioInput] = useState("")
    const [countryInput, setCountryInput] = useState('')

    const navegation = useNavigate();

    const AvatarMenuItems = [
        {
            title: "My Profile",
            icon: <ImProfile />,
            action: () => {
                navegation("/dashboard/profile", { replace: true })
            }
        },
        {
            title: "My Services",
            icon: <RiSuitcaseFill />,
            action: () => {
                navegation("/dashboard/services")
            }
        },
        {
            title: "My Disputes",
            icon: <MdHowToVote />,
            action: () => {
                navegation("/dashboard/disputes")
            }
        },
        {
            title: "Logout",
            icon: <MdLogout />,
            action: logout 
        },
    ]

    useEffect(async () => {
        // let timeout
        if (window.walletConnection.isSignedIn()) {
            if (await getUser(window.accountId)) {
                setIsUserCreated(true)
            }
            else {
                setIsUserCreated(false);
            }
        }
    }, [])


    function closeModal() {
        setIsOpen(false)
    }

    function openModal() {
        setIsOpen(true)
    }

    if (!window.walletConnection.isSignedIn()) {
        return (
            <nav className="font-sen text-white uppercase text-base lg:flex items-center hidden">
                <div className="py-2 pl-3 pr-4 flex items-center">
                    <button className="uppercase font-medium text-lg border-2 rounded-lg px-4 py-2" onClick={login}>
                        Login
                    </button>
                    {/* <img src={require("../../assets/logo-white.svg")}></img> */}
                </div>
            </nav>
        )
    }

    return (
        <nav className="lg:flex items-center hidden">
            {!isUserCreated ? (
                <div className="mx-6">
                    <button className="rounded-lg bg-transparent border-2 py-2 px-2 font-sen text-white uppercase text-base"
                        onClick={openModal}
                    >
                        Crear usuario
                    </button>
                </div>) :
                (<></>)
            }
            <Menu as="div" className="relative inline-block text-left z-30">
                <div>
                    <Menu.Button className="w-full p-2 bg-white rounded-full">
                        <BsPersonFill color="#27C0EF" size={24} />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 w-56 mt-2 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <div className="px-1 py-1 normal-case">
                            <Menu.Item>
                                <div className="text-[#00A8DB] font-semibold text-lg w-full px-2 py-2 text-sm border-b-2 text-center">
                                    {window.accountId}
                                </div>
                            </Menu.Item>
                            {
                                AvatarMenuItems.map((v, i) => {
                                    return (
                                        <Menu.Item key={i}>
                                            {({ active }) => (
                                                <button onClick={v.action} className={`${active ? 'bg-[#00A8DB] text-white' : 'text-[#00A8DB]'
                                                    } group flex rounded-md items-center w-full px-2 py-2 mt-1 text-sm`}
                                                >
                                                    <div className="flex items-center">
                                                        <span className="mr-2">{v.icon}</span>{v.title}
                                                    </div>
                                                </button>
                                            )}
                                        </Menu.Item>
                                    )
                                })
                            }
                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
            {!isUserCreated ? (
                <Transition appear show={isOpen} as={Fragment}>
                    <Dialog
                        as="div"
                        className="fixed inset-0 z-50 overflow-y-auto"
                        onClose={closeModal}
                    >
                        <div className="min-h-screen px-4 text-center">
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0"
                                enterTo="opacity-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100"
                                leaveTo="opacity-0"
                            >
                                <Dialog.Overlay className="fixed inset-0 bg-[#F8F7FF] " />
                            </Transition.Child>

                            {/* This element is to trick the browser into centering the modal contents. */}
                            <span
                                className="inline-block h-screen align-middle"
                                aria-hidden="true"
                            >
                                &#8203;
                            </span>
                            <Transition.Child
                                as={Fragment}
                                enter="ease-out duration-300"
                                enterFrom="opacity-0 scale-95"
                                enterTo="opacity-100 scale-100"
                                leave="ease-in duration-200"
                                leaveFrom="opacity-100 scale-100"
                                leaveTo="opacity-0 scale-95"
                            >
                                <div className="min-w-[50%] inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
                                    <Dialog.Title
                                        as="h3"
                                        className="text-lg font-medium leading-6 text-gray-900"
                                    >
                                        Crear un usuario nuevo
                                    </Dialog.Title>
                                    <div className="mt-2">
                                        <p className="text-sm text-gray-500 border-b-2 pb-2">
                                            Por favor, rellene este formulario para poder crear tu usuario. Al finalizar se va a cobrar un peaje de 0.05 NEARS para cubrir el storage,
                                            el sobrante se rotornara. <br /><span className="font-bold">Estos datos son opcionales!!!</span>
                                        </p>
                                    </div>
                                    <div className="mt-2">
                                        <label className="text-gray-700 text-sm font-semibold">
                                            Nombre legal
                                        </label>
                                        <input
                                            value={legalNameInput}
                                            onChange={(e) => { setLegalNameInput(e.target.value) }}
                                            className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                        ></input>

                                        <label className="text-gray-700 text-sm font-semibold">
                                            Educacion
                                        </label>
                                        <input
                                            value={educacionInput}
                                            onChange={(e) => { setEducacionInput(e.target.value) }}
                                            className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                        ></input>

                                        <label className="text-gray-700 text-sm font-semibold">Links</label>
                                        <div className="grid grid-cols-2 gap-2 mb-2">
                                            {
                                                linksInputs.map((v, index) => {
                                                    return (
                                                        <div key={index}>
                                                            <input
                                                                value={v}
                                                                onChange={(e) => {
                                                                    let newArr = [...linksInputs]
                                                                    newArr[index] = e.target.value
                                                                    setLinksInputs(newArr)
                                                                }
                                                                }
                                                                className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                                            ></input>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>

                                        <label className="text-gray-700 text-sm font-semibold">
                                            Picture Link
                                        </label>
                                        <input
                                            value={pictureInput}
                                            onChange={(e) => { setPictureInput(e.target.value) }}
                                            className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                        ></input>

                                        <label className="text-gray-700 text-sm font-semibold">
                                            Bio
                                        </label>
                                        {/* bioInput, setBioInput */}
                                        <textarea
                                            value={bioInput}
                                            onChange={(e) => { setBioInput(e.target.value) }}
                                            className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                                        ></textarea>


                                        <div className="mb-2">
                                            <label className="text-gray-700 text-sm font-semibold">Pais</label>
                                            <Select className="bg-gray-200" options={props.countries} value={countryInput} onChange={(value) => { setCountryInput(value) }} />
                                        </div>
                                    </div>

                                    <div>
                                        <input checked={beEmployeer} onChange={(e) => { setbeEmployeer(!beEmployeer) }} type="checkbox" className="checked:bg-[#27C0EF]"></input>
                                        <label className="form-check-label inline-block text-gray-900 pl-2" for="flexCheckDefault">
                                            Ser empleador
                                        </label>
                                    </div>
                                    <div className="mt-4">
                                        <button
                                            type="button"
                                            className="inline-flex justify-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                                            onClick={async () => {
                                                let amt = utils.format.parseNearAmount("0.05");
                                                let personalData = JSON.stringify({
                                                    legal_name: legalNameInput,
                                                    education: educacionInput,
                                                    links: linksInputs,
                                                    picture: pictureInput,
                                                    bio: bioInput,
                                                    country: countryInput.label
                                                })
                                                try {

                                                    let roles = ["Professional"];
                                                    if (beEmployeer) {
                                                        roles.push("Employeer");
                                                    }
                                                    let user = await window.contract.add_user({ roles: roles, personal_data: personalData }, "300000000000000", amt);
                                                    console.log(personalData)

                                                    setLegalNameInput("")
                                                    setEducacionInput("")
                                                    setPictureInput("")
                                                    setBioInput("")
                                                    setLinksInputs(linksInputs.map((v) => { return "" }))
                                                } catch (e) {
                                                    console.log(e.error)
                                                }
                                            }}
                                        >
                                            Crear!
                                        </button>
                                        <button
                                            type="button"
                                            className="inline-flex justify-center px-4 py-2 text-white bg-[#FF0000] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                                            onClick={closeModal}
                                        >
                                            Ahora no!
                                        </button>
                                    </div>
                                </div>
                            </Transition.Child>
                        </div>
                    </Dialog>
                </Transition>) :
                (<></>)
            }
        </nav>
    )
}
