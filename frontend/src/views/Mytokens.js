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

import jobsCoinIcon from "../assets/JobsCoinIcon.svg";
import nearBlackLogo from "../assets/logo-black.svg";
import usdcLogo from "../assets/usd-coin-usdc-logo.svg";

import {
  getFTBalanceOf,
  getJOBSBalanceFromNearWallet,
  getUSDCBalanceFromNearWallet,
  getLockedTokensOf,
} from "../utils";

export default function MyTokens() {
  const [loading, setLoading] = useState(true);
  const [USDCBalance, setUSDCBalance] = useState(0);
  const [USDCWalletBalance, setUSDWalletCBalance] = useState(0);
  const [JOBSWalletBalance, setJOBSWalletCBalance] = useState(0);
  const [JOBSBalance, setJOBSBalance] = useState(0);
  const [LockedJOBSBalance, setLockedJOBSBalance] = useState(0);
  const [nearBalance, setNearBalance] = useState(0);
  let [isOpenBuyJOBSModal, setOpenBuyJOBSModal] = useState(false);
  let [isOpenDepositTokenModal, setOpenDepositTokenModal] = useState(false);
  let [isBlockTokeModal, setBlockTokeModal] = useState(false);
  let [enableWithdraw, setEnableWithdraw] = useState(false);
  let [enableWithdrawBlocked, setEnableWithdrawBlocked] = useState(false);
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
      title: "Buy",
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
      title: "Lock",
      icon: <BiBlock />,
      action: () => {
        openBlockTokeModal(false);
      },
    },
    {
      title: "Retirar JOBS bloqueados",
      icon: <BsArrowUp />,
      action: () => {
        openBlockTokeModal(true);
      },
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

  useEffect(() => {
    const foo = async () => {
      let balanceOfJOBS = await getFTBalanceOf(
        window.accountId,
        "ft.blockjobs.testnet"
      );
      if (balanceOfJOBS) {
        balanceOfJOBS = balanceOfJOBS / 10 ** 18;
      }

      let balanceOfUSDC = await getFTBalanceOf(window.accountId, "usdc");
      if (balanceOfUSDC) {
        balanceOfUSDC = balanceOfUSDC / 10 ** 6;
      }

      let lockedTokensOf = await getLockedTokensOf(window.accountId);
      if (lockedTokensOf) {
        lockedTokensOf = lockedTokensOf / 10 ** 18;
      }

      console.log(lockedTokensOf);
      let JOBSBalanceFromWallet =
        (await getJOBSBalanceFromNearWallet(window.accountId)) / 10 ** 18;
      let USDCBalanceFromWallet =
        (await getUSDCBalanceFromNearWallet(window.accountId)) / 10 ** 6;
      setJOBSWalletCBalance(JOBSBalanceFromWallet);
      setUSDWalletCBalance(USDCBalanceFromWallet);
      setUSDCBalance(balanceOfUSDC);
      setJOBSBalance(balanceOfJOBS);
      setLockedJOBSBalance(lockedTokensOf);
      setNearBalance(
        utils.format.formatNearAmount(
          (await window.walletConnection.account().getAccountBalance())
            .available,
          4
        )
      );

      setLoading(false);
    };

    foo();
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

  function openBlockTokeModal(withdraw) {
    setBlockTokeModal(true);
    setEnableWithdrawBlocked(withdraw)
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
        <div className="flex">
          <div className="mx-auto">
            <div className="shadow-md border-2 rounded-lg px-6 py-4 mt-4">
              <table className="table-auto text-xl ">
                <thead>
                  <tr className="">
                    <th className="pt-2 pb-4 text-left">Tokens</th>
                    <th className="text-left mr-8">
                      <div className="flex flex-row items-center ml-8">
                        <FaWallet className=" mx-2" />
                        NEAR
                      </div>
                    </th>
                    <th className="text-left mr-8">
                      <div className="flex flex-row items-center ml-8">
                        <FaWallet className=" mx-2" />
                        Balances
                      </div>
                    </th>
                    <th>
                      <div className="flex flex-row items-center ml-8">
                        <BiBlock className=" mx-2" />
                        JOBS bloqueados
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
                          src={jobsCoinIcon}
                        ></img>
                        <div className="font-semibold ml-2 pr-4">JOBS</div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div>
                        {JOBSWalletBalance != 0 ? JOBSWalletBalance : "-"}
                      </div>
                    </td>
                    <td className="text-right">
                      <div>{JOBSBalance != 0 ? JOBSBalance : "-"}</div>
                    </td>
                    <td className="text-right">
                      <div>
                        {LockedJOBSBalance != 0 ? LockedJOBSBalance : "-"}
                      </div>
                    </td>
                    <td className="pl-12 h-full">
                      <Options menuItems={JOBSMenuItems} lowerZ={false}/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row items-center">
                        <img
                          className="my-2 w-[40px]"
                          src={usdcLogo}
                        ></img>
                        <div className="font-semibold ml-2">USDC</div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div>
                        {USDCWalletBalance != 0 ? USDCWalletBalance : "-"}
                      </div>
                    </td>
                    <td className="text-right">
                      <div>{USDCBalance != 0 ? USDCBalance : "-"}</div>
                    </td>
                    <td className="text-right">
                      {/* <div>-</div> */}
                    </td>
                    <td className="flex pl-12 text-base">
                      <Options menuItems={USDCMenuItems} lowerZ={true}/>
                    </td>
                  </tr>
                  <tr>
                    <td>
                      <div className="flex flex-row items-center">
                        <img
                          className="my-2 w-[40px]"
                          src={nearBlackLogo}
                        ></img>
                        <div className="font-semibold ml-2">NEAR</div>
                      </div>
                    </td>
                    <td className="text-right">
                      <div>{nearBalance}</div>
                    </td>
                    {/* <td className="text-right">-</td> */}
                    {/* <td className="text-right">-</td> */}
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
                withdraw={enableWithdrawBlocked}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Options({ menuItems, lowerZ }) {
  return (
    <div className="flex items-center">
      <div> </div>
      <Menu as="div" className={lowerZ ? "relative inline-block text-left" : "relative inline-block text-left z-30"}>
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
              {menuItems.map((v, i) => {
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
  );
}
