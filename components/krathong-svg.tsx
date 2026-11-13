"use client";

import { useId } from "react";
import type { KrathongTypeId } from "@/lib/krathong-data";
import { roundTo } from "@/lib/round";

type KrathongSvgProps = {
  type: KrathongTypeId;
  className?: string;
};

type FlowerProps = {
  cx: number;
  cy: number;
  scale?: number;
  rotate?: number;
  petalFill: string;
  petalStroke?: string;
  centerFill: string;
  coreFill?: string;
  petalCount?: number;
  petalRx?: number;
  petalRy?: number;
  petalDistance?: number;
};

function Flower({
  cx,
  cy,
  scale = 1,
  rotate = 0,
  petalFill,
  petalStroke,
  centerFill,
  coreFill = "#fff6cc",
  petalCount = 8,
  petalRx = 6,
  petalRy = 10,
  petalDistance = 9,
}: FlowerProps) {
  const petals = Array.from(
    { length: petalCount },
    (_, index) => (360 / petalCount) * index + rotate,
  );

  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale})`}>
      {petals.map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy={-petalDistance}
          rx={petalRx}
          ry={petalRy}
          fill={petalFill}
          stroke={petalStroke}
          strokeWidth="0.6"
          transform={`rotate(${angle})`}
          opacity="0.96"
        />
      ))}
      <circle r={petalRx * 0.72} fill={centerFill} />
      <circle r={petalRx * 0.32} fill={coreFill} opacity="0.95" />
    </g>
  );
}

function Marigold({
  cx,
  cy,
  scale = 1,
  rotate = 0,
}: {
  cx: number;
  cy: number;
  scale?: number;
  rotate?: number;
}) {
  return (
    <g transform={`translate(${cx} ${cy}) scale(${scale}) rotate(${rotate})`}>
      {Array.from({ length: 9 }, (_, index) => {
        const angle = (index / 9) * Math.PI * 2;
        return (
          <circle
            key={index}
            cx={roundTo(Math.cos(angle) * 7.2)}
            cy={roundTo(Math.sin(angle) * 7.2)}
            r="4.7"
            fill="#f59e0b"
            stroke="#d97706"
            strokeWidth="0.5"
          />
        );
      })}
      <circle r="6.8" fill="#fbbf24" />
      <circle r="4.2" fill="#fcd34d" />
      <circle r="1.9" fill="#b45309" />
    </g>
  );
}

export function KrathongSvg({ type, className }: KrathongSvgProps) {
  const rawId = useId();
  const uid = rawId.replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name: string) => `${uid}-${name}`;
  const fill = (name: string) => `url(#${id(name)})`;

  const pinkPetal = fill("pink-petal");
  const whitePetal = fill("white-petal");
  const goldPetal = fill("gold-petal");
  const purplePetal = fill("purple-petal");

  const useLeafBase = type !== 5;

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <radialGradient id={id("glow")} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#fff3bf" stopOpacity="0.95" />
          <stop offset="42%" stopColor="#ffd166" stopOpacity="0.38" />
          <stop offset="100%" stopColor="#ffb703" stopOpacity="0" />
        </radialGradient>

        <linearGradient id={id("leaf")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#82b95b" />
          <stop offset="55%" stopColor="#43833c" />
          <stop offset="100%" stopColor="#1f4a2b" />
        </linearGradient>

        <linearGradient id={id("leaf-rim")} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#9ccf6d" />
          <stop offset="48%" stopColor="#5f9e46" />
          <stop offset="100%" stopColor="#2c5f33" />
        </linearGradient>

        <linearGradient id={id("bread")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f7d488" />
          <stop offset="48%" stopColor="#e0a93f" />
          <stop offset="100%" stopColor="#a96e1f" />
        </linearGradient>

        <radialGradient id={id("bread-top")} cx="50%" cy="38%" r="66%">
          <stop offset="0%" stopColor="#ffe6a8" />
          <stop offset="62%" stopColor="#eab54b" />
          <stop offset="100%" stopColor="#c1832a" />
        </radialGradient>

        <radialGradient id={id("pink-petal")} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#ffe0ee" />
          <stop offset="55%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#d21f76" />
        </radialGradient>

        <radialGradient id={id("white-petal")} cx="50%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="62%" stopColor="#fdf2f8" />
          <stop offset="100%" stopColor="#f7bcd4" />
        </radialGradient>

        <radialGradient id={id("gold-petal")} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#fffbe0" />
          <stop offset="55%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#d97706" />
        </radialGradient>

        <radialGradient id={id("purple-petal")} cx="50%" cy="32%" r="72%">
          <stop offset="0%" stopColor="#f3e8ff" />
          <stop offset="55%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#6b21a8" />
        </radialGradient>

        <linearGradient id={id("candle")} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#e8d9b0" />
          <stop offset="45%" stopColor="#fff7dd" />
          <stop offset="100%" stopColor="#d8c293" />
        </linearGradient>

        <linearGradient id={id("flame")} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="52%" stopColor="#fbbf24" />
          <stop offset="100%" stopColor="#fff7cc" />
        </linearGradient>

        <linearGradient id={id("lantern")} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fff3bf" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#fbbf24" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#b45309" stopOpacity="0.92" />
        </linearGradient>
      </defs>

      {/* แสงเรืองรอบกระทง */}
      <ellipse
        cx="100"
        cy="118"
        rx="86"
        ry="68"
        fill={fill("glow")}
        opacity="0.4"
        className="flame-aura"
      />

      {/* ธูป 3 ดอก */}
      <g stroke="#a9743e" strokeWidth="2.2" strokeLinecap="round">
        <path d="M84 140 L64 82" />
        <path d="M100 138 L100 74" />
        <path d="M116 140 L136 82" />
      </g>
      <g className="incense-smoke" fill="none" stroke="#e2e8f0" strokeLinecap="round">
        <path d="M64 78 C58 68 70 62 64 52" strokeWidth="1.4" opacity="0.28" />
        <path d="M100 70 C94 58 106 52 100 40" strokeWidth="1.4" opacity="0.24" />
        <path d="M136 78 C130 68 142 62 136 52" strokeWidth="1.4" opacity="0.28" />
      </g>
      <g className="incense-ember">
        <circle cx="64" cy="82" r="3.4" fill="#fb923c" />
        <circle cx="100" cy="74" r="3.6" fill="#fb923c" />
        <circle cx="136" cy="82" r="3.4" fill="#fb923c" />
        <circle cx="64" cy="82" r="1.5" fill="#fff1b8" />
        <circle cx="100" cy="74" r="1.6" fill="#fff1b8" />
        <circle cx="136" cy="82" r="1.5" fill="#fff1b8" />
      </g>

      {/* ฐานกระทง */}
      {useLeafBase ? (
        <g>
          <ellipse cx="100" cy="160" rx="72" ry="15" fill="#04121a" opacity="0.35" />
          <path d="M28 140 Q30 165 100 179 Q170 165 172 140 Z" fill={fill("leaf")} />
          <path
            d="M44 150 Q68 168 96 173"
            fill="none"
            stroke="#2a5c31"
            strokeWidth="1.6"
            opacity="0.55"
          />
          <path
            d="M156 150 Q132 168 104 173"
            fill="none"
            stroke="#2a5c31"
            strokeWidth="1.6"
            opacity="0.55"
          />
          <ellipse cx="100" cy="140" rx="72" ry="24" fill={fill("leaf-rim")} />
          <ellipse cx="100" cy="140" rx="64" ry="18" fill={fill("leaf")} opacity="0.9" />
          <path
            d="M38 140 Q100 164 162 140"
            fill="none"
            stroke="#b6e08b"
            strokeOpacity="0.4"
            strokeWidth="2"
          />
        </g>
      ) : (
        <g>
          <ellipse cx="100" cy="162" rx="72" ry="15" fill="#04121a" opacity="0.35" />
          <ellipse
            cx="100"
            cy="148"
            rx="71"
            ry="31"
            fill={fill("bread")}
            stroke="#b9791f"
            strokeWidth="2"
          />
          <ellipse cx="100" cy="141" rx="59" ry="21" fill={fill("bread-top")} />
          <path
            d="M48 146 Q100 169 152 146"
            fill="none"
            stroke="#c9902f"
            strokeWidth="2"
            opacity="0.65"
          />
          {[
            [68, 140],
            [87, 152],
            [113, 152],
            [132, 140],
            [100, 157],
            [77, 132],
            [123, 132],
          ].map(([sx, sy]) => (
            <ellipse
              key={`${sx}-${sy}`}
              cx={sx}
              cy={sy}
              rx="1.9"
              ry="1.1"
              fill="#fff6d8"
              opacity="0.85"
              transform={`rotate(-18 ${sx} ${sy})`}
            />
          ))}
        </g>
      )}

      {/* โคมแสงทองสำหรับแบบที่ 6 */}
      {type === 6 ? (
        <g>
          <path
            d="M68 142 Q66 104 100 97 Q134 104 132 142 Z"
            fill={fill("lantern")}
            opacity="0.92"
          />
          <path
            d="M68 142 Q66 104 100 97 Q134 104 132 142"
            fill="none"
            stroke="#fde68a"
            strokeWidth="1.8"
            opacity="0.9"
          />
          <path
            d="M100 97 L100 142 M80 101 Q76 122 78 142 M120 101 Q124 122 122 142"
            fill="none"
            stroke="#fef3c7"
            strokeWidth="1.1"
            opacity="0.55"
          />
          <ellipse cx="100" cy="142" rx="31" ry="6" fill="#fbbf24" opacity="0.35" />
        </g>
      ) : null}

      {/* ดอกไม้ประดับ */}
      {type === 1 ? (
        <g>
          <Flower cx={54} cy={146} scale={0.92} petalFill={pinkPetal} centerFill="#f7c948" />
          <Flower cx={78} cy={154} scale={0.84} petalFill={pinkPetal} centerFill="#f7c948" />
          <Flower cx={100} cy={158} scale={0.9} petalFill={pinkPetal} centerFill="#f7c948" />
          <Flower cx={122} cy={154} scale={0.84} petalFill={pinkPetal} centerFill="#f7c948" />
          <Flower cx={146} cy={146} scale={0.92} petalFill={pinkPetal} centerFill="#f7c948" />
        </g>
      ) : null}

      {type === 2 ? (
        <g>
          <Flower
            cx={54}
            cy={146}
            scale={0.92}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Flower
            cx={78}
            cy={154}
            scale={0.84}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Flower
            cx={100}
            cy={158}
            scale={0.9}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Flower
            cx={122}
            cy={154}
            scale={0.84}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Flower
            cx={146}
            cy={146}
            scale={0.92}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
        </g>
      ) : null}

      {type === 3 ? (
        <g>
          <Marigold cx={54} cy={146} scale={0.95} rotate={12} />
          <Marigold cx={78} cy={155} scale={0.9} rotate={-8} />
          <Marigold cx={100} cy={159} scale={0.98} rotate={20} />
          <Marigold cx={122} cy={155} scale={0.9} rotate={8} />
          <Marigold cx={146} cy={146} scale={0.95} rotate={-14} />
        </g>
      ) : null}

      {type === 4 ? (
        <g>
          <Flower
            cx={54}
            cy={146}
            scale={0.95}
            petalCount={5}
            petalRx={5.4}
            petalRy={11.5}
            petalDistance={10.5}
            petalFill={purplePetal}
            centerFill="#f5e9ff"
            coreFill="#fff7cc"
          />
          <Flower
            cx={78}
            cy={155}
            scale={0.86}
            petalCount={5}
            petalRx={5.4}
            petalRy={11.5}
            petalDistance={10.5}
            petalFill={purplePetal}
            centerFill="#f5e9ff"
            coreFill="#fff7cc"
          />
          <Flower
            cx={100}
            cy={159}
            scale={0.92}
            petalCount={5}
            petalRx={5.4}
            petalRy={11.5}
            petalDistance={10.5}
            petalFill={purplePetal}
            centerFill="#f5e9ff"
            coreFill="#fff7cc"
          />
          <Flower
            cx={122}
            cy={155}
            scale={0.86}
            petalCount={5}
            petalRx={5.4}
            petalRy={11.5}
            petalDistance={10.5}
            petalFill={purplePetal}
            centerFill="#f5e9ff"
            coreFill="#fff7cc"
          />
          <Flower
            cx={146}
            cy={146}
            scale={0.95}
            petalCount={5}
            petalRx={5.4}
            petalRy={11.5}
            petalDistance={10.5}
            petalFill={purplePetal}
            centerFill="#f5e9ff"
            coreFill="#fff7cc"
          />
        </g>
      ) : null}

      {type === 5 ? (
        <g>
          <Flower
            cx={58}
            cy={140}
            scale={0.8}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Flower
            cx={84}
            cy={148}
            scale={0.72}
            petalFill={pinkPetal}
            centerFill="#fbbf24"
          />
          <Flower
            cx={116}
            cy={148}
            scale={0.72}
            petalFill={pinkPetal}
            centerFill="#fbbf24"
          />
          <Flower
            cx={142}
            cy={140}
            scale={0.8}
            petalCount={9}
            petalFill={whitePetal}
            petalStroke="#f9a8d4"
            centerFill="#fbbf24"
          />
          <Marigold cx={100} cy={156} scale={0.72} />
        </g>
      ) : null}

      {type === 6 ? (
        <g>
          <Flower
            cx={56}
            cy={146}
            scale={0.8}
            petalCount={8}
            petalFill={goldPetal}
            centerFill="#fff7d6"
            coreFill="#f59e0b"
          />
          <Flower
            cx={78}
            cy={154}
            scale={0.7}
            petalCount={8}
            petalFill={goldPetal}
            centerFill="#fff7d6"
            coreFill="#f59e0b"
          />
          <Flower
            cx={122}
            cy={154}
            scale={0.7}
            petalCount={8}
            petalFill={goldPetal}
            centerFill="#fff7d6"
            coreFill="#f59e0b"
          />
          <Flower
            cx={144}
            cy={146}
            scale={0.8}
            petalCount={8}
            petalFill={goldPetal}
            centerFill="#fff7d6"
            coreFill="#f59e0b"
          />
        </g>
      ) : null}

      {/* เทียนกลางกระทง + เปลวไฟกะพริบ */}
      <g>
        <ellipse cx="100" cy="138" rx="14" ry="4" fill="#0b2530" opacity="0.45" />
        <rect
          x="92"
          y="112"
          width="16"
          height="26"
          rx="4"
          fill={fill("candle")}
          stroke="#e8d9b0"
          strokeWidth="0.8"
        />
        <path
          d="M95 112 Q100 107 105 112"
          fill="none"
          stroke="#fff7dd"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <line
          x1="100"
          y1="112"
          x2="100"
          y2="105"
          stroke="#3f2b18"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle
          cx="100"
          cy="100"
          r="27"
          fill={fill("glow")}
          opacity="0.95"
          className="candle-glow"
        />
        <g className="krathong-flame">
          <path
            d="M100 84 C109 94 112 102 100 115 C88 102 91 94 100 84 Z"
            fill={fill("flame")}
          />
          <path
            d="M100 93 C104 98 105 103 100 110 C95 103 96 98 100 93 Z"
            fill="#fff9d6"
          />
        </g>
      </g>
    </svg>
  );
}
