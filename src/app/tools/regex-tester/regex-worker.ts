// Web Worker for safe regex execution with timeout
self.onmessage = (e: MessageEvent<{ pattern: string; flags: string; testString: string }>) => {
  const { pattern, flags, testString } = e.data;
  try {
    const re = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
    const results: { fullMatch: string; groups: string[]; index: number }[] = [];
    let m;
    let count = 0;
    while ((m = re.exec(testString)) !== null) {
      results.push({
        fullMatch: m[0],
        groups: m.slice(1),
        index: m.index,
      });
      if (!m[0]) re.lastIndex++;
      count++;
      if (count > 10000) break; // safety limit
    }
    self.postMessage({ type: "result", results });
  } catch (err) {
    self.postMessage({ type: "error", message: (err as Error).message });
  }
};
