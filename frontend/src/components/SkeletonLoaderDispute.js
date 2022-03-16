import React from "react";

export default function SkeletonLoaderDispute() {
  return (
    <div className="w-full h-auto hover:cursor-pointer animate-pulse flex rounded-md border-2 shadow-md border-[#27C0EF] p-4 bg-[#F8F7FF] transition ease-in-out hover:scale-[1.02]">
      <div className="flex w-full  py-1">
        {/* <div className="h-2 bg-gray-300  rounded"></div> */}
        <div className="space-y-3 w-1/2">
          <div className="h-6 bg-gray-300  rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="h-4 bg-gray-300  rounded col-span-1"></div>
            <div className="h-4 bg-gray-300  rounded col-span-1"></div>
            <div className="h-4 bg-gray-300  rounded col-span-1"></div>
          </div>
        </div>
        <div className="mx-4"></div>
        <div className="space-y-3 w-1/2 h-auto">
          <div className="h-6 bg-gray-300  rounded"></div>
          <div className="h-4 bg-gray-300  rounded"></div>
        </div>
      </div>
    </div>
  );
}
