import React from "react";

/**
 * ChatBar Component
 *
 * Renders the bottom interface for communication, including:
 * 1. Text Input field.
 * 2. Send Button.
 * 3. Microphone Button (Speech-to-Text).
 * 4. Subtitles display area.
 * 5. Audio error display area.
 *
 * @component
 * @param {object} props - Component props.
 * @param {string} props.message - Current text in the input field.
 * @param {function} props.setMessage - State setter for input text.
 * @param {function} props.sendMessage - Function to trigger sending the message.
 * @param {boolean} props.loading - Indicates if the system is processing a response.
 * @param {boolean} props.isSending - Indicates if a message is currently being sent.
 * @param {boolean} props.listening - Indicates if the microphone is active.
 * @param {function} props.handleToggleListening - Function to toggle speech recognition.
 * @param {function} props.resetTranscript - Function to clear speech recognition transcript.
 * @param {string} [props.subtitle] - Current subtitle text from the AI agent.
 * @param {string} [props.prosodyError] - Error message related to audio analysis.
 * @param {React.RefObject} props.inputRef - Ref for the text input element.
 */
const ChatBar = ({
  message,
  setMessage,
  sendMessage,
  loading,
  isSending,
  listening,
  handleToggleListening,
  resetTranscript,
  subtitle,
  prosodyError,
  inputRef,
}) => {
  return (
    <div className="absolute bottom-8 left-0 w-full flex flex-col items-center">
      {/* Subtitle Display */}
      {subtitle && (
        <div className="mb-2 px-4 py-2 bg-black bg-opacity-70 text-white rounded text-center max-w-xl backdrop-blur-sm">
          {subtitle}
        </div>
      )}

      {/* Prosody Error Display */}
      {prosodyError && (
        <div className="mb-2 px-4 py-2 bg-red-800 bg-opacity-70 text-white rounded text-center max-w-xl backdrop-blur-sm">
          Audio Error: {prosodyError}
        </div>
      )}

      {/* Input Container */}
      <div className="flex w-full max-w-2xl gap-2 justify-center pointer-events-auto px-4">
        <div className="flex items-center w-full max-w-3xl bg-white bg-opacity-90 backdrop-blur-md rounded-full shadow-2xl border border-gray-200 p-1.5 gap-1 transition-all">
          {/* Send Button */}
          <button
            disabled={loading || isSending || !message}
            onClick={sendMessage}
            className={`p-3 rounded-full shrink-0 transition-all duration-200 flex items-center justify-center ${
              loading || isSending || !message
                ? "text-gray-400 cursor-not-allowed bg-transparent"
                : "bg-yellow-500 text-white hover:bg-yellow-600 shadow-md hover:scale-105"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
            </svg>
          </button>

          {/* Text Input Field */}
          <input
            className="flex-1 min-w-0 bg-transparent text-gray-800 placeholder:text-gray-500 placeholder:italic px-3 py-3 outline-none text-sm md:text-base"
            placeholder="Ketik pesan atau bicara..."
            ref={inputRef}
            value={typeof message === "string" ? message : ""}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                sendMessage();
              }
            }}
          />

          <div className="flex items-center gap-1 shrink-0">
            {/* Microphone Button */}
            <button
              disabled={loading}
              onClick={handleToggleListening}
              title={listening ? "Berhenti mendengarkan" : "Mulai bicara"}
              className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                loading
                  ? "bg-gray-100 text-gray-300 cursor-not-allowed"
                  : listening
                  ? "bg-red-500 text-white hover:bg-red-600 animate-pulse shadow-md"
                  : "bg-blue-500 text-white hover:bg-blue-600 shadow-md hover:scale-105"
              }`}
            >
              {listening ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                  <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                  <path
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                    d="M4 4l16 16"
                    className="opacity-80"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M8.25 4.5a3.75 3.75 0 1 1 7.5 0v8.25a3.75 3.75 0 1 1-7.5 0V4.5Z" />
                  <path d="M6 10.5a.75.75 0 0 1 .75.75v1.5a5.25 5.25 0 1 0 10.5 0v-1.5a.75.75 0 0 1 1.5 0v1.5a6.751 6.751 0 0 1-6 6.709v2.291h3a.75.75 0 0 1 0 1.5h-7.5a.75.75 0 0 1 0-1.5h3v-2.291a6.751 6.751 0 0 1-6-6.709v-1.5A.75.75 0 0 1 6 10.5Z" />
                </svg>
              )}
            </button>

            {/* Reset Input Button */}
            <button
              disabled={loading || !message}
              onClick={resetTranscript}
              className={`p-3 rounded-full transition-all duration-200 flex items-center justify-center ${
                loading || !message
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-500 hover:bg-gray-100 hover:text-red-500"
              }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5"
              >
                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatBar;