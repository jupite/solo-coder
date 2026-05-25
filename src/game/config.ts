export type ObjectKind =
  | "flower"
  | "bush"
  | "tree"
  | "pedestrian"
  | "trash"
  | "car"
  | "bigTree"
  | "lamp"
  | "truck"
  | "house"
  | "skyscraper";

export interface ObjectConfig {
  kind: ObjectKind;
  name: string;
  volume: number;
  minLevel: number;
  radius: number;
  height: number;
  color: string;
  accent: string;
  count: number;
  emoji: string;
}

export const OBJECT_CONFIGS: ObjectConfig[] = [
  {
    kind: "flower",
    name: "花草",
    volume: 1,
    minLevel: 1,
    radius: 0.3,
    height: 0.35,
    color: "#7ed957",
    accent: "#ff6fb5",
    count: 60,
    emoji: "🌿",
  },
  {
    kind: "bush",
    name: "灌木",
    volume: 5,
    minLevel: 2,
    radius: 0.6,
    height: 0.9,
    color: "#2f9e44",
    accent: "#155724",
    count: 30,
    emoji: "🌳",
  },
  {
    kind: "tree",
    name: "小树",
    volume: 3,
    minLevel: 1,
    radius: 0.5,
    height: 2.2,
    color: "#2f9e44",
    accent: "#6b3f1d",
    count: 30,
    emoji: "🌲",
  },
  {
    kind: "pedestrian",
    name: "行人",
    volume: 4,
    minLevel: 2,
    radius: 0.35,
    height: 1.6,
    color: "#ffd166",
    accent: "#ef476f",
    count: 24,
    emoji: "🚶",
  },
  {
    kind: "trash",
    name: "垃圾桶",
    volume: 8,
    minLevel: 3,
    radius: 0.5,
    height: 1.2,
    color: "#4a4e69",
    accent: "#9a8c98",
    count: 14,
    emoji: "🗑️",
  },
  {
    kind: "car",
    name: "小汽车",
    volume: 15,
    minLevel: 3,
    radius: 1.0,
    height: 1.3,
    color: "#ef233c",
    accent: "#111111",
    count: 18,
    emoji: "🚗",
  },
  {
    kind: "bigTree",
    name: "大树",
    volume: 25,
    minLevel: 4,
    radius: 1.2,
    height: 4.5,
    color: "#1b5e20",
    accent: "#5d4037",
    count: 10,
    emoji: "🌳",
  },
  {
    kind: "lamp",
    name: "路灯",
    volume: 30,
    minLevel: 4,
    radius: 0.5,
    height: 5.5,
    color: "#222831",
    accent: "#ffd369",
    count: 10,
    emoji: "💡",
  },
  {
    kind: "truck",
    name: "货车",
    volume: 60,
    minLevel: 5,
    radius: 1.6,
    height: 2.4,
    color: "#f8961e",
    accent: "#277da1",
    count: 8,
    emoji: "🚚",
  },
  {
    kind: "house",
    name: "小屋",
    volume: 120,
    minLevel: 6,
    radius: 2.2,
    height: 3.5,
    color: "#f4a261",
    accent: "#6a4c93",
    count: 6,
    emoji: "🏠",
  },
  {
    kind: "skyscraper",
    name: "高楼",
    volume: 300,
    minLevel: 7,
    radius: 3.0,
    height: 9,
    color: "#4361ee",
    accent: "#e0aaff",
    count: 4,
    emoji: "🏢",
  },
];

export const MAP_RADIUS = 70;

export function randomPosition(
  minR: number,
  maxR: number
): [number, number] {
  const r = Math.sqrt(Math.random()) * (maxR - minR) + minR;
  const a = Math.random() * Math.PI * 2;
  return [Math.cos(a) * r, Math.sin(a) * r];
}
