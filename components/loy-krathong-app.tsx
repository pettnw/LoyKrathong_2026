"use client";

import { useRef, useState } from "react";
import { HomeScene } from "@/components/home-scene";
import { KrathongPicker } from "@/components/krathong-picker";
import { NightSky } from "@/components/night-sky";
import { RiverScene } from "@/components/river-scene";
import {
  validateName,
  validateWish,
  type KrathongTypeId,
} from "@/lib/krathong-data";

type SceneState = {
  key: number;
  name: string;
  wish: string;
  type: KrathongTypeId;
};

type View = "home" | "form" | "scene";

export function LoyKrathongApp() {
  const [view, setView] = useState<View>("home");
  const [name, setName] = useState("");
  const [wish, setWish] = useState("");
  const [selectedType, setSelectedType] = useState<KrathongTypeId | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const [scene, setScene] = useState<SceneState | null>(null);
  const [ownKrathongId, setOwnKrathongId] = useState<string | null>(null);
  const activeSceneKey = useRef(0);

  const handleNameChange = (value: string) => {
    setName(value);
    if (error) setError(null);
  };

  const handleWishChange = (value: string) => {
    setWish(value);
    if (error) setError(null);
  };

  const handleSelectType = (type: KrathongTypeId) => {
    setSelectedType(type);
    if (error) setError(null);
  };

  const handleLaunch = () => {
    const nameValidation = validateName(name);

    if (!nameValidation.ok) {
      setError(nameValidation.message);
      return;
    }

    const wishValidation = validateWish(wish);

    if (!wishValidation.ok) {
      setError(wishValidation.message);
      return;
    }

    if (selectedType === null) {
      setError("กรุณาเลือกกระทง 1 แบบก่อนลอยกระทง");
      return;
    }

    const sceneKey = Date.now();
    activeSceneKey.current = sceneKey;
    setError(null);
    setName(nameValidation.name);
    setWish(wishValidation.wish);
    setOwnKrathongId(null);
    setScene({
      key: sceneKey,
      name: nameValidation.name,
      wish: wishValidation.wish,
      type: selectedType,
    });
    setView("scene");

    // บันทึกลง MongoDB แบบไม่บล็อกอนิเมชั่น
    void fetch("/LoyKrathong/api/krathong", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameValidation.name,
        wish: wishValidation.wish,
        krathongType: selectedType,
      }),
    })
      .then(async (response) => {
        if (!response.ok) return null;
        const data: unknown = await response.json();
        if (typeof data !== "object" || data === null) return null;
        const id = (data as { id?: unknown }).id;
        return typeof id === "string" ? id : null;
      })
      .then((id) => {
        if (id && activeSceneKey.current === sceneKey) {
          setOwnKrathongId(id);
        }
      })
      .catch(() => {
        // ต่อ DB ไม่ได้ก็ยังลอยกระทงได้
      });
  };

  if (view === "scene" && scene) {
    return (
      <RiverScene
        key={scene.key}
        name={scene.name}
        wish={scene.wish}
        type={scene.type}
        ownKrathongId={ownKrathongId}
      />
    );
  }

  if (view === "form") {
    return (
      <div className="relative min-h-dvh overflow-hidden bg-[#050818] text-slate-100">
        <NightSky />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-[radial-gradient(ellipse_at_50%_100%,rgba(69,97,220,0.2),transparent_70%)]" />
        <KrathongPicker
          name={name}
          onNameChange={handleNameChange}
          wish={wish}
          onWishChange={handleWishChange}
          selectedType={selectedType}
          onSelectType={handleSelectType}
          onSubmit={handleLaunch}
          error={error}
        />
      </div>
    );
  }

  return <HomeScene onStart={() => setView("form")} />;
}
