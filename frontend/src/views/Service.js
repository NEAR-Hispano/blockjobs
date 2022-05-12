import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ImCross, ImCheckmark } from "react-icons/im";
import { utils } from "near-api-js";

import {
  buyService,
  getServiceById,
  getUser,
  login,
  reclaimService,
  reclaimServiceTest,
} from "../utils";

import CreateServiceDialog from "../components/CreateServiceDialog";
import CreateDisputeDialog from "../components/CreateDisputeDialog";
import UserProfile from "../components/UserProfile";
import SkeletonLoaderService from "../components/SkeletonLoaderService";
import SkeletonLoaderProfile from "../components/SkeletonLoaderProfile";

import { useGlobalState } from "../state";

import { TokenIcons } from "../components/TokenIcons";
import Chat from "../components/Chat";

export default function Service() {
  const [isUserCreated] = useGlobalState("isUserCreated");
  const [service, setService] = useState();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingReclaimService, setLoadingReclaimService] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [loadingBuyService, setLoadingBuyService] = useState(false);

  const params = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const foo = async () => {
      let loadingService = true;
      let loadingUser = true;

      let s = await getServiceById(Number(params.id));

      if (s) {
        setService(s);
        loadingService = false;
      }

      let user = await getUser(s.creator_id);
      if (user) {
        try {
          user.personal_data = JSON.parse(user.personal_data);
        } catch (e) {}
        setUser(user);
        loadingUser = false;
      }
      if (!loadingService && !loadingUser) {
        setLoading(false);
      }
    };
    foo();
  }, []);

  const showChat = () => {
    if (
      (window.accountId == service.creator_id ||
        window.accountId == service.actual_owner) &&
      service.creator_id != service.actual_owner
    ) {
      return true;
    }

    return false;
  };

  const handleBuyService = async () => {
    setLoadingBuyService(true);
    if (service.metadata.token != "near") {
      await buyService(service.id, service.metadata.price);
    } else {
      const amount = utils.format.parseNearAmount(
        String(service.metadata.price)
      );
      await buyService(service.id, amount);
    }

    setLoadingBuyService(false);
    return;

    // toast.error("No tienes suficientes fondos para adquirir este servicio");
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  const dateToString = (date) => {
    let d = new Date(Math.round(date / 1000000));
    return (
      d.toLocaleDateString() + "  (" + d.getHours() + ":" + d.getMinutes() + ")"
    );
  };

  const timeLeftService = (sold_moment) => {
    // let s = new Date(Math.round((sold_moment) / 1000000)) - clock
    let s = new Date(Math.round(sold_moment / 1000000));
    s.setDate(s.getDate() + service.duration);
    return (
      s.getDate() +
      "/" +
      (s.getMonth() + 1) +
      "/" +
      s.getFullYear() +
      "  (" +
      s.getHours() +
      ":" +
      s.getMinutes() +
      ")"
    );
  };

  const handleReclainService = async () => {
    let now = new Date().getTime();
    setLoadingReclaimService(true);
    if (now >= getReclaimDate()) {
      await reclaimService(service.id);
      // location.reload();
      console.log(service.id, "Hora correcta");
    } else {
      await reclaimService(service.id);
      location.reload();
    }
  };

  const getReclaimDate = () => {
    let reclaimMoment = new Date(Math.round(service.buy_moment / 1000000));
    return reclaimMoment.setDate(reclaimMoment.getDate() + service.duration);
  };

  return (
    <div className="">
      {service ? (
        service.actual_owner == window.accountId &&
        service.creator_id == window.accountId &&
        !service.sold &&
        isUserCreated ? (
          <CreateServiceDialog
            isOpen={isOpen}
            closeModal={closeModal}
            openModal={openModal}
            service={service}
          />
        ) : service.actual_owner == window.accountId &&
          service.creator_id != window.accountId &&
          service.sold &&
          isUserCreated ? (
          <CreateDisputeDialog
            isOpen={isOpen}
            closeModal={closeModal}
            openModal={openModal}
            serviceId={service.id}
          />
        ) : (
          <></>
        )
      ) : (
        <></>
      )}
      <div className="m-8">
        {loading ? (
          <div className="">
            <div className="border-2 rounded-lg px-6 py-4 mt-4 shadow-md">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                Service
              </div>
              <SkeletonLoaderService />
            </div>
            <div className="border-2 rounded-lg shadow-md px-6 py-4 mt-4">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                Perfil del usuario
              </div>
              <SkeletonLoaderProfile />
            </div>
          </div>
        ) : (
          <div>
            {!window.walletConnection.isSignedIn() ? (
              <button
                onClick={login}
                className="uppercase py-2 px-4 rounded-lg bg-[#04AADD] border-transparent text-white text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
              >
                Login
              </button>
            ) : (service.actual_owner != window.accountId ||
                service.creator_id != window.accountId) &&
              !service.sold &&
              isUserCreated ? (
              <button
                onClick={handleBuyService}
                className="uppercase py-2 px-4 rounded-lg flex items-center bg-green-500 border-transparent text-white text-lg mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                disabled={loadingBuyService}
              >
                Buy servicio{" "}
                {loadingBuyService ? (
                  <div className="ml-2">
                    <svg className="spinner-normal" viewBox="0 0 50 50">
                      <circle
                        className="path !stroke-white"
                        cx="25"
                        cy="25"
                        r="20"
                        fill="none"
                        strokeWidth="5"
                      ></circle>
                    </svg>
                  </div>
                ) : (
                  <></>
                )}
              </button>
            ) : service.actual_owner == window.accountId &&
              service.creator_id == window.accountId &&
              !service.sold &&
              isUserCreated ? (
              <div className="flex flex-row justify-between">
                <div className="flex">
                  <button
                    onClick={openModal}
                    className="uppercase py-2 px-4 rounded-lg bg-[#04AADD] border-transparent text-white text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                  >
                    Editar servicio
                  </button>
                  {/* <button className="uppercase py-2 px-4 rounded-lg bg-red-400 border-transparent text-white text-md mr-4">
                    Eliminar servicio
                  </button> */}
                </div>
              </div>
            ) : service.actual_owner == window.accountId &&
              service.creator_id != window.accountId &&
              service.sold &&
              !service.on_dispute &&
              isUserCreated ? (
              <div className="flex justify-end">
                <button
                  onClick={openModal}
                  className="uppercase py-2 px-4 rounded-lg bg-red-400 border-transparent text-white text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                >
                  Create dispute!
                </button>
              </div>
            ) : service.actual_owner != window.accountId &&
              service.creator_id == window.accountId &&
              service.sold &&
              !service.on_dispute &&
              isUserCreated ? (
              <div>
                <button
                  onClick={handleReclainService}
                  disabled={loadingReclaimService}
                  className="uppercase py-2 px-4 rounded-lg bg-green-600 border-transparent text-white text-md mr-4 transition ease-in-out hover:scale-105 hover:-translate-y-0.5 duration-300 shadow-lg"
                >
                  Claim payment!
                </button>
              </div>
            ) : (
              <></>
            )}
            <div className="border-2 rounded-lg px-6 py-4 shadow-md mt-4">
              <div className="text-2xl text-center font-bold text-gray-800 mb-4">
                Service
              </div>
              <div className="">
                <div className="flex self-baseline">
                  {service.metadata.icon ? (
                    <img
                      className="w-32 h-32 md:w-48 md:max-h-52 md:rounded md:rounded-bl-xl md:rounded-tl-xl rounded-full mr-4 object-contain "
                      src={service.metadata.icon}
                    />
                  ) : (
                    <></>
                  )}
                  <div>
                    <div className="text-[#034D82] text-2xl font-extrabold">
                      {service.metadata.title}
                    </div>
                    <div className="truncate text-slate-800 font-semibold text-lg">
                      {service.metadata.description}
                    </div>
                  </div>
                </div>
              </div>

              <div className="font-light items-center mt-1 whitespace-pre-wrap text-lg text-slate-800">
                <div className="whitespace-pre-wrap flex">
                  <div
                    className="hover:cursor-pointer mr-3"
                    onClick={() => {
                      navigate(`/profile/${service.creator_id}`, {
                        replace: true,
                      });
                    }}
                  >
                    <span className="font-semibold">Creador: </span>
                    {service.creator_id}
                  </div>
                  <div
                    className="hover:cursor-pointer"
                    onClick={() => {
                      navigate(`/profile/${service.actual_owner}`, {
                        replace: true,
                      });
                    }}
                  >
                    <span className="font-semibold">Dueño: </span>
                    {service.actual_owner}
                  </div>
                </div>

                <div className="text-lg flex items-center">
                  <span className="font-semibold">Price</span>:{" "}
                  {service.metadata.price}
                  <img
                    className="w-[26px] ml-1"
                    src={
                      TokenIcons.find((v) => {
                        return v.value === service.metadata.token;
                      }).path
                    }
                  ></img>
                </div>

                <div className="flex whitespace-pre-wrap self-start font-semibold text-slate-800">
                  <div className="mr-2">
                    Duration:
                    <span className="font-light"> {service.duration} days</span>
                  </div>

                  <div className="flex items-center mr-2">
                    Sold:
                    <span className="font-light mx-1">
                      {service.sold ? (
                        <ImCheckmark color="green" />
                      ) : (
                        <ImCross color="red" />
                      )}
                    </span>
                  </div>

                  <div className="flex items-center mr-2">
                    On Sale:
                    <span className="font-light mx-1">
                      {service.on_sale ? (
                        <ImCheckmark color="green" />
                      ) : (
                        <ImCross color="red" />
                      )}
                    </span>
                  </div>

                  <div className="flex items-center mr-2">
                    On Dispute:
                    <span className="font-light mx-1">
                      {service.on_dispute ? (
                        <ImCheckmark color="green" />
                      ) : (
                        <ImCross color="red" />
                      )}
                    </span>
                  </div>
                </div>
              </div>
              {service.sold && (
                <div className="mt-6 font-medium flex">
                  <div className="text font-semibold text-gray-800 mb-2 mr-3">
                    Momento de compra {dateToString(service.buy_moment)}
                  </div>
                  <div className="text font-semibold text-gray-800">
                    Terminara el {timeLeftService(service.buy_moment)}
                  </div>
                </div>
              )}
            </div>

            {showChat() ? (
              <div className=" border-2 rounded-lg shadow-md px-6 py-4 mt-8 ">
                <div className="text-2xl text-center font-bold text-gray-800 mb-4">
                  Chat
                </div>
                <Chat service={service}/>
              </div>
            ) : (
              <></>
            )}

            <div className="border-2 rounded-lg shadow-md px-6 py-4 mt-8">
              <div className="text-2xl text-center font-bold text-gray-800 mb-4">
                Perfil del creador
              </div>
              {user ? <UserProfile user={user} /> : <SkeletonLoaderProfile />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
