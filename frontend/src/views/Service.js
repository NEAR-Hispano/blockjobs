import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { utils } from "near-api-js";
import { toast } from "react-toastify";

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
import ServicesCard from "../components/ServicesCard";
import UserProfile from "../components/UserProfile";
import SkeletonLoaderService from "../components/SkeletonLoaderService";
import SkeletonLoaderProfile from "../components/SkeletonLoaderProfile";

import { ImCross, ImCheckmark } from "react-icons/im";

import { useGlobalState } from "../state";

export default function Service() {
  const [isUserCreated] = useGlobalState("isUserCreated");
  let [service, setService] = useState();
  let [user, setUser] = useState();
  let [loading, setLoading] = useState(true);
  let [loadingReclaimService, setLoadingReclaimService] = useState(false);
  let [isOpen, setIsOpen] = useState(false);
  const params = useParams();
  const navigate = useNavigate();
  useEffect(async () => {
    let loadingService = true;
    let loadingUser = true;

    let s = await getServiceById(Number(params.id));

    if (s) {
      setService(s);
      loadingService = false;
    }

    let user = await getUser(s.creator_id);
    if (user) {
      user.personal_data = JSON.parse(user.personal_data);
      console.log(user);
      setUser(user);
      loadingUser = false;
    }
    if (!loadingService && !loadingUser) {
      setLoading(false);
    }
  }, []);

  const handleBuyService = async () => {
    const userBalance = utils.format.formatNearAmount(
      (await window.walletConnection.account().getAccountBalance()).available
    );

    if (service.metadata.price < userBalance) {
      const amount = utils.format.parseNearAmount(
        String(service.metadata.price)
      );
      console.log(amount);
      await buyService(service.id, amount);
      return;
    }

    toast.error("No tienes suficientes fondos para adquirir este servicio");
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
      d.toLocaleDateString() +
      "  (" +
      d.getHours() +
      "h " +
      d.getMinutes() +
      "m )"
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
      "h " +
      s.getMinutes() +
      "m )"
    );
  };

  const handleReclainService = async () => {
    let now = new Date().getTime();
    setLoadingReclaimService(true);
    if (now >= getReclaimDate()) {
      // await reclaimService(service.id)
      // location.reload();
      console.log("Hora correcta");
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
                Servicio
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
                className="uppercase py-2 px-4 rounded-lg bg-[#04AADD] border-transparent text-white text-md mr-4"
              >
                Login
              </button>
            ) : (service.actual_owner != window.accountId ||
                service.creator_id != window.accountId) &&
              !service.sold &&
              isUserCreated ? (
              <button
                onClick={handleBuyService}
                className="uppercase py-2 px-4 rounded-lg bg-green-500 border-transparent text-white text-md mr-4"
              >
                Comprar servicio
              </button>
            ) : service.actual_owner == window.accountId &&
              service.creator_id == window.accountId &&
              !service.sold &&
              isUserCreated ? (
              <div className="flex flex-row justify-between">
                <div className="flex">
                  <button
                    onClick={openModal}
                    className="uppercase py-2 px-4 rounded-lg bg-[#04AADD] border-transparent text-white text-md mr-4"
                  >
                    Editar servicio
                  </button>
                  <button className="uppercase py-2 px-4 rounded-lg bg-red-400 border-transparent text-white text-md mr-4">
                    Eliminar servicio
                  </button>
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
                  className="uppercase py-2 px-4 rounded-lg bg-red-400 border-transparent text-white text-md mr-4"
                >
                  Reclamar!
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
                  className="uppercase py-2 px-4 rounded-lg bg-green-600 border-transparent text-white text-md mr-4"
                >
                  Reclamar Pago!
                </button>
              </div>
            ) : (
              <></>
            )}
            <div className="border-2 rounded-lg px-6 py-4 shadow-md mt-4">
              <div className="">
                <div className="flex self-baseline">
                  {service.metadata.icon ? (
                    <img
                      className="w-32 h-32 rounded-full mr-4 object-cover"
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
                    className="w-[26px]"
                    src={require("../../assets/logo-black.svg")}
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
            <div className="border-2 rounded-lg shadow-md px-6 py-4 mt-4">
              <div className="text-2xl font-bold text-gray-800 mb-4">
                Perfil del usuario
              </div>
              <UserProfile user={user} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
