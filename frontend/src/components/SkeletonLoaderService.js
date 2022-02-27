import React from "react";

export default function SkeletonLoaderService() {
  return (
    <div className="w-full h-auto hover:cursor-pointer animate-pulse flex rounded-md border-2 shadow-md border-[#27C0EF] p-4 bg-[#F8F7FF] transition ease-in-out hover:scale-[1.02]">
      <div className="w-24 h-24 rounded-full mr-4 bg-gray-300"></div>
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
  );
}
