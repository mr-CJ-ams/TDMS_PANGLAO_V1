import React from 'react'

const DolphinSpinner = ({ size = 'md' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }
  
  return (
    <div className="flex items-center justify-center">
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Water effect circles */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 animate-water-1 opacity-60 rounded-full bg-cyan-400"></div>
          <div className="absolute inset-0 animate-water-2 opacity-40 rounded-full bg-blue-400"></div>
        </div>
        {/* Spinning Dolphin */}
        <div className="absolute inset-0 animate-spin-slow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-full h-full"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 3C9.5 3 7.5 4.5 6.5 6C4.5 7 3 9.5 3 12C3 14.5 4.5 17 6.5 18C7.5 19.5 9.5 21 12 21C14.5 21 16.5 19.5 17.5 18C19.5 17 21 14.5 21 12C21 9.5 19.5 7 17.5 6C16.5 4.5 14.5 3 12 3Z"
              className="fill-white"
            />
            <path
              d="M12 5C10.5 5 9 5.5 8 6.5C6.5 7.5 5 9.5 5 12C5 14.5 6.5 16.5 8 17.5C9 18.5 10.5 19 12 19C13.5 19 15 18.5 16 17.5C17.5 16.5 19 14.5 19 12C19 9.5 17.5 7.5 16 6.5C15 5.5 13.5 5 12 5Z"
              className="fill-cyan-500"
            />
            <path
              d="M14.5 9C14.5 9.82843 13.8284 10.5 13 10.5C12.1716 10.5 11.5 9.82843 11.5 9C11.5 8.17157 12.1716 7.5 13 7.5C13.8284 7.5 14.5 8.17157 14.5 9Z"
              className="fill-white"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default DolphinSpinner