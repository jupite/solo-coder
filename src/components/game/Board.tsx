import { CellType, Position } from '@/lib/game/types';

interface BoardProps {
  grid: CellType[][];
}

function cellCenter(col: number, row: number): [number, number, number] {
  return [col, 0, row];
}

function FloorTile({ col, row }: { col: number; row: number }) {
  return (
    <mesh position={cellCenter(col, row)} receiveShadow>
      <boxGeometry args={[0.92, 0.08, 0.92]} />
      <meshStandardMaterial
        color="#1e3a5f"
        metalness={0.2}
        roughness={0.8}
        emissive="#0b1f3a"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function TargetTile({ col, row }: { col: number; row: number }) {
  return (
    <group position={cellCenter(col, row)}>
      <mesh receiveShadow>
        <boxGeometry args={[0.92, 0.08, 0.92]} />
        <meshStandardMaterial
          color="#3a2a0a"
          metalness={0.3}
          roughness={0.6}
        />
      </mesh>
      <mesh position={[0, 0.06, 0]}>
        <boxGeometry args={[0.7, 0.06, 0.7]} />
        <meshStandardMaterial
          color="#fbbf24"
          emissive="#f59e0b"
          emissiveIntensity={0.8}
          metalness={0.5}
          roughness={0.3}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}

export function Board({ grid }: BoardProps) {
  const tiles: JSX.Element[] = [];

  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      const cell = grid[row][col];
      if (cell === CellType.WALL) continue;

      const key = `${row}-${col}`;
      if (
        cell === CellType.TARGET ||
        cell === CellType.BOX_ON_TARGET ||
        cell === CellType.PLAYER_ON_TARGET
      ) {
        tiles.push(<TargetTile key={key} col={col} row={row} />);
      } else {
        tiles.push(<FloorTile key={key} col={col} row={row} />);
      }
    }
  }

  return <>{tiles}</>;
}
