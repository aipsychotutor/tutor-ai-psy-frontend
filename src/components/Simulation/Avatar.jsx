import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { button, useControls } from "leva";
import React, { useEffect, useRef, useState } from "react";

import * as THREE from "three";
import { useChat } from "../../hooks/useChat";

const facialExpressions = {
  default: {},
  smile: {
    browInnerUp: 0.17,
    eyeSquintLeft: 0.4,
    eyeSquintRight: 0.44,
    noseSneerLeft: 0.1700000727403593,
    noseSneerRight: 0.14000002836874015,
    mouthPressLeft: 0.61,
    mouthPressRight: 0.41000000000000003,
  },
  funnyFace: {
    jawLeft: 0.63,
    mouthPucker: 0.53,
    noseSneerLeft: 1,
    noseSneerRight: 0.39,
    mouthLeft: 1,
    eyeLookUpLeft: 1,
    eyeLookUpRight: 1,
    cheekPuff: 0.9999924982764238,
    mouthDimpleLeft: 0.414743888682652,
    mouthRollLower: 0.32,
    mouthSmileLeft: 0.35499733688813034,
    mouthSmileRight: 0.35499733688813034,
  },
  sad: {
    mouthFrownLeft: 1,
    mouthFrownRight: 1,
    mouthShrugLower: 0.78341,
    browInnerUp: 0.452,
    eyeSquintLeft: 0.72,
    eyeSquintRight: 0.75,
    eyeLookDownLeft: 0.5,
    eyeLookDownRight: 0.5,
    jawForward: 1,
  },
  surprised: {
    eyeWideLeft: 0.5,
    eyeWideRight: 0.5,
    jawOpen: 0.351,
    mouthFunnel: 1,
    browInnerUp: 1,
  },
  angry: {
    browDownLeft: 1,
    browDownRight: 1,
    eyeSquintLeft: 1,
    eyeSquintRight: 1,
    jawForward: 1,
    jawLeft: 1,
    mouthShrugLower: 1,
    noseSneerLeft: 1,
    noseSneerRight: 0.42,
    eyeLookDownLeft: 0.16,
    eyeLookDownRight: 0.16,
    cheekSquintLeft: 1,
    cheekSquintRight: 1,
    mouthClose: 0.23,
    mouthFunnel: 0.63,
    mouthDimpleRight: 1,
  },
  crazy: {
    browInnerUp: 0.9,
    jawForward: 1,
    noseSneerLeft: 0.5700000000000001,
    noseSneerRight: 0.51,
    eyeLookDownLeft: 0.39435766259644545,
    eyeLookUpRight: 0.4039761421719682,
    eyeLookInLeft: 0.9618479575523053,
    eyeLookInRight: 0.9618479575523053,
    jawOpen: 0.9618479575523053,
    mouthDimpleLeft: 0.9618479575523053,
    mouthDimpleRight: 0.9618479575523053,
    mouthStretchLeft: 0.27893590769016857,
    mouthStretchRight: 0.2885543872656917,
    mouthSmileLeft: 0.5578718153803371,
    mouthSmileRight: 0.38473918302092225,
    tongueOut: 0.9618479575523053,
  },
};

const corresponding = {
  A: "viseme_PP",
  B: "viseme_kk",
  C: "viseme_I",
  D: "viseme_AA",
  E: "viseme_O",
  F: "viseme_U",
  G: "viseme_FF",
  H: "viseme_TH",
  X: "viseme_PP",
};

let setupMode = false;

export function Avatar({ avatarPath = "", props }) {
  const { nodes, materials, scene } = useGLTF(avatarPath);
  const { animations } = useGLTF("/models/animations.glb");
  const { message, onMessagePlayed, chat } = useChat();

  // Sanitize animation tracks to remove non-existent "Armature.*" tracks (cleans console warnings)
  const sanitizedAnimations = React.useMemo(() => {
    if (!animations) return [];
    return animations.map((clip) => {
      const clonedClip = clip.clone();
      clonedClip.tracks = clonedClip.tracks.filter(
        (track) => !track.name.startsWith("Armature.")
      );
      return clonedClip;
    });
  }, [animations]);

  const group = useRef();
  const { actions, mixer } = useAnimations(sanitizedAnimations, group);
  const [animation, setAnimation] = useState(
    animations?.find((a) => a.name === "Idle") ? "Idle" : animations?.[0]?.name || "Idle"
  );

  const [lipsync, setLipsync] = useState();
  const [blink, setBlink] = useState(false);
  const [winkLeft, setWinkLeft] = useState(false);
  const [winkRight, setWinkRight] = useState(false);
  const [facialExpression, setFacialExpression] = useState("");
  const [audio, setAudio] = useState();

  useEffect(() => {
    if (!actions || !actions[animation]) return;

    actions[animation]
      .reset()
      .fadeIn(mixer?.stats?.actions?.inUse === 0 ? 0 : 0.5)
      .play();

    return () => {
      actions[animation]?.fadeOut(0.5);
    };
  }, [animation, actions]);

  useEffect(() => {
    if (!message) {
      setAnimation("Idle");
      return;
    }
    if (actions && actions[message.animation]) {
      setAnimation(message.animation);
    } else {
      setAnimation("Idle");
    }
    setFacialExpression(message.facialExpression);
    setLipsync(message.lipsync);

    let activeAudio = null;
    let fallbackTimeout = null;

    if (message.audio) {
      activeAudio = new Audio("data:audio/mp3;base64," + message.audio);
      activeAudio.play().catch((err) => {
        console.error("Audio play error:", err);
        onMessagePlayed();
      });
      setAudio(activeAudio);
      activeAudio.onended = onMessagePlayed;
    } else {
      setAudio(null);
      fallbackTimeout = setTimeout(() => {
        onMessagePlayed();
      }, (message.text?.length || 20) * 60);
    }

    return () => {
      if (activeAudio) {
        activeAudio.pause();
      }
      if (fallbackTimeout) {
        clearTimeout(fallbackTimeout);
      }
    };
  }, [message, actions]);

  const lerpMorphTarget = (target, value, speed = 0.1) => {
    scene.traverse((child) => {
      if (child.isSkinnedMesh && child.morphTargetDictionary) {
        const index = child.morphTargetDictionary[target];
        if (
          index === undefined ||
          child.morphTargetInfluences[index] === undefined
        ) {
          return;
        }
        child.morphTargetInfluences[index] = THREE.MathUtils.lerp(
          child.morphTargetInfluences[index],
          value,
          speed
        );

        if (setupMode) {
          try {
            set({
              [target]: value,
            });
          } catch (e) {}
        }
      }
    });
  };

  useFrame((state) => {
    if (!setupMode && nodes.EyeLeft?.morphTargetDictionary) {
      Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(key, 0, 0.1);
        }
      });
    }

    lerpMorphTarget("eyeBlinkLeft", blink || winkLeft ? 1 : 0, 0.5);
    lerpMorphTarget("eyeBlinkRight", blink || winkRight ? 1 : 0, 0.5);

    // NATURAL CO-SPEECH HEAD GESTURES
    if (nodes.Head && !setupMode) {
      const isSpeaking = audio && !audio.paused && !audio.ended && audio.currentTime > 0;
      const t = state.clock.elapsedTime;
      if (isSpeaking) {
        // Natural conversational micro-nodding and subtle expressive tilt
        const nod = Math.sin(t * 3.2) * 0.035 + Math.sin(t * 1.6) * 0.015;
        const tilt = Math.cos(t * 2.1) * 0.025;
        const yaw = Math.sin(t * 1.2) * 0.02;

        nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, nod, 0.08);
        nodes.Head.rotation.z = THREE.MathUtils.lerp(nodes.Head.rotation.z, tilt, 0.08);
        nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, yaw, 0.08);
      } else {
        nodes.Head.rotation.x = THREE.MathUtils.lerp(nodes.Head.rotation.x, 0, 0.05);
        nodes.Head.rotation.z = THREE.MathUtils.lerp(nodes.Head.rotation.z, 0, 0.05);
        nodes.Head.rotation.y = THREE.MathUtils.lerp(nodes.Head.rotation.y, 0, 0.05);
      }
    }

    // LIPSYNC WITH DYNAMIC JAW COUPLING
    if (setupMode) {
      return;
    }

    const appliedMorphTargets = [];
    let targetJawOpen = 0;

    const jawOpenMapping = {
      D: 0.38, // viseme_AA (wide open)
      E: 0.28, // viseme_O (rounded open)
      C: 0.20, // viseme_I (smile open)
      F: 0.18, // viseme_U (pucker)
      B: 0.15, // viseme_kk
      G: 0.12, // viseme_FF
      H: 0.14, // viseme_TH
      A: 0.05, // viseme_PP (lips closed)
      X: 0.0,
    };

    if (message && lipsync && audio) {
      const currentAudioTime = audio.currentTime;
      for (let i = 0; i < lipsync.mouthCues.length; i++) {
        const mouthCue = lipsync.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          const targetViseme = corresponding[mouthCue.value];
          if (targetViseme && mouthCue.value !== "X") {
            appliedMorphTargets.push(targetViseme);
            lerpMorphTarget(targetViseme, 1, 0.45);
          }
          targetJawOpen = jawOpenMapping[mouthCue.value] || 0;
          break;
        }
      }
    }

    // Blend jawOpen naturally with visemes
    lerpMorphTarget("jawOpen", targetJawOpen, 0.35);

    // Smoothly release non-active visemes
    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(value, 0, 0.22);
    });
  });

  useControls("FacialExpressions", {
    chat: button(() => chat()),
    winkLeft: button(() => {
      setWinkLeft(true);
      setTimeout(() => setWinkLeft(false), 300);
    }),
    winkRight: button(() => {
      setWinkRight(true);
      setTimeout(() => setWinkRight(false), 300);
    }),
    animation: {
      value: animation,
      options: animations.map((a) => a.name),
      onChange: (value) => setAnimation(value),
    },
    facialExpression: {
      options: Object.keys(facialExpressions),
      onChange: (value) => setFacialExpression(value),
    },
    enableSetupMode: button(() => {
      setupMode = true;
    }),
    disableSetupMode: button(() => {
      setupMode = false;
    }),
    logMorphTargetValues: button(() => {
      const emotionValues = {};
      if (nodes?.EyeLeft?.morphTargetDictionary && nodes?.EyeLeft?.morphTargetInfluences) {
        Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
          if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
            return; // eyes wink/blink are handled separately
          }
          const value =
            nodes.EyeLeft.morphTargetInfluences[
              nodes.EyeLeft.morphTargetDictionary[key]
            ];
          if (value > 0.01) {
            emotionValues[key] = value;
          }
        });
      }
      console.log(JSON.stringify(emotionValues, null, 2));
    }),
  });

  const [, set] = useControls("MorphTarget", () => {
    if (!nodes?.EyeLeft?.morphTargetDictionary) return {};
    return Object.assign(
      {},
      ...Object.keys(nodes.EyeLeft.morphTargetDictionary).map((key) => {
        return {
          [key]: {
            label: key,
            value: 0,
            min:
              nodes.EyeLeft.morphTargetInfluences?.[
                nodes.EyeLeft.morphTargetDictionary[key]
              ] || 0,
            max: 1,
            onChange: (val) => {
              if (setupMode) {
                lerpMorphTarget(key, val, 1);
              }
            },
          },
        };
      })
    );
  });

  useEffect(() => {
    let blinkTimeout;
    const nextBlink = () => {
      blinkTimeout = setTimeout(() => {
        setBlink(true);
        setTimeout(() => {
          setBlink(false);
          nextBlink();
        }, 200);
      }, THREE.MathUtils.randInt(1000, 5000));
    };
    nextBlink();
    return () => clearTimeout(blinkTimeout);
  }, []);

  return (
    <group {...props} dispose={null} ref={group}>
      {nodes.Hips && <primitive object={nodes.Hips} />}
      {nodes.Wolf3D_Body && (
        <skinnedMesh
          name="Wolf3D_Body"
          geometry={nodes.Wolf3D_Body.geometry}
          material={materials.Wolf3D_Body}
          skeleton={nodes.Wolf3D_Body.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Bottom && (
        <skinnedMesh
          name="Wolf3D_Outfit_Bottom"
          geometry={nodes.Wolf3D_Outfit_Bottom.geometry}
          material={materials.Wolf3D_Outfit_Bottom}
          skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Footwear && (
        <skinnedMesh
          name="Wolf3D_Outfit_Footwear"
          geometry={nodes.Wolf3D_Outfit_Footwear.geometry}
          material={materials.Wolf3D_Outfit_Footwear}
          skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton}
        />
      )}
      {nodes.Wolf3D_Outfit_Top && (
        <skinnedMesh
          name="Wolf3D_Outfit_Top"
          geometry={nodes.Wolf3D_Outfit_Top.geometry}
          material={materials.Wolf3D_Outfit_Top}
          skeleton={nodes.Wolf3D_Outfit_Top.skeleton}
        />
      )}
      {nodes.Wolf3D_Hair && (
        <skinnedMesh
          name="Wolf3D_Hair"
          geometry={nodes.Wolf3D_Hair.geometry}
          material={materials.Wolf3D_Hair}
          skeleton={nodes.Wolf3D_Hair.skeleton}
        />
      )}
      {nodes.EyeLeft && (
        <skinnedMesh
          name="EyeLeft"
          geometry={nodes.EyeLeft.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeLeft.skeleton}
          morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences}
        />
      )}
      {nodes.EyeRight && (
        <skinnedMesh
          name="EyeRight"
          geometry={nodes.EyeRight.geometry}
          material={materials.Wolf3D_Eye}
          skeleton={nodes.EyeRight.skeleton}
          morphTargetDictionary={nodes.EyeRight.morphTargetDictionary}
          morphTargetInfluences={nodes.EyeRight.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Head && (
        <skinnedMesh
          name="Wolf3D_Head"
          geometry={nodes.Wolf3D_Head.geometry}
          material={materials.Wolf3D_Skin}
          skeleton={nodes.Wolf3D_Head.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences}
        />
      )}
      {nodes.Wolf3D_Teeth && (
        <skinnedMesh
          name="Wolf3D_Teeth"
          geometry={nodes.Wolf3D_Teeth.geometry}
          material={materials.Wolf3D_Teeth}
          skeleton={nodes.Wolf3D_Teeth.skeleton}
          morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary}
          morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences}
        />
      )}
    </group>
  );
}

useGLTF.preload("/models/default.glb");
useGLTF.preload("/models/animations.glb");
