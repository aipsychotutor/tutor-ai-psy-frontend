import {forwardRef} from "react";
import CameraToModelWS from "./CameraToModelWS";

/**
 * ToolsPanel Component
 *
 * Displays a set of floating action buttons for simulation controls:
 * 1. Toggle Camera Zoom
 * 2. Toggle Green Screen (Chroma Key) background
 * 3. Camera Analysis Widget for capturing expression data
 *
 * @component
 * @param {object} props - Component props.
 * @param {boolean} props.cameraZoomed - Current zoom state.
 * @param {function} props.setCameraZoomed - State setter for zoom.
 */
const ToolsPanel = forwardRef(
  ({ cameraZoomed, setCameraZoomed }, ref) => {
  // Handler to toggle a CSS class on the body for green screen effect
  const toggleGreenScreen = () => {
    const body = document.querySelector("body");
    if (body) {
      body.classList.toggle("greenScreen");
    }
  };

  return (
    <div className="absolute top-20 right-4 flex flex-col items-end gap-3 pointer-events-auto">
      {/* Zoom Toggle Button */}
      <button
        onClick={() => setCameraZoomed(!cameraZoomed)}
        className="bg-white hover:bg-gray-100 text-black border border-gray-200 p-3 rounded-full shadow-md backdrop-blur-sm transition-all"
        title="Toggle Zoom"
      >
        {cameraZoomed ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM13.5 10.5h-6"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6"
            />
          </svg>
        )}
      </button>

      {/* Green Screen Toggle Button */}
      <button
        onClick={toggleGreenScreen}
        className="bg-white hover:bg-gray-100 text-black border border-gray-200 p-3 rounded-full shadow-md backdrop-blur-sm transition-all"
        title="Toggle Green Screen"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-6 h-6"
        >
          <path
            strokeLinecap="round"
            d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
          />
        </svg>
      </button>
    
      {/* Camera Analysis Widget */}
        <div className="fixed bottom-32 right-6 w-80 max-w-[90vw] rounded-xl bg-black/80 border border-white/10 shadow-2xl z-40 backdrop-blur pointer-events-auto">
          <CameraToModelWS 
            ref={ref}
          />
        </div>
    </div>
  );
});

export default ToolsPanel;