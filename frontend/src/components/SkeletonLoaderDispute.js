import React from "react";

export default function SkeletonLoaderDispute() {
  return (
    <div className="w-full h-auto hover:cursor-pointer animate-pulse flex rounded-md border-2 shadow-md border-[#27C0EF] p-4 bg-[#F8F7FF] transition ease-in-out hover:scale-[1.02]">
      <div class="flex w-full  py-1">
        {/* <div class="h-2 bg-gray-300  rounded"></div> */}
        <div class="space-y-3 w-1/2">
          <div class="h-6 bg-gray-300  rounded"></div>
          <div class="grid grid-cols-3 gap-4">
            <div class="h-4 bg-gray-300  rounded col-span-1"></div>
            <div class="h-4 bg-gray-300  rounded col-span-1"></div>
            <div class="h-4 bg-gray-300  rounded col-span-1"></div>
          </div>
        </div>
        <div className="mx-4"></div>
        <div class="space-y-3 w-1/2 h-auto">
          <div class="h-6 bg-gray-300  rounded"></div>
          <div class="h-4 bg-gray-300  rounded"></div>
        </div>
      </div>
    </div>
  );
}
