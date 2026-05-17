export function calculateOverlap(topBlock, bottomBlock) {
  const topMinX = topBlock.position.x - topBlock.size.x / 2;
  const topMaxX = topBlock.position.x + topBlock.size.x / 2;
  const bottomMinX = bottomBlock.position.x - bottomBlock.size.x / 2;
  const bottomMaxX = bottomBlock.position.x + bottomBlock.size.x / 2;

  const topMinZ = topBlock.position.z - topBlock.size.z / 2;
  const topMaxZ = topBlock.position.z + topBlock.size.z / 2;
  const bottomMinZ = bottomBlock.position.z - bottomBlock.size.z / 2;
  const bottomMaxZ = bottomBlock.position.z + bottomBlock.size.z / 2;

  const overlapMinX = Math.max(topMinX, bottomMinX);
  const overlapMaxX = Math.min(topMaxX, bottomMaxX);
  const overlapX = Math.max(0, overlapMaxX - overlapMinX);

  const overlapMinZ = Math.max(topMinZ, bottomMinZ);
  const overlapMaxZ = Math.min(topMaxZ, bottomMaxZ);
  const overlapZ = Math.max(0, overlapMaxZ - overlapMinZ);

  const newCenterX = (overlapMinX + overlapMaxX) / 2;
  const newCenterZ = (overlapMinZ + overlapMaxZ) / 2;

  const cutParts = [];

  if (overlapX === 0 || overlapZ === 0) {
    return {
      hasOverlap: false,
      newSize: null,
      newPosition: null,
      cutParts: []
    };
  }

  if (overlapX < topBlock.size.x) {
    if (topMinX < bottomMinX) {
      const cutSizeX = bottomMinX - topMinX;
      cutParts.push({
        position: {
          x: topMinX + cutSizeX / 2,
          y: topBlock.position.y,
          z: topBlock.position.z
        },
        size: {
          x: cutSizeX,
          y: topBlock.size.y,
          z: topBlock.size.z
        }
      });
    }
    if (topMaxX > bottomMaxX) {
      const cutSizeX = topMaxX - bottomMaxX;
      cutParts.push({
        position: {
          x: bottomMaxX + cutSizeX / 2,
          y: topBlock.position.y,
          z: topBlock.position.z
        },
        size: {
          x: cutSizeX,
          y: topBlock.size.y,
          z: topBlock.size.z
        }
      });
    }
  }

  if (overlapZ < topBlock.size.z) {
    if (topMinZ < bottomMinZ) {
      const cutSizeZ = bottomMinZ - topMinZ;
      cutParts.push({
        position: {
          x: newCenterX,
          y: topBlock.position.y,
          z: topMinZ + cutSizeZ / 2
        },
        size: {
          x: overlapX,
          y: topBlock.size.y,
          z: cutSizeZ
        }
      });
    }
    if (topMaxZ > bottomMaxZ) {
      const cutSizeZ = topMaxZ - bottomMaxZ;
      cutParts.push({
        position: {
          x: newCenterX,
          y: topBlock.position.y,
          z: bottomMaxZ + cutSizeZ / 2
        },
        size: {
          x: overlapX,
          y: topBlock.size.y,
          z: cutSizeZ
        }
      });
    }
  }

  return {
    hasOverlap: true,
    newSize: {
      x: overlapX,
      y: topBlock.size.y,
      z: overlapZ
    },
    newPosition: {
      x: newCenterX,
      y: topBlock.position.y,
      z: newCenterZ
    },
    cutParts
  };
}

export function checkPerfectStack(topBlock, bottomBlock, tolerance = 0.1) {
  const dx = Math.abs(topBlock.position.x - bottomBlock.position.x);
  const dz = Math.abs(topBlock.position.z - bottomBlock.position.z);
  const sx = Math.abs(topBlock.size.x - bottomBlock.size.x);
  const sz = Math.abs(topBlock.size.z - bottomBlock.size.z);

  return dx < tolerance && dz < tolerance && sx < tolerance && sz < tolerance;
}
