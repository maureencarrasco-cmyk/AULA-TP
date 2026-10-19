export function nextQuiz(questions, answers = {}) {
  return questions.findIndex((_, index) => !Object.hasOwn(answers, String(index)));
}

export function terminalPosition(index) {
  return {x: index % 2 ? 4.2 : -4.2, z: 8 + Math.floor(index / 2) * 5};
}

// The center aisle stays clear; each destination has its own approach from it.
export function routePoints(player, target) {
  return [player, {x: 0, z: player.z}, {x: 0, z: target.z}, target];
}

export function routeArrows(points, spacing = 1.1) {
  const arrows = [];
  for (let index = 1; index < points.length; index++) {
    const from = points[index - 1], to = points[index];
    const distance = Math.hypot(to.x - from.x, to.z - from.z);
    for (let step = spacing / 2; step < distance; step += spacing) {
      arrows.push({x: from.x + (to.x - from.x) * step / distance,
        z: from.z + (to.z - from.z) * step / distance,
        yaw: Math.atan2(to.x - from.x, to.z - from.z)});
    }
  }
  return arrows;
}
