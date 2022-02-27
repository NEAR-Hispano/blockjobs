import React, { Fragment, useEffect, useState } from "react";

import { utils } from "near-api-js";
import { Menu, Transition } from "@headlessui/react";

import { IoMdSwap } from "react-icons/io";
import { FaWallet } from "react-icons/fa";
import { BiCoinStack, BiBlock } from "react-icons/bi";
import { BsThreeDotsVertical, BsArrowUp, BsArrowDown } from "react-icons/bs";

import BuyJobsCoinDialog from "../components/BuyJobsCoinDialog";
import DepositToken from "../components/DepositTokenDialog";
import BlockTokenDialog from "../components/BlockTokenDialog";

import {
  getFTBalanceOf,
  getJOBSBalanceFromNearWallet,
  getUSDCBalanceFromNearWallet,
} from "../utils";

export default function MyTokens() {
  const [loading, setLoading] = useState(true);
  const [USDCBalance, setUSDCBalance] = useState(0);
  const [USDCWalletBalance, setUSDWalletCBalance] = useState(0);
  const [JOBSWalletBalance, setJOBSWalletCBalance] = useState(0);
  const [JOBSBalance, setJOBSBalance] = useState(0);
  const [nearBalance, setNearBalance] = useState(0);
  let [isOpenBuyJOBSModal, setOpenBuyJOBSModal] = useState(false);
  let [isOpenDepositTokenModal, setOpenDepositTokenModal] = useState(false);
  let [isBlockTokeModal, setBlockTokeModal] = useState(false);
  let [enableWithdraw, setEnableWithdraw] = useState(false);
  let [tokenSelectedForDeposit, setTokenSelectedForDeposit] = useState("");

  const JOBSMenuItems = [
    {
      title: "Swap",
      icon: <IoMdSwap />,
      action: () => {
        window.open("https://testnet.ref.finance/", "_blank");
      },
    },
    {
      title: "Comprar",
      icon: <BiCoinStack />,
      action: () => {
        openBuyJOBSModal();
      },
    },
    {
      title: "Depositar",
      icon: <BsArrowDown />,
      action: () => {
        openDepositTokenModal("JOBS", false);
      },
    },
    {
      title: "Retirar",
      icon: <BsArrowUp />,
      action: () => {
        openDepositTokenModal("JOBS", true);
      },
    },
    {
      title: "Bloquear",
      icon: <BiBlock />,
      action: () => {
        openBlockTokeModal();
      },
    },
    {
      title: "Retirar JOBS bloquedos",
      icon: <BsArrowUp />,
      action: () => {},
    },
  ];
  const USDCMenuItems = [
    {
      title: "Swap",
      icon: <IoMdSwap />,
      action: () => {
        window.open("https://testnet.ref.finance/", "_blank");
      },
    },
    {
      title: "Depositar",
      icon: <BsArrowDown />,
      action: () => {
        openDepositTokenModal("USDC", false);
      },
    },
    {
      title: "Retirar",
      icon: <BsArrowUp />,
      action: () => {
        openDepositTokenModal("USDC", true);
      },
    },
  ];

  useEffect(async () => {
    let balanceOfJOBS = await getFTBalanceOf(
      window.accountId,
      "ft.blockjobs.testnet"
    );
    if (balanceOfJOBS) {
      balanceOfJOBS = balanceOfJOBS / 10 ** 18;
    }

    let balanceOfUSDC = await getFTBalanceOf(window.accountId, "usdc");
    console.log("USDC tokens en marketplace", balanceOfUSDC);
    if (balanceOfUSDC) {
      balanceOfUSDC = balanceOfUSDC / 10 ** 18;
    }

    let JOBSBalanceFromWallet =
      (await getJOBSBalanceFromNearWallet(window.accountId)) / 10 ** 18;
    let USDCBalanceFromWallet =
      (await getUSDCBalanceFromNearWallet(window.accountId)) / 10 ** 18;
    console.log(USDCBalanceFromWallet);
    setJOBSWalletCBalance(JOBSBalanceFromWallet);
    setUSDWalletCBalance(USDCBalanceFromWallet);
    setUSDCBalance(balanceOfUSDC);
    setJOBSBalance(balanceOfJOBS);
    setNearBalance(
      utils.format.formatNearAmount(
        (await window.walletConnection.account().getAccountBalance()).available,
        4
      )
    );

    setLoading(false);
  }, []);

  function closeBuyJOBSModal() {
    setOpenBuyJOBSModal(false);
  }

  function openBuyJOBSModal() {
    setOpenBuyJOBSModal(true);
  }

  function closeDepositTokenModal() {
    setOpenDepositTokenModal(false);
  }

  function openDepositTokenModal(token, withdraw) {
    setOpenDepositTokenModal(true);
    setTokenSelectedForDeposit(token);
    setEnableWithdraw(withdraw);
  }

  function openBlockTokeModal() {
    setBlockTokeModal(true);
  }

  function closeBlockTokeModal() {
    setBlockTokeModal(false);
  }

  return (
    <div className="m-8 w-full">
      {loading ? (
        <div className="h-screen">
          <svg className="spinner" viewBox="0 0 50 50">
            <circle
              className="path"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="5"
            ></circle>
          </svg>
        </div>
      ) : (
        <div className="mx-auto">
          <table className="table-auto text-xl ">
            <thead>
              <tr className="">
                <th className="py-2 text-left">Tokens</th>
                <th className="text-left mr-8">
                  <div className="flex flex-row items-center ml-8">
                    <FaWallet className=" mx-2" />
                    NEAR
                  </div>
                </th>
                <th className="text-left mr-8">
                  <div className="flex flex-row items-center ml-8">
                    <FaWallet className=" mx-2" />
                    BlockJobs
                  </div>
                </th>
                <th>
                  <div> </div>
                </th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  <div className="flex flex-row items-center">
                    <img
                      className="my-2 w-[40px]"
                      src={require("../../assets/JobsCoinIcon.svg")}
                    ></img>
                    <div className="font-semibold ml-2 pr-4">JOBS</div>
                  </div>
                </td>
                <td className="text-right">
                  <div>{JOBSWalletBalance != 0 ? JOBSWalletBalance : "-"}</div>
                </td>
                <td className="text-right">
                  <div>{JOBSBalance != 0 ? JOBSBalance : "-"}</div>
                </td>
                <td className="pl-8 h-full">
                  <div className="flex items-center">
                    <div> </div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left z-30"
                    >
                      <div className="">
                        <Menu.Button className="w-full p-2 bg-[#27C0EF] rounded-full transition ease-in-out hover:scale-105 duration-300">
                          <BsThreeDotsVertical color="white" size={24} />
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
                            {JOBSMenuItems.map((v, i) => {
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
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex flex-row items-center">
                    <img
                      className="my-2 w-[40px]"
                      src={require("../../assets/usd-coin-usdc-logo.svg")}
                    ></img>
                    <div className="font-semibold ml-2">USDC</div>
                  </div>
                </td>
                <td className="text-right">
                  <div>{USDCWalletBalance != 0 ? USDCWalletBalance : "-"}</div>
                </td>
                <td className="text-right">
                  <div>{USDCBalance != 0 ? USDCBalance : "-"}</div>
                </td>
                <td className="flex pl-8 text-base">
                  <div className="flex items-center">
                    <div>{" "}</div>
                    <Menu
                      as="div"
                      className="relative inline-block text-left z-30"
                    >
                      <div className="">
                        <Menu.Button className="w-full p-2 bg-[#27C0EF] rounded-full transition ease-in-out hover:scale-105 duration-300">
                          <BsThreeDotsVertical color="white" size={24} />
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
                            {USDCMenuItems.map((v, i) => {
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
                  </div>
                </td>
              </tr>
              <tr>
                <td>
                  <div className="flex flex-row items-center">
                    <img
                      className="my-2 w-[40px]"
                      src={require("../../assets/logo-black.svg")}
                    ></img>
                    <div className="font-semibold ml-2">NEAR</div>
                  </div>
                </td>
                <td className="text-right">
                  <div>{nearBalance}</div>
                </td>
                <td className="text-right">-</td>
              </tr>
            </tbody>
          </table>
          <BuyJobsCoinDialog
            closeModal={closeBuyJOBSModal}
            isOpen={isOpenBuyJOBSModal}
            openModal={openBuyJOBSModal}
          />

          <DepositToken
            closeModal={closeDepositTokenModal}
            isOpen={isOpenDepositTokenModal}
            openModal={openDepositTokenModal}
            token={tokenSelectedForDeposit}
            withdraw={enableWithdraw}
          />

          <BlockTokenDialog
            closeModal={closeBlockTokeModal}
            isOpen={isBlockTokeModal}
            openModal={openBlockTokeModal}
          />
        </div>
      )}
    </div>
  );
}
