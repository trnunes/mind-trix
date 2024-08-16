let storedMindMaps = [
  {
    id: "map-1",
    title: "Project Planning",
    notes: [{ id: "note-1", content: "This is the first note." }],
    children: [
      {
        id: "node-1",
        title: "Research",
        children: [],
        notes: [
          { id: "note-1", content: "This is the first note." },
          { id: "note-2", content: "This is the second note." },
        ],
      },
      {
        id: "node-2",
        title: "Design",
        children: [],
        notes: [
          { id: "note-1", content: "This is the first note." },
          { id: "note-2", content: "This is the second note." },
        ],
      },
    ],
  },
];

export function fetchMindMaps() {
  // Return the storedMindMaps array, which acts as the centralized database
  return storedMindMaps;
}

export function createMindMap(title) {
  const newMap = {
    id: `map-${Math.random().toString(36).substr(2, 9)}`,
    title,
    notes: [],
    children: [], // New mind map starts with no child nodes
  };

  // Add the new map to storedMindMaps
  storedMindMaps.push(newMap);

  return newMap;
}
