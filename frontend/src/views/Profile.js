import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { FaEdit } from "react-icons/fa";

import { getUser } from "../utils";
import UserProfile from "../components/UserProfile";
import DialogUserCreator from "../components/DialogUserCreator";

import { useGlobalState } from "../state";

// import userTestData from "../assets/userTestData.json"

export default function Profile() {
  let [loading, setLoading] = useState(true);
  let [isOpen, setIsOpen] = useState(false);
  let [enableEdit, setEnableEdit] = useState(false);
  let [user, setUser] = useState();
  const params = useParams();

  useEffect(() => {
    const foo = async () => {
      let userNearId = null;
      if (params.id) {
        userNearId = params.id;
      } else {
        userNearId = window.accountId;
      }
      console.log(userNearId);

      let user = await getUser(userNearId);
      if (user) {
        user.personal_data = JSON.parse(user.personal_data);
        setUser(user);
        setLoading(false);
        console.log(user);
      } else {
        // setUser(userTestData)
        // setLoading(false)
      }
    };
	foo()
  }, []);

  function closeModal() {
    setIsOpen(false);
    setEnableEdit(false);
  }

  function openModal() {
    setEnableEdit(true);
    setIsOpen(true);
  }

  return (
    <div className="m-8">
      {!user ? (
        <div className="">
          {/* <svg className="spinner" viewBox="0 0 50 50">
							<circle className="path" cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
						</svg> */}
          <div className="shadow-md rounded-md max-w-[700px] w-[568px] ">
            <div className="animate-pulse flex space-x-4">
              <div className="w-32 h-32 md:w-48 md:h-38 md:rounded md:rounded-bl-md md:rounded-tl-xl rounded-full mr-4 bg-gray-300"></div>
              <div className="flex-1 py-2 pr-2">
                <div className="h-5 bg-gray-300 rounded-lg"></div>
                <div className="w-full h-8 pt-6">
                  <div>
                    <div className="h-2 my-4 w-full bg-gray-300 rounded"></div>
                    <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex flex-row flex-wrap">
            <div className="shadow-md border-2 rounded-md mt-6 mr-4">
              <div className="animate-pulse p-4">
                <div className="">
                  <div className="h-5 w-52 bg-gray-300 rounded-lg"></div>
                  <div className="flex">
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                    <div className="mx-2"></div>
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shadow-md border-2 rounded-md mt-6 mr-4">
              <div className="animate-pulse p-4">
                <div className="">
                  <div className="h-5 w-52 bg-gray-300 rounded-lg"></div>
                  <div className="flex">
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shadow-md border-2 rounded-md mt-6 mr-4">
              <div className="animate-pulse p-4">
                <div className="">
                  <div className="h-5 w-52 bg-gray-300 rounded-lg"></div>
                  <div className="flex">
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="shadow-md border-2 rounded-md mt-6 mr-4">
              <div className="animate-pulse p-4">
                <div className="">
                  <div className="h-5 w-52 bg-gray-300 rounded-lg"></div>
                  <div className="flex">
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                    <div className="mx-2"></div>
                    <div className="h-auto w-full">
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                      <div className="h-2 my-4 w-full bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div className="relative">
            <div className="absolute right-0 top-0 hover:cursor-pointer rounded-full p-2 bg-[#04AADD] flex items-center justify-center transition ease-in-out hover:scale-110 duration-300">
              <FaEdit
                className=""
                size={"23px"}
                color="#ffffff"
                onClick={openModal}
              />
            </div>
            <UserProfile user={user} />
          </div>
          {enableEdit ? (
            <DialogUserCreator
              isOpen={isOpen}
              closeModal={closeModal}
              user={user}
            />
          ) : (
            <></>
          )}
        </div>
      )}
    </div>
  );
}
