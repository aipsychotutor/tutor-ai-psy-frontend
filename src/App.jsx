import { Loader } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Leva } from "leva";
import { Experience } from "./components/Experience";
import { UI } from "./components/UI";
import { ChatHistory } from "./components/ChatHistory";
import { ChatProvider } from "./hooks/useChat";
import Dashboard from "./page/Dashboard";
import Home from "./page/Home";
import { Routes, Route } from "react-router-dom";


function App() {
  return (
    <>
      <ChatProvider>
        <Loader />
        <Leva hidden />
        <UI />
        <ChatHistory />
        <Canvas shadows camera={{ position: [0, 0, 1], fov: 30 }}>
          <Experience />
        </Canvas>
      </ChatProvider>
    </>
  );
}

export default App;
