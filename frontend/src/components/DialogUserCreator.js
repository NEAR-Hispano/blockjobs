import React, { Fragment, useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { toast } from "react-toastify";
import { Transition, Dialog } from "@headlessui/react";

import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

import countriesList from "../assets/countriesData.json";
import idiomsData from "../assets/idiomsData.json";
import { addUser, updateUserData } from "../utils";

const idiomLevelList = [
  { value: "Beginner", label: "Beginner" },
  { value: "Intermedian", label: "Intermedian" },
  { value: "Expert", label: "Expert" },
  { value: "Native", label: "Native" },
];

export default function DialogUserCreator({ isOpen, closeModal, user }) {
  const [loadingPicture, setLoadingPicture] = useState(false);
  const [bioInput, setBioInput] = useState(user ? user.personal_data.bio : "");
  const [countryInput, setCountryInput] = useState(
    user ? user.personal_data.country : ""
  );
  const [educacionInput, setEducationInput] = useState(
    user ? user.personal_data.education : ""
  );
  const [emailInput, setEmailInput] = useState(
    user ? user.personal_data.email : ""
  );
  const [legalNameInput, setLegalNameInput] = useState(
    user ? user.personal_data.legal_name : ""
  );
  const [selectFile, setSelectedFile] = useState();
  const [linksInputs, setLinksInputs] = useState(
    user ? user.personal_data.links : [""]
  );
  const [idiomInput, setIdiomInput] = useState(
    user
      ? user.personal_data.idioms
      : [
          {
            idiom: "",
            level: "",
          },
        ]
  );

  const addNewLinks = () => {
    setLinksInputs([...linksInputs, ""]);
  };
  const deleteLinks = (index) => {
    setLinksInputs(linksInputs.filter((v, i) => i !== index));
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
            <div className="min-w-[50%] inline-block w-full max-w-md p-6 my-8 text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
              <Dialog.Title
                as="h3"
                className="text-lg font-medium leading-6 text-gray-900"
              >
                Create a new user
              </Dialog.Title>
              <div className="mt-2">
                {user ? (
                  <p className="text-sm text-gray-500 border-b-2 pb-2">
                    Por favor, rellene este formulario para poder actualizar su
                    perfil. Al finalizar se va a cobrar un peaje de 0.1 NEARS
                    para cubrir el storage, el sobrante se rotornara. <br />
                    <span className="font-bold">
                      Recuerde, estos datos son opcionales!!! Y todo es publico
                      en la blockchain!!!
                    </span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-500 border-b-2 pb-2">
                    Please, fill in this form to be able to create your user. At
                    the end, a toll of 0.1 NEARS will be charged to cover the
                    storage the remainder will be returned. <br />
                    <span className="font-bold">
                      Remember, this data is optional and everything is public
                      on blockchain!
                    </span>
                  </p>
                )}
              </div>
              <div className="mt-2">
                <label className="text-gray-700 text-sm font-semibold">
                  Legal name
                </label>
                <input
                  value={legalNameInput}
                  onChange={(e) => {
                    setLegalNameInput(e.target.value);
                  }}
                  className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                ></input>

                <label className="text-gray-700 text-sm font-semibold">
                  Education
                </label>
                <input
                  value={educacionInput}
                  onChange={(e) => {
                    setEducationInput(e.target.value);
                  }}
                  className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                ></input>

                <label className="text-gray-700 text-sm font-semibold">
                  Picture
                </label>
                <div className="flex">
                  <input
                    accept="image/*"
                    type={"file"}
                    onChange={async (e) => {
                      const image = e.target.files[0];
                      setSelectedFile(image);
                      // selectFile, setSelectedFile
                    }}
                    className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                  />
                </div>

                <label className="text-gray-700 text-sm font-semibold">
                  Email
                </label>
                <input
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                  }}
                  className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                ></input>

                <div className="mb-2">
                  <label className="text-gray-700 text-sm font-semibold">
                    Country
                  </label>
                  <Select
                    className="bg-gray-200"
                    options={countriesList}
                    placeholder="Country"
                    defaultInputValue={countryInput}
                    defaultValue={countryInput}
                    value={{ value: countryInput, label: countryInput }}
                    onChange={(value) => {
                      setCountryInput(value.label);
                    }}
                  />
                </div>

                <label className="text-gray-700 text-sm font-semibold">
                  Bio
                </label>
                {/* bioInput, setBioInput */}
                <textarea
                  value={bioInput}
                  onChange={(e) => {
                    setBioInput(e.target.value);
                  }}
                  className="mb-2 bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                ></textarea>
              </div>

              <label className="text-gray-700 text-sm font-semibold">
                Links
              </label>
              <div className="grid grid-cols-2 gap-2 mb-2">
                {linksInputs.map((v, index) => {
                  return (
                    <div className="flex items-center" key={index}>
                      <input
                        value={v}
                        onChange={(e) => {
                          let newArr = [...linksInputs];
                          newArr[index] = e.target.value;
                          setLinksInputs(newArr);
                        }}
                        className="bg-gray-200 appearance-none border-2 border-gray-200 rounded w-full py-2 px-4 text-gray-700 leading-tight focus:outline-none focus:bg-white focus:border-[#27C0EF]"
                      ></input>
                      <div
                        onClick={
                          index !== linksInputs.length - 1
                            ? () => {
                                deleteLinks(index);
                              }
                            : () => {
                                addNewLinks(index);
                              }
                        }
                        className={
                          index !== linksInputs.length - 1
                            ? "rounded-full mx-1 bg-red-600 text-white p-1 cursor-pointer"
                            : "rounded-full mx-1 bg-[#27C0EF] text-white p-1 cursor-pointer"
                        }
                      >
                        {index === linksInputs.length - 1 ? (
                          <AiOutlinePlus size={24} />
                        ) : (
                          <AiOutlineMinus size={24} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <label className="text-gray-700 text-sm font-semibold">
                Languages
              </label>
              {idiomInput.map((v, index) => {
                return (
                  <div
                    className="flex items-center self-stretch w-full mb-2"
                    key={index}
                  >
                    <Select
                      className="bg-gray-200 w-full mr-2"
                      placeholder="Idioma"
                      options={idiomsData}
                      defaultInputValue={v.idiom}
                      value={{ value: v.idiom, label: v.idiom }}
                      controlShouldRenderValue={true}
                      onChange={(value) => {
                        let newArr = idiomInput.map((v, i) =>
                          i === index
                            ? { idiom: value.value, level: v.level }
                            : v
                        );
                        setIdiomInput(newArr);
                      }}
                    />
                    <Select
                      className="bg-gray-200 w-full"
                      placeholder="Nivel"
                      options={idiomLevelList}
                      defaultInputValue={v.level}
                      value={{ value: v.level, label: v.level }}
                      onChange={(value) => {
                        let newArr = [...idiomInput];
                        newArr[index].level = value.value;
                        setIdiomInput(newArr);
                      }}
                    />
                    <div
                      onClick={
                        index !== idiomInput.length - 1
                          ? () => {
                              setIdiomInput(
                                idiomInput.filter((v, i) => i !== index)
                              );
                            }
                          : () => {
                              setIdiomInput([
                                ...idiomInput,
                                { idiom: "", level: "" },
                              ]);
                            }
                      }
                      className={
                        index !== idiomInput.length - 1
                          ? "rounded-full ml-1 bg-red-600 text-white p-1 cursor-pointer"
                          : "rounded-full ml-1 bg-[#27C0EF] text-white p-1 cursor-pointer"
                      }
                    >
                      {index === idiomInput.length - 1 ? (
                        <AiOutlinePlus size={24} />
                      ) : (
                        <AiOutlineMinus size={24} />
                      )}
                    </div>
                  </div>
                );
              })}

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
                    let personalData = {
                      legal_name: legalNameInput,
                      education: educacionInput,
                      links: linksInputs,
                      picture: user ? user.personal_data.picture : "",
                      bio: bioInput,
                      country: countryInput,
                      email: emailInput,
                      idioms: idiomInput,
                    };
                    console.log(personalData);
                    try {
                      if (selectFile) {
                        if (selectFile.size < 1024 ** 1024 * 5) {
                          setLoadingPicture(true);
                          const metadata = await window.nftStorageClient.store({
                            name: selectFile.name,
                            description: "image",
                            image: selectFile,
                          });
                          const imgData = metadata.data.image;
                          console.log(imgData);
                          const finalUrl = `https://ipfs.io/ipfs/${imgData.host}${imgData.pathname}`;
                          personalData.picture = finalUrl;
                          setLoadingPicture(false);
                        } else {
                          toast.error(
                            "No se puede subir archivos mayores de 5MB"
                          );
                        }
                      }

                      console.log(personalData);
                      if (user) {
                        await updateUserData(JSON.stringify(personalData));
                      } else {
                        await addUser(JSON.stringify(personalData));
                      }

                      // setLegalNameInput("")
                      // setEducationInput("")
                      // setPictureInput("")
                      // setBioInput("")
                      // setLinksInputs(linksInputs.map((v) => { return "" }))
                    } catch (e) {
                      console.log(e.error);
                    }
                  }}
                >
                  Create!
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
                  Not now!
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
