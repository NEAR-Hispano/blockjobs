import React, { Fragment, useEffect, useState } from "react";
import { utils } from "near-api-js";
import { Transition, Dialog } from "@headlessui/react";
import AsyncSelect from "react-select/async";
import Select from "react-select";
import { toast } from "react-toastify";

import categoriesData from "../categoriesData.json";
import tokensData from "../tokensData.json";

// import makeAnimated from 'react-select/animated';

import { mintService, updateService } from "../utils";

export default function CreateServiceDialog({
  isOpen,
  closeModal,
  openModal,
  service,
}) {
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [titleService, setTitleService] = useState(
    service ? service.metadata.title : ""
  );
  const [descriptionService, setDescriptionService] = useState(
    service ? service.metadata.description : ""
  );
  const [categoriesService, setCategoriesService] = useState(
    service
      ? JSON.parse(service.metadata.categories).map((v) => {
          return { value: v, label: v };
        })
      : []
  );
  const [iconServiceFile, setIconServiceFile] = useState(null);
  const [priceService, setPriceService] = useState(
    service ? service.metadata.price : 0
  );
  const [durationService, setDurationService] = useState(
    service ? service.duration : 0
  );
  const [amountOfServices, setAmountOfServicesService] = useState(0);
  const [paidmentMethod, setPaidmentMethod] = useState(
    service
      ? tokensData.find((v) => {
          return v.value === service.metadata.token
        })
      : {
          value: "",
          label: "",
        }
  );

  const filterCategories = (inputValue) => {
    return categoriesData.filter((i) =>
      i.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const promiseOptions = (inputValue) =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve(filterCategories(inputValue));
      }, 500);
    });

  const handleOnChangeDuration = (e) => {
    const final = Number(
      e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1")
    );
    setDurationService(final);
  };

  const handleOnChangeAmount = (e) => {
    const final = Number(
      e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1")
    );
    setAmountOfServicesService(final);
  };

  const handleOnChangePrice = (e) => {
    const final = Number(
      e.target.value.replace(/[^0-9.]/g, "").replace(/(\..*?)\..*/g, "$1")
    );
    setPriceService(final);
  };

  const handleCounter = (mul, v, setterHook) => {
    if (v == 0 && mul <= 0) {
      return;
    }

    v = v + 1 * mul;
    setterHook(v);
  };

  const handleNumber = (e) => {
    let input = e.target.value;

    if (input.match(/^([0-9]{1,})?(\.)?([0-9]{1,})?$/)) setAmountOfNears(input);
  };

  const handleFloat = () => {
    // The conditional prevents parseFloat(null) = NaN (when the user deletes the input)
    setAmountOfNears(parseFloat(number) || "");
  };

  return (
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
            <Dialog.Overlay className="fixed inset-0 bg-[#F8F7FF]" />
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
                className="text-lg font-semibold leading-6 text-gray-900"
              >
                Crear un nuevo servicio
              </Dialog.Title>
              <div className="mt-2">
                {service ? (
                  <p className="text-sm text-gray-500 border-b-2 pb-2">
                    Por favor, rellene este formulario para modificar el
                    servicio. Al finalizar se va a cobrar un peaje de 0.1 NEARS
                    para cubrir el storage, el sobrante se rotornara.
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 border-b-2 pb-2">
                    Por favor, rellene este formulario para poder crear un nuevo
                    servicio. Al finalizar se va a cobrar un peaje de 0.1 NEARS
                    para cubrir el storage, el sobrante se rotornara.
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="text-gray-700 text-sm font-semibold">
                  Titulo
                </label>
                <input
                  value={titleService}
                  onChange={(e) => {
                    setTitleService(e.target.value);
                  }}
                  className={
                    "mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                  }
                ></input>

                <label className="text-gray-700 text-sm font-semibold">
                  Descripcion
                </label>
                <textarea
                  value={descriptionService}
                  onChange={(e) => {
                    setDescriptionService(e.target.value);
                  }}
                  className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                ></textarea>

                <label className="text-gray-700 text-sm font-semibold">
                  Categorias
                </label>
                <AsyncSelect
                  className=""
                  cacheOptions
                  defaultOptions
                  isMulti
                  value={categoriesService}
                  onChange={(value) => {
                    setCategoriesService(value);
                  }}
                  loadOptions={promiseOptions}
                />

                <div className="mt-2">
                  <label className="text-gray-700 text-sm font-semibold mt-2">
                    Metodo de pago
                  </label>
                  <Select
                    className="w-auto"
                    value={paidmentMethod}
                    onChange={(value) => {
                      setPaidmentMethod(value);
                    }}
                    options={tokensData}
                  />
                </div>

                <div className="mt-2">
                  <label className="text-gray-700 text-sm font-semibold mt-2">
                    Imagen
                  </label>
                </div>
                <div>
                  <input
                    accept="image/*"
                    type={"file"}
                    onChange={async (e) => {
                      setIconServiceFile(e.target.files[0]);
                    }}
                    className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                  />
                </div>

                <div className="flex flex-row mb-2">
                  {!service
                    ? [
                        {
                          title: "Duracion (dias)",
                          value: durationService,
                          action: handleOnChangeDuration,
                          counter: handleCounter,
                          value: durationService,
                          setter: setDurationService,
                        },
                        {
                          title: "Cantidad",
                          value: amountOfServices,
                          action: handleOnChangeAmount,
                          counter: handleCounter,
                          value: amountOfServices,
                          setter: setAmountOfServicesService,
                        },
                        {
                          title: `Precio (${paidmentMethod.value})`,
                          value: priceService,
                          action: handleOnChangePrice,
                          counter: handleCounter,
                          value: priceService,
                          setter: setPriceService,
                        },
                      ].map((v, i) => {
                        return (
                          <div className="h-auto w-32 mr-4" key={i}>
                            <label className="w-full text-gray-700 text-sm font-semibold">
                              {v.title}
                            </label>
                            <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
                              <button
                                className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                                onClick={() => {
                                  v.counter(-1, v.value, v.setter);
                                }}
                              >
                                <span className="m-auto text-2xl font-thin">
                                  −
                                </span>
                              </button>
                              <input
                                className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700 "
                                value={v.value}
                                onChange={v.action}
                              ></input>
                              <button
                                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                                onClick={() => {
                                  v.counter(1, v.value, v.setter);
                                }}
                              >
                                <span className="m-auto text-2xl font-thin">
                                  +
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })
                    : [
                        {
                          title: "Duracion (dias)",
                          value: durationService,
                          action: handleOnChangeDuration,
                          counter: handleCounter,
                          value: durationService,
                          setter: setDurationService,
                        },
                        {
                          title: "Precio (NEARS)",
                          value: priceService,
                          action: handleOnChangePrice,
                          counter: handleCounter,
                          value: priceService,
                          setter: setPriceService,
                        },
                        // {
                        //   title: `Precio (${paidmentMethod.value})`,
                        //   value: priceService,
                        //   action: handleOnChangePrice,
                        //   counter: handleCounter,
                        //   value: priceService,
                        //   setter: setPriceService,
                        // }
                      ].map((v, i) => {
                        return (
                          <div className="h-auto w-32 mr-4" key={i}>
                            <label className="w-full text-gray-700 text-sm font-semibold">
                              {v.title}
                            </label>
                            <div className="flex flex-row h-10 w-full rounded-lg relative bg-transparent mt-1">
                              <button
                                className=" bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-l cursor-pointer outline-none"
                                onClick={() => {
                                  v.counter(-1, v.value, v.setter);
                                }}
                              >
                                <span className="m-auto text-2xl font-thin">
                                  −
                                </span>
                              </button>
                              <input
                                className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"
                                value={v.value}
                                onChange={v.action}
                              ></input>
                              <button
                                className="bg-gray-300 text-gray-600 hover:text-gray-700 hover:bg-gray-400 h-full w-20 rounded-r cursor-pointer"
                                onClick={() => {
                                  v.counter(1, v.value, v.setter);
                                }}
                              >
                                <span className="m-auto text-2xl font-thin">
                                  +
                                </span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  {/* <div className="h-auto w-auto mr-4">
                    <label className="w-full text-gray-700 text-sm font-semibold">
                      {`Precio (${paidmentMethod.value})`}
                    </label>
                    <div className="flex flex-row h-10 w-28 rounded-lg relative bg-transparent mt-1 whitespace-pre-wrap">
                      <div className=" bg-gray-300 text-gray-600 h-full w-1 rounded-l outline-none">
                        <span className="m-auto text-2xl font-thin"> </span>
                      </div>
                      <input className="outline-none focus:outline-none text-center w-full bg-gray-300 font-semibold text-md hover:text-black focus:text-black  md:text-basecursor-default flex items-center text-gray-700"></input>
                      <div className="bg-gray-300 text-gray-600 h-full w-1 rounded-r">
                        <span className="m-auto text-2xl font-thin"> </span>
                      </div>
                    </div>
                  </div> */}
                </div>

                <div className="mt-4">
                  <button
                    type="button"
                    className={
                      loadingPicture
                        ? "inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-slate-400 cursor-not-allowed border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                        : "inline-flex justify-center items-center px-4 py-2 mr-4 text-white bg-[#27C0EF] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                    }
                    disabled={loadingPicture}
                    onClick={async () => {
                      const validateInputs = !service
                        ? [
                            {
                              ok: titleService.length > 10,
                              msg: "Titulo minimo 10 caracteres",
                            },
                            {
                              ok: titleService.length < 58,
                              msg: "Titulo maximo de 58 caracteres",
                            },
                            {
                              ok: descriptionService.length > 10,
                              msg: "Descripcion minimo 10 caracteres",
                            },
                            {
                              ok: descriptionService.length < 180,
                              msg: "Descripcion maximo de 180",
                            },
                            {
                              ok: categoriesService.length > 0,
                              msg: "Categorias minimo 1",
                            },
                            {
                              ok: categoriesService.length < 15,
                              msg: "Categorias maximo 10",
                            },
                            {
                              ok: iconServiceFile != null,
                              msg: "Falta el icono",
                            },
                            {
                              ok: priceService > 0,
                              msg: "Falta el precio",
                            },
                            {
                              ok: durationService > 0,
                              msg: "Falta la duracion",
                            },
                            {
                              ok: amountOfServices > 0,
                              msg: "Falta la cantidad",
                            },
                          ]
                        : [
                            {
                              ok: titleService.length > 10,
                              msg: "El titulo minimo 10 caracteres",
                            },
                            {
                              ok: titleService.length < 58,
                              msg: "El titulo maximo de 58 caracteres",
                            },
                            {
                              ok: descriptionService.length > 10,
                              msg: "Descripcion minimo 10 caracteres",
                            },
                            {
                              ok: descriptionService.length < 180,
                              msg: "Descripcion maximo de 180",
                            },
                            {
                              ok: paidmentMethod.value.length > 0,
                              msg: "Falta el metodo de pago",
                            },
                            {
                              ok: priceService > 0,
                              msg: "Falta el precio",
                            },
                            {
                              ok: durationService > 0,
                              msg: "Falta la duracion",
                            },
                          ];

                      let amt = utils.format.parseNearAmount("0.1");
                      let serviceMetadata = {
                        title: titleService,
                        description: descriptionService,
                        icon: service ? service.metadata.icon : "",
                        price: priceService,
                        categories: JSON.stringify(
                          categoriesService.map((v) => v.value)
                        ),
                        token: paidmentMethod.value.toLowerCase(),
                      };
                      try {
                        let finalValidatorMsg = [];
                        let finalOk = true;
                        validateInputs.forEach((v) => {
                          finalOk &= v.ok;
                          if (!v.ok) {
                            finalValidatorMsg.push(v.msg);
                          }
                        });

                        if (finalOk) {
                          if (iconServiceFile) {
                            if (iconServiceFile.size < 1024 ** 1024 * 5) {
                              setLoadingPicture(true);
                              const metadata =
                                await window.nftStorageClient.store({
                                  name: iconServiceFile.name,
                                  description: "image",
                                  image: iconServiceFile,
                                });
                              const imgData = metadata.data.image;
                              const finalUrl = `https://ipfs.io/ipfs/${imgData.host}${imgData.pathname}`;
                              console.log(finalUrl);
                              serviceMetadata.icon = finalUrl;
                              setLoadingPicture(false);
                            } else {
                              toast.error(
                                "No se puede subir archivos mayores de 5MB"
                              );
                            }
                          }

                          console.log(serviceMetadata);
                          if (!service) {
                            await mintService(
                              serviceMetadata,
                              amountOfServices,
                              durationService,
                              amt
                            );
                          } else {
                            await updateService(
                              service.id,
                              serviceMetadata,
                              durationService,
                              amt
                            );
                          }
                        } else {
                          finalValidatorMsg.forEach((v) => {
                            toast.error(v);
                          })
                        }
                      } catch (e) {
                        console.log(e.error);
                      }
                    }}
                  >
                    Crear!
                    {loadingPicture ? (
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
                  <button
                    type="button"
                    className="inline-flex justify-center px-4 py-2 text-white bg-[#FF0000] border border-transparent rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 font-bold"
                    onClick={closeModal}
                  >
                    Ahora no!
                  </button>
                </div>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
