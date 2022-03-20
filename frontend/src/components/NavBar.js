import React, { Fragment, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

import { Menu, Transition } from "@headlessui/react";

import { BsPersonFill, BsFillChatDotsFill } from "react-icons/bs";
import { ImProfile } from "react-icons/im";
import { RiSuitcaseFill } from "react-icons/ri";
import { MdHowToVote, MdLogout } from "react-icons/md";
import { BiCoinStack } from "react-icons/bi";

import { useGlobalState } from "../state";

import { login, logout } from "../utils";

import DialogUserCreator from "../components/DialogUserCreator";

export default function NavBar() {
  return (
    <div className="bg-[#27C0EF] h-20 flex items-center z-30 w-full relative">
      <div className="container mx-auto px-6 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            to="/"
            className="text-white font-bold text-4xl transition ease-in-out hover:scale-105 duration-300"
          >
            <span className="font-normal">Block</span>
            Jobs
          </Link>
        </div>
        <div className="flex items-center">
          <Link
            to="/services"
            className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 text-white text-md mr-4 transition ease-in-out hover:scale-105 duration-300 shadow-lg shadow-sky-500"
          >
            Buscar Servicios
          </Link>
          <Link
            to="/disputes"
            className="uppercase py-2 px-4 rounded-lg bg-transparent border-2 text-white text-md mr-4 transition ease-in-out hover:scale-105 duration-300 shadow-lg shadow-sky-500"
          >
            Ver Disputas
          </Link>
          <NavBarContent />
        </div>
      </div>
    </div>
  );
}

function NavBarContent() {
  let [isOpen, setIsOpen] = useState(false);

  const [isUserCreated] = useGlobalState("isUserCreated");

  const navegation = useNavigate();

  const AvatarMenuItems = [
    {
      title: "My Profile",
      icon: <ImProfile />,
      action: () => {
        navegation("/dashboard/profile", { replace: true });
      },
    },
    {
      title: "My Services",
      icon: <RiSuitcaseFill />,
      action: () => {
        navegation("/dashboard/services");
      },
    },
    {
      title: "My Disputes",
      icon: <MdHowToVote />,
      action: () => {
        navegation("/dashboard/disputes");
      },
    },
    {
      title: "Tokens",
      icon: <BiCoinStack />,
      action: () => {
        navegation("/dashboard/tokens");
      },
    },
    {
      title: "Chats",
      icon: <BsFillChatDotsFill />,
      action: () => {
        navegation("/dashboard/chats");
      },
    },
    {
      title: "Logout",
      icon: <MdLogout />,
      action: logout,
    },
  ];

  function closeModal() {
    setIsOpen(false);
  }

  function openModal() {
    setIsOpen(true);
  }

  if (!window.walletConnection.isSignedIn()) {
    return (
      <nav className="font-sen text-white uppercase text-base lg:flex items-center hidden">
        <div className="py-2 pl-3 pr-4 flex items-center">
          <button
            className="uppercase font-medium text-md border-2 rounded-lg px-4 py-2 transition ease-in-out hover:scale-105 duration-300 shadow-lg shadow-sky-500"
            onClick={login}
          >
            Login
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="lg:flex items-center hidden">
      {!isUserCreated ? (
        <div className="mx-2">
          <button
            className="rounded-lg bg-transparent border-2 py-2 px-2 font-sen text-white uppercase text-base transition ease-in-out hover:scale-105 duration-300 shadow-lg shadow-sky-500"
            onClick={openModal}
          >
            Crear usuario
          </button>
        </div>
      ) : (
        <></>
      )}
      <Menu as="div" className="relative inline-block text-left z-30">
        <div className="ml-2">
          <Menu.Button className="w-full p-2 bg-white rounded-full transition ease-in-out hover:scale-105 duration-300 shadow-lg shadow-sky-500">
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
              {AvatarMenuItems.map((v, i) => {
                return (
                  <Menu.Item key={i}>
                    {({ active }) => (
                      <button
                        onClick={v.action}
                        className={`${
                          active
                            ? "transition hover:bg-[#00A8DB] duration-75 text-white"
                            : "transition hover:bg-white duration-300 text-[#00A8DB]"
                        } group flex rounded-md items-center w-full px-2 py-2 mt-1 text-sm`}
                      >
                        <div className="flex items-center">
                          <span className="mr-2">{v.icon}</span>
                          {v.title}
                        </div>
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      {!isUserCreated ? (
        <DialogUserCreator
          isOpen={isOpen}
          closeModal={closeModal}
          user={null}
        />
      ) : (
        <></>
      )}
    </nav>
  );
}
