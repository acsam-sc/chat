import React from 'react'

const TopBar = () => {
  return (
    <div className="border-b flex px-6 py-2 items-center">
      <div className="flex flex-col">
        <h3 className="text-gray-700 text-md mb-1 font-extrabold">#general</h3>
        <div className="text-gray-500 font-thin text-sm">
          Chit-chattin&apos; about ugly HTML and mixing of concerns.
        </div>
      </div>
      <div className="ml-auto hidden">
        <input
          type="search"
          placeholder="Search"
          className="border border-gray-500 rounded-lg p-2"
        />
      </div>
    </div>
  )
}

export default TopBar
