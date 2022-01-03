import 'regenerator-runtime/runtime'
import React from 'react'

export default function App() {
  return (
    <>
      <div className="h-screen bg-gradient-to-r from-cyan-500 to-blue-500">
        <div className="ml-20">
          {/* Navbar */}
          <div className="flex flex-row justify-between"> 
            <div>
              <span>Block</span>
              <span>Jobs</span>
            </div>
            <div>
              <button>as</button>
            </div>
          </div>

          <div class="flex h-full">
            <div>
              <div>
                Find your next job here!
              </div>
              <div>
                BlockJob is a dapp to search for jobs and freelancers. In addition to being an arbitrator to ensure that both parties are compliant.
              </div>
            </div>
            <div className="">
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
