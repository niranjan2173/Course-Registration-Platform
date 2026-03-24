const rotate = (arr, steps) => arr.slice(steps).concat(arr.slice(0, steps));

const buildOptions = (correct, distractors, index) => {
  const options = [correct, ...distractors];
  const rotated = rotate(options, index % options.length);
  return {
    options: rotated,
    correctIndex: rotated.indexOf(correct),
  };
};

const buildBank = (bankKey, templates) => {
  const questions = [];
  templates.forEach(template => {
    template.variants.forEach(variant => {
      const index = questions.length;
      const text = template.prompt(variant);
      const { options, correctIndex } = buildOptions(
        variant.correct,
        variant.distractors,
        index
      );
      questions.push({
        id: `${bankKey}-${index + 1}`,
        question: text,
        options,
        correctIndex,
      });
    });
  });
  return questions.slice(0, 60);
};

const csAiTemplates = [
  {
    prompt: v => `Which data structure is best suited for ${v.useCase}?`,
    variants: [
      { useCase: 'implementing a FIFO queue', correct: 'Queue', distractors: ['Stack', 'Tree', 'Graph'] },
      { useCase: 'tracking function call history (LIFO)', correct: 'Stack', distractors: ['Queue', 'Heap', 'Linked list'] },
      { useCase: 'fast membership lookup', correct: 'Hash table', distractors: ['Array list', 'Stack', 'Queue'] },
      { useCase: 'priority scheduling', correct: 'Heap (priority queue)', distractors: ['Stack', 'Graph', 'Queue'] },
    ],
  },
  {
    prompt: v => `Which sorting algorithm matches this description: ${v.desc}?`,
    variants: [
      { desc: 'Average O(n log n), divide-and-conquer, not stable by default', correct: 'Quick sort', distractors: ['Merge sort', 'Bubble sort', 'Insertion sort'] },
      { desc: 'Always O(n log n) and stable', correct: 'Merge sort', distractors: ['Selection sort', 'Heap sort', 'Quick sort'] },
      { desc: 'Best for nearly sorted data, average O(n^2)', correct: 'Insertion sort', distractors: ['Merge sort', 'Quick sort', 'Heap sort'] },
      { desc: 'Builds a heap, O(n log n)', correct: 'Heap sort', distractors: ['Bubble sort', 'Insertion sort', 'Merge sort'] },
    ],
  },
  {
    prompt: v => `The time complexity of ${v.task} is:`,
    variants: [
      { task: 'binary search on a sorted array', correct: 'O(log n)', distractors: ['O(n)', 'O(n log n)', 'O(1)'] },
      { task: 'linear search in an array', correct: 'O(n)', distractors: ['O(log n)', 'O(1)', 'O(n log n)'] },
      { task: 'building a heap from an array', correct: 'O(n)', distractors: ['O(n log n)', 'O(log n)', 'O(n^2)'] },
      { task: 'checking all pairs in an array', correct: 'O(n^2)', distractors: ['O(n log n)', 'O(n)', 'O(log n)'] },
    ],
  },
  {
    prompt: v => `Which SQL clause is used to ${v.task}?`,
    variants: [
      { task: 'filter rows based on a condition', correct: 'WHERE', distractors: ['GROUP BY', 'ORDER BY', 'HAVING'] },
      { task: 'sort query results', correct: 'ORDER BY', distractors: ['GROUP BY', 'WHERE', 'JOIN'] },
      { task: 'filter groups after aggregation', correct: 'HAVING', distractors: ['WHERE', 'SELECT', 'FROM'] },
      { task: 'combine rows from two tables', correct: 'JOIN', distractors: ['UNION', 'WHERE', 'LIMIT'] },
    ],
  },
  {
    prompt: v => `Which normal form ensures ${v.desc}?`,
    variants: [
      { desc: 'no repeating groups / atomic values', correct: '1NF', distractors: ['2NF', '3NF', 'BCNF'] },
      { desc: 'no partial dependency on a composite key', correct: '2NF', distractors: ['1NF', '3NF', '4NF'] },
      { desc: 'no transitive dependency on the primary key', correct: '3NF', distractors: ['2NF', 'BCNF', '5NF'] },
      { desc: 'every determinant is a candidate key', correct: 'BCNF', distractors: ['3NF', '4NF', '1NF'] },
    ],
  },
  {
    prompt: v => `In operating systems, ${v.statement} refers to:`,
    variants: [
      { statement: 'a lightweight process sharing the same address space', correct: 'Thread', distractors: ['Process', 'Daemon', 'Interrupt'] },
      { statement: 'the program in execution with its own address space', correct: 'Process', distractors: ['Thread', 'Scheduler', 'Semaphore'] },
      { statement: 'the mechanism to prevent race conditions', correct: 'Mutex', distractors: ['Deadlock', 'Paging', 'Spooling'] },
      { statement: 'the CPU scheduling method with time slices', correct: 'Round-robin', distractors: ['FCFS', 'SJF', 'Priority (non-preemptive)'] },
    ],
  },
  {
    prompt: v => `Which OSI layer is responsible for ${v.task}?`,
    variants: [
      { task: 'end-to-end connections and reliability', correct: 'Transport', distractors: ['Network', 'Data Link', 'Session'] },
      { task: 'routing packets across networks', correct: 'Network', distractors: ['Transport', 'Physical', 'Application'] },
      { task: 'framing and MAC addressing', correct: 'Data Link', distractors: ['Network', 'Physical', 'Transport'] },
      { task: 'signal transmission over a medium', correct: 'Physical', distractors: ['Data Link', 'Network', 'Session'] },
    ],
  },
  {
    prompt: v => `Which OOP principle is described as "${v.desc}"?`,
    variants: [
      { desc: 'hiding implementation details behind a public interface', correct: 'Encapsulation', distractors: ['Inheritance', 'Polymorphism', 'Abstraction'] },
      { desc: 'one interface, many implementations', correct: 'Polymorphism', distractors: ['Encapsulation', 'Inheritance', 'Composition'] },
      { desc: 'deriving a new class from an existing class', correct: 'Inheritance', distractors: ['Abstraction', 'Overloading', 'Delegation'] },
      { desc: 'focusing on essential features and ignoring details', correct: 'Abstraction', distractors: ['Encapsulation', 'Polymorphism', 'Aggregation'] },
    ],
  },
  {
    prompt: v => `Which traversal visits nodes in the order ${v.order}?`,
    variants: [
      { order: 'root, left, right', correct: 'Preorder', distractors: ['Inorder', 'Postorder', 'Level-order'] },
      { order: 'left, root, right', correct: 'Inorder', distractors: ['Preorder', 'Postorder', 'Level-order'] },
      { order: 'left, right, root', correct: 'Postorder', distractors: ['Inorder', 'Preorder', 'Level-order'] },
      { order: 'level by level from root', correct: 'Level-order', distractors: ['Inorder', 'Preorder', 'Postorder'] },
    ],
  },
  {
    prompt: v => `A hash table handles collisions using ${v.method} when:`,
    variants: [
      { method: 'chaining', correct: 'multiple items map to the same bucket', distractors: ['items are sorted', 'keys are unique', 'table is empty'] },
      { method: 'open addressing', correct: 'an alternative empty slot is probed', distractors: ['a bucket list is used', 'items are appended to a tree', 'keys are encrypted'] },
      { method: 'rehashing', correct: 'the table is resized and entries are reinserted', distractors: ['all keys are deleted', 'a linked list is reversed', 'probing is disabled'] },
      { method: 'double hashing', correct: 'a second hash function gives probe step size', distractors: ['a tree is built for buckets', 'entries are sorted by key', 'the hash is cached'] },
    ],
  },
  {
    prompt: v => `Which algorithmic technique best solves ${v.problem}?`,
    variants: [
      { problem: 'optimal substructure with overlapping subproblems', correct: 'Dynamic programming', distractors: ['Greedy approach', 'Backtracking', 'Brute force'] },
      { problem: 'exploring all permutations with pruning', correct: 'Backtracking', distractors: ['Greedy', 'Divide and conquer', 'Hashing'] },
      { problem: 'finding shortest paths in weighted graphs', correct: 'Dijkstra’s algorithm', distractors: ['DFS', 'BFS', 'Kruskal’s algorithm'] },
      { problem: 'building minimum spanning tree', correct: 'Kruskal’s algorithm', distractors: ['Dijkstra’s algorithm', 'Bellman-Ford', 'Floyd-Warshall'] },
    ],
  },
  {
    prompt: v => `In web development, ${v.topic} refers to:`,
    variants: [
      { topic: 'CORS', correct: 'browser security policy for cross-origin requests', distractors: ['server caching', 'database indexing', 'CSS styling'] },
      { topic: 'JWT', correct: 'token-based authentication format', distractors: ['database table', 'frontend framework', 'network protocol'] },
      { topic: 'REST', correct: 'architectural style using stateless HTTP', distractors: ['database schema', 'binary protocol', 'UI library'] },
      { topic: 'SQL injection', correct: 'security risk from untrusted input in queries', distractors: ['image processing', 'network latency', 'browser rendering'] },
    ],
  },
  {
    prompt: v => `Which database index type is best for ${v.task}?`,
    variants: [
      { task: 'range queries on ordered data', correct: 'B-tree index', distractors: ['Hash index', 'Bitmap index', 'Full-text index'] },
      { task: 'exact-match lookups', correct: 'Hash index', distractors: ['B-tree index', 'R-tree index', 'Full-text index'] },
      { task: 'spatial/geographic data', correct: 'R-tree index', distractors: ['Hash index', 'B-tree index', 'Bitmap index'] },
      { task: 'keyword search in documents', correct: 'Full-text index', distractors: ['B-tree index', 'Hash index', 'R-tree index'] },
    ],
  },
  {
    prompt: v => `Which HTTP method is most appropriate for ${v.task}?`,
    variants: [
      { task: 'retrieving a resource without side effects', correct: 'GET', distractors: ['POST', 'PUT', 'DELETE'] },
      { task: 'creating a new resource', correct: 'POST', distractors: ['GET', 'PATCH', 'DELETE'] },
      { task: 'replacing an existing resource', correct: 'PUT', distractors: ['POST', 'GET', 'OPTIONS'] },
      { task: 'partially updating a resource', correct: 'PATCH', distractors: ['PUT', 'POST', 'GET'] },
    ],
  },
  {
    prompt: v => `In machine learning, ${v.desc} is called:`,
    variants: [
      { desc: 'model performing well on training but poorly on test data', correct: 'Overfitting', distractors: ['Underfitting', 'Regularization', 'Normalization'] },
      { desc: 'model too simple to capture patterns', correct: 'Underfitting', distractors: ['Overfitting', 'Ensembling', 'Gradient descent'] },
      { desc: 'penalty added to reduce model complexity', correct: 'Regularization', distractors: ['Normalization', 'Dropout', 'Batching'] },
      { desc: 'scaling features to similar ranges', correct: 'Normalization', distractors: ['Regularization', 'Augmentation', 'Sampling'] },
    ],
  },
  {
    prompt: v => `Which data structure is used to implement ${v.task}?`,
    variants: [
      { task: 'BFS traversal', correct: 'Queue', distractors: ['Stack', 'Heap', 'Set'] },
      { task: 'DFS traversal', correct: 'Stack (or recursion)', distractors: ['Queue', 'Heap', 'Array list'] },
      { task: 'shortest path with priorities', correct: 'Priority queue', distractors: ['Stack', 'Hash set', 'Linked list'] },
      { task: 'LRU cache eviction', correct: 'Hash map + doubly linked list', distractors: ['Stack only', 'Queue only', 'Tree only'] },
    ],
  },
];

const electronicsTemplates = [
  {
    prompt: v => `Ohm's law states that:`,
    variants: [
      { correct: 'V = I × R', distractors: ['P = V × I', 'I = R / V', 'R = V + I'] },
      { correct: 'I = V / R', distractors: ['V = I / R', 'P = I / R', 'R = V × I'] },
      { correct: 'R = V / I', distractors: ['R = I / V', 'V = I + R', 'I = V + R'] },
      { correct: 'Power increases with voltage for constant resistance', distractors: ['Power is independent of voltage', 'Power decreases with voltage', 'Power equals resistance'] },
    ],
  },
  {
    prompt: v => `Kirchhoff's ${v.type} law describes:`,
    variants: [
      { type: 'current', correct: 'sum of currents at a node equals zero', distractors: ['sum of voltages in a loop equals zero', 'current equals voltage', 'power equals zero'] },
      { type: 'voltage', correct: 'sum of voltages around a loop equals zero', distractors: ['sum of currents at a node equals zero', 'voltage equals current', 'energy is lost'] },
      { type: 'current', correct: 'current entering a node equals current leaving', distractors: ['voltage divides equally', 'resistance is zero', 'charge is negative'] },
      { type: 'voltage', correct: 'algebraic sum of loop voltages is zero', distractors: ['sum of node currents is zero', 'power is zero', 'current is constant'] },
    ],
  },
  {
    prompt: v => `A diode primarily allows current to flow in:`,
    variants: [
      { correct: 'one direction', distractors: ['both directions equally', 'only when reversed', 'only AC'] },
      { correct: 'forward bias', distractors: ['reverse bias', 'open circuit', 'short circuit'] },
      { correct: 'from anode to cathode (forward)', distractors: ['cathode to anode', 'both ways', 'neither way'] },
      { correct: 'a rectifying direction', distractors: ['a capacitive direction', 'an inductive direction', 'a resistive direction'] },
    ],
  },
  {
    prompt: v => `A transformer changes voltage levels through:`,
    variants: [
      { correct: 'mutual induction', distractors: ['static charging', 'resistive heating', 'chemical reaction'] },
      { correct: 'primary and secondary windings', distractors: ['diode conduction', 'transistor switching', 'capacitor discharge'] },
      { correct: 'turns ratio', distractors: ['capacitance ratio', 'resistance ratio', 'frequency ratio'] },
      { correct: 'magnetic coupling', distractors: ['electric isolation', 'thermal coupling', 'optical coupling'] },
    ],
  },
  {
    prompt: v => `An operational amplifier in an ideal model has:`,
    variants: [
      { correct: 'infinite input impedance', distractors: ['zero input impedance', 'high output resistance', 'low gain'] },
      { correct: 'infinite open-loop gain', distractors: ['unity gain', 'zero gain', 'negative gain'] },
      { correct: 'zero output impedance', distractors: ['infinite output impedance', 'variable input impedance', 'low bandwidth'] },
      { correct: 'infinite bandwidth', distractors: ['zero bandwidth', 'narrow bandwidth', 'frequency-dependent gain only'] },
    ],
  },
  {
    prompt: v => `A low-pass filter allows ${v.desc} to pass:`,
    variants: [
      { desc: 'low frequencies', correct: 'low frequencies', distractors: ['high frequencies', 'only DC', 'only AC'] },
      { desc: 'frequencies below cutoff', correct: 'frequencies below cutoff', distractors: ['above cutoff', 'only harmonics', 'only noise'] },
      { desc: 'slowly varying signals', correct: 'slowly varying signals', distractors: ['rapid changes only', 'only square waves', 'only pulses'] },
      { desc: 'signals under a threshold frequency', correct: 'signals under a threshold frequency', distractors: ['only high-frequency noise', 'all frequencies equally', 'only RF'] },
    ],
  },
  {
    prompt: v => `In AC circuits, power factor is defined as:`,
    variants: [
      { correct: 'cos(phase angle)', distractors: ['sin(phase angle)', 'tan(phase angle)', 'phase angle itself'] },
      { correct: 'real power / apparent power', distractors: ['apparent power / real power', 'reactive power / real power', 'voltage / current'] },
      { correct: 'measure of phase alignment', distractors: ['measure of impedance', 'measure of resistance only', 'measure of capacitance only'] },
      { correct: 'ratio of useful power to total power', distractors: ['ratio of reactive power to real power', 'ratio of voltage to current', 'ratio of current to voltage'] },
    ],
  },
  {
    prompt: v => `Sampling a signal must satisfy the ${v.desc} to avoid aliasing.`,
    variants: [
      { desc: 'Nyquist criterion', correct: 'Nyquist criterion', distractors: ['Kirchhoff law', 'Ohm law', 'Faraday law'] },
      { desc: 'sampling rate >= 2 × max frequency', correct: 'Nyquist criterion', distractors: ['Superposition', 'Linearity', 'Causality'] },
      { desc: 'sampling theorem', correct: 'Nyquist criterion', distractors: ['Coulomb law', 'Gauss law', 'Ampere law'] },
      { desc: 'Nyquist rate', correct: 'Nyquist criterion', distractors: ['Bernoulli principle', 'Pascal law', 'Hooke law'] },
    ],
  },
  {
    prompt: v => `A BJT (bipolar junction transistor) is ${v.desc}.`,
    variants: [
      { desc: 'a current-controlled device', correct: 'a current-controlled device', distractors: ['voltage-controlled', 'light-controlled', 'temperature-controlled'] },
      { desc: 'uses both electrons and holes', correct: 'uses both electrons and holes', distractors: ['uses only electrons', 'uses only ions', 'uses only holes'] },
      { desc: 'has emitter, base, collector terminals', correct: 'has emitter, base, collector terminals', distractors: ['source, gate, drain', 'anode, cathode', 'input, output'] },
      { desc: 'used for amplification and switching', correct: 'used for amplification and switching', distractors: ['used only for rectification', 'used only for storage', 'used only for filtering'] },
    ],
  },
  {
    prompt: v => `A full-wave rectifier uses:`,
    variants: [
      { correct: 'both halves of the AC cycle', distractors: ['only positive half', 'only negative half', 'no AC'] },
      { correct: 'diodes to flip negative half cycles', distractors: ['inductors only', 'capacitors only', 'transistors only'] },
      { correct: 'bridge configuration', distractors: ['single diode', 'single resistor', 'single capacitor'] },
      { correct: 'improved efficiency over half-wave', distractors: ['lower efficiency', 'no output ripple', 'zero diode drop'] },
    ],
  },
  {
    prompt: v => `In three-phase systems, the line voltage is ${v.desc}.`,
    variants: [
      { desc: '√3 times the phase voltage (star connection)', correct: '√3 times the phase voltage', distractors: ['equal to phase voltage', '1/√3 times', '2 times'] },
      { desc: 'higher than phase voltage in star', correct: '√3 times the phase voltage', distractors: ['equal to phase voltage', 'half the phase voltage', 'lower by 3 times'] },
      { desc: 'related by √3 in star', correct: '√3 times the phase voltage', distractors: ['3 times', '1/3 times', '2 times'] },
      { desc: 'greater than phase by √3', correct: '√3 times the phase voltage', distractors: ['equal to phase', 'less than phase', 'zero'] },
    ],
  },
  {
    prompt: v => `A capacitor in AC circuits ${v.desc}.`,
    variants: [
      { desc: 'leads current by 90 degrees', correct: 'leads current by 90 degrees', distractors: ['lags by 90 degrees', 'no phase difference', 'blocks AC'] },
      { desc: 'reactance decreases with frequency', correct: 'reactance decreases with frequency', distractors: ['reactance increases with frequency', 'reactance is constant', 'reactance is zero'] },
      { desc: 'stores energy in an electric field', correct: 'stores energy in an electric field', distractors: ['stores energy in magnetic field', 'stores energy chemically', 'stores energy mechanically'] },
      { desc: 'blocks DC and passes AC', correct: 'blocks DC and passes AC', distractors: ['passes DC and blocks AC', 'blocks both', 'passes both equally'] },
    ],
  },
  {
    prompt: v => `A DC motor converts:`,
    variants: [
      { correct: 'electrical energy to mechanical energy', distractors: ['mechanical to electrical', 'thermal to electrical', 'chemical to mechanical'] },
      { correct: 'electrical input into torque', distractors: ['torque into voltage', 'current into heat only', 'magnetic into light'] },
      { correct: 'current into rotation', distractors: ['rotation into current only', 'current into light', 'voltage into heat only'] },
      { correct: 'power into motion', distractors: ['motion into power only', 'heat into motion', 'sound into motion'] },
    ],
  },
  {
    prompt: v => `The bandwidth of a system is the range between:`,
    variants: [
      { correct: 'upper and lower cutoff frequencies', distractors: ['peak and average power', 'min and max voltage', 'zero and resonance'] },
      { correct: 'frequencies where gain drops by 3 dB', distractors: ['frequencies of zero gain', 'DC and infinite', 'resonant and anti-resonant only'] },
      { correct: 'fH and fL', distractors: ['Vmax and Vmin', 'Imax and Imin', 'Rmax and Rmin'] },
      { correct: 'passband limits', distractors: ['stopband limits only', 'noise band only', 'harmonic band only'] },
    ],
  },
  {
    prompt: v => `The unit of electric charge is:`,
    variants: [
      { correct: 'Coulomb', distractors: ['Tesla', 'Weber', 'Henry'] },
      { correct: 'C', distractors: ['T', 'Wb', 'H'] },
      { correct: 'ampere-second', distractors: ['volt-second', 'ohm-second', 'watt-second'] },
      { correct: 'SI unit of charge', distractors: ['unit of flux', 'unit of inductance', 'unit of power'] },
    ],
  },
];

const mechCivilTemplates = [
  {
    prompt: v => `Stress is defined as:`,
    variants: [
      { correct: 'force per unit area', distractors: ['force per unit length', 'area per unit force', 'moment per unit area'] },
      { correct: 'σ = F / A', distractors: ['σ = A / F', 'σ = F × A', 'σ = F + A'] },
      { correct: 'internal resisting force per area', distractors: ['external load only', 'volume per force', 'mass per area'] },
      { correct: 'units of Pascal (N/m²)', distractors: ['N/m', 'J', 'W'] },
    ],
  },
  {
    prompt: v => `Strain is defined as:`,
    variants: [
      { correct: 'change in length / original length', distractors: ['force / area', 'moment / length', 'volume / mass'] },
      { correct: 'dimensionless deformation measure', distractors: ['force unit', 'pressure unit', 'energy unit'] },
      { correct: 'ε = ΔL / L', distractors: ['ε = L / ΔL', 'ε = ΔL × L', 'ε = F / A'] },
      { correct: 'ratio of deformation to length', distractors: ['ratio of force to area', 'ratio of stress to force', 'ratio of load to strain'] },
    ],
  },
  {
    prompt: v => `In beam theory, the maximum bending moment in a simply supported beam with central point load occurs at:`,
    variants: [
      { correct: 'the center', distractors: ['the supports', 'quarter span', 'anywhere'] },
      { correct: 'mid-span', distractors: ['one end', 'both ends', 'random'] },
      { correct: 'location of the load for mid-span', distractors: ['left support', 'right support', 'no specific point'] },
      { correct: 'where shear force is zero', distractors: ['where shear force is maximum', 'at both supports', 'at zero load'] },
    ],
  },
  {
    prompt: v => `The purpose of reinforcement in concrete is to:`,
    variants: [
      { correct: 'carry tensile stresses', distractors: ['increase compressive strength only', 'reduce density', 'replace aggregates'] },
      { correct: 'improve ductility', distractors: ['reduce stiffness', 'decrease strength', 'eliminate cracking'] },
      { correct: 'control cracking', distractors: ['increase shrinkage', 'eliminate curing', 'reduce aggregate size'] },
      { correct: 'provide tensile resistance', distractors: ['provide only compression resistance', 'lower cost only', 'reduce durability'] },
    ],
  },
  {
    prompt: v => `In soil mechanics, the water content is:`,
    variants: [
      { correct: 'mass of water / mass of dry soil', distractors: ['mass of dry soil / mass of water', 'volume of water / volume of soil', 'mass of soil / volume of water'] },
      { correct: 'a percentage of dry mass', distractors: ['percentage of wet mass only', 'percentage of volume only', 'percentage of density only'] },
      { correct: 'w = (Mw / Md) × 100%', distractors: ['w = (Md / Mw) × 100%', 'w = Mw + Md', 'w = Mw - Md'] },
      { correct: 'higher for clay than sand typically', distractors: ['higher for sand only', 'constant for all soils', 'zero for saturated soil'] },
    ],
  },
  {
    prompt: v => `In surveying, a benchmark is:`,
    variants: [
      { correct: 'a fixed reference point of known elevation', distractors: ['a random point', 'temporary marking', 'a slope measurement'] },
      { correct: 'used to transfer elevation', distractors: ['used to measure angles only', 'used for distance only', 'used for speed only'] },
      { correct: 'a permanent survey marker', distractors: ['a moving marker', 'a temporary peg only', 'a coordinate guess'] },
      { correct: 'datum reference', distractors: ['slope reference', 'azimuth reference only', 'magnetic reference only'] },
    ],
  },
  {
    prompt: v => `Traffic flow is commonly measured in:`,
    variants: [
      { correct: 'vehicles per hour', distractors: ['meters per second', 'liters per minute', 'newtons'] },
      { correct: 'PCU/hr (passenger car units)', distractors: ['kg/s', 'm³/s', 'N/m²'] },
      { correct: 'volume per time', distractors: ['density per area', 'speed per time', 'time per speed'] },
      { correct: 'veh/hr', distractors: ['veh/km', 'km/hr', 'hr/km'] },
    ],
  },
  {
    prompt: v => `The Reynolds number indicates:`,
    variants: [
      { correct: 'laminar vs turbulent flow', distractors: ['thermal expansion', 'elastic modulus', 'chemical reaction rate'] },
      { correct: 'ratio of inertial to viscous forces', distractors: ['ratio of pressure to velocity', 'ratio of mass to volume', 'ratio of stress to strain'] },
      { correct: 'flow regime', distractors: ['soil type', 'beam type', 'material phase'] },
      { correct: 'dimensionless flow parameter', distractors: ['length unit', 'force unit', 'energy unit'] },
    ],
  },
  {
    prompt: v => `In structural analysis, a determinate structure has:`,
    variants: [
      { correct: 'reactions found by equilibrium only', distractors: ['more unknowns than equations', 'no supports', 'zero reactions'] },
      { correct: 'static determinacy', distractors: ['static indeterminacy', 'dynamic instability', 'material failure'] },
      { correct: 'unknowns equal to equilibrium equations', distractors: ['unknowns greater than equations', 'unknowns fewer than equations', 'no unknowns'] },
      { correct: 'solvable without deformation analysis', distractors: ['requires FEM only', 'requires only experiments', 'cannot be solved'] },
    ],
  },
  {
    prompt: v => `In thermodynamics, the first law states that:`,
    variants: [
      { correct: 'energy is conserved', distractors: ['entropy always increases', 'pressure is constant', 'heat is negative'] },
      { correct: 'ΔU = Q - W', distractors: ['ΔU = W - Q', 'Q = 0', 'W = 0'] },
      { correct: 'heat and work are energy transfer modes', distractors: ['heat is a substance', 'work is stored energy', 'temperature is energy'] },
      { correct: 'total energy remains constant', distractors: ['energy can be created', 'energy can be destroyed', 'energy depends on mass only'] },
    ],
  },
  {
    prompt: v => `In manufacturing, a lathe operation primarily performs:`,
    variants: [
      { correct: 'turning', distractors: ['milling', 'drilling', 'grinding'] },
      { correct: 'rotational machining', distractors: ['planing', 'shaping', 'casting'] },
      { correct: 'cylindrical shaping', distractors: ['sheet cutting', 'forging', 'welding'] },
      { correct: 'removal of material from rotating workpiece', distractors: ['rotating tool only', '3D printing', 'laser sintering'] },
    ],
  },
  {
    prompt: v => `The Rankine cycle is associated with:`,
    variants: [
      { correct: 'steam power plants', distractors: ['gas turbines only', 'refrigeration cycles', 'IC engines'] },
      { correct: 'boiler, turbine, condenser, pump', distractors: ['compressor, combustor, turbine', 'evaporator, compressor, condenser', 'cylinder, piston, crank'] },
      { correct: 'water/steam as working fluid', distractors: ['air only', 'ammonia only', 'oil only'] },
      { correct: 'heat to work conversion', distractors: ['work to heat conversion only', 'cooling only', 'chemical conversion only'] },
    ],
  },
  {
    prompt: v => `In civil engineering, compaction is used to:`,
    variants: [
      { correct: 'increase soil density and strength', distractors: ['decrease soil density', 'increase permeability', 'reduce bearing capacity'] },
      { correct: 'reduce voids', distractors: ['increase voids', 'add water only', 'remove aggregates'] },
      { correct: 'improve load-bearing', distractors: ['reduce stability', 'increase settlement', 'reduce cohesion'] },
      { correct: 'achieve required dry density', distractors: ['achieve required wet density only', 'reduce moisture content only', 'reduce friction only'] },
    ],
  },
  {
    prompt: v => `The coefficient of friction is defined as:`,
    variants: [
      { correct: 'ratio of frictional force to normal force', distractors: ['ratio of normal to frictional', 'difference of forces', 'sum of forces'] },
      { correct: 'μ = Ff / N', distractors: ['μ = N / Ff', 'μ = Ff + N', 'μ = Ff × N'] },
      { correct: 'dimensionless quantity', distractors: ['length unit', 'force unit', 'energy unit'] },
      { correct: 'depends on surface pair', distractors: ['depends only on mass', 'depends only on area', 'is always 1'] },
    ],
  },
  {
    prompt: v => `In control systems, stability means:`,
    variants: [
      { correct: 'bounded output for bounded input', distractors: ['output grows without limit', 'input is zero always', 'system is linear only'] },
      { correct: 'system returns to equilibrium after disturbance', distractors: ['system diverges', 'system never responds', 'system oscillates with increasing amplitude'] },
      { correct: 'stable response over time', distractors: ['unpredictable response', 'random response', 'response only at t=0'] },
      { correct: 'BIBO stability', distractors: ['only marginal stability', 'zero damping only', 'always unstable'] },
    ],
  },
];

const businessDesignTemplates = [
  {
    prompt: v => `In marketing, the 4Ps stand for:`,
    variants: [
      { correct: 'Product, Price, Place, Promotion', distractors: ['People, Process, Product, Price', 'Plan, Price, Place, Profit', 'Product, Process, Profit, Place'] },
      { correct: 'core marketing mix elements', distractors: ['financial statements', 'supply chain stages', 'UX principles'] },
      { correct: 'mix decisions for market offering', distractors: ['cost control tools', 'project phases', 'quality metrics'] },
      { correct: 'product and distribution strategy', distractors: ['engineering inputs', 'legal requirements', 'technical standards'] },
    ],
  },
  {
    prompt: v => `ROI (Return on Investment) is calculated as:`,
    variants: [
      { correct: '(Net Profit / Investment) × 100', distractors: ['Revenue / Cost', 'Cost / Revenue', 'Profit + Investment'] },
      { correct: 'percentage return on cost', distractors: ['percentage of expenses', 'only gross margin', 'only operating cost'] },
      { correct: 'profitability metric', distractors: ['liquidity ratio', 'leverage ratio', 'inventory turnover'] },
      { correct: 'benefit relative to cost', distractors: ['cost relative to benefit', 'cash flow only', 'assets only'] },
    ],
  },
  {
    prompt: v => `A SWOT analysis evaluates:`,
    variants: [
      { correct: 'Strengths, Weaknesses, Opportunities, Threats', distractors: ['Sales, Workflows, Outputs, Trends', 'Scale, Worth, Output, Talent', 'Strategy, Work, Operations, Targets'] },
      { correct: 'internal and external factors', distractors: ['financial statements only', 'production only', 'HR only'] },
      { correct: 'strategic positioning', distractors: ['time scheduling', 'product design only', 'customer support only'] },
      { correct: 'current and future business context', distractors: ['only past performance', 'only competition', 'only costs'] },
    ],
  },
  {
    prompt: v => `A KPI (Key Performance Indicator) is:`,
    variants: [
      { correct: 'a metric that tracks progress toward goals', distractors: ['a random metric', 'a legal requirement', 'a design guideline'] },
      { correct: 'used to measure performance', distractors: ['used to set salaries only', 'used to store data', 'used to design logos'] },
      { correct: 'aligned with business objectives', distractors: ['independent of goals', 'only for finance', 'only for marketing'] },
      { correct: 'quantifiable performance measure', distractors: ['qualitative feedback only', 'anecdotal evidence', 'a checklist'] },
    ],
  },
  {
    prompt: v => `In UX, a wireframe is:`,
    variants: [
      { correct: 'a low-fidelity layout of a page', distractors: ['final visual design', 'code implementation', 'user research report'] },
      { correct: 'structure before visual polish', distractors: ['full branding', 'deployment plan', 'marketing copy'] },
      { correct: 'a blueprint for interface layout', distractors: ['backend architecture', 'test plan', 'content audit'] },
      { correct: 'used early in design to test structure', distractors: ['used only after development', 'used for QA only', 'used for billing'] },
    ],
  },
  {
    prompt: v => `Usability testing primarily measures:`,
    variants: [
      { correct: 'how easily users can complete tasks', distractors: ['server performance', 'code coverage', 'marketing reach'] },
      { correct: 'effectiveness, efficiency, satisfaction', distractors: ['profit, revenue, tax', 'latency only', 'security only'] },
      { correct: 'user success rates', distractors: ['hardware reliability', 'deployment speed', 'SEO ranking'] },
      { correct: 'real user experience quality', distractors: ['visual appeal only', 'brand awareness only', 'cost only'] },
    ],
  },
  {
    prompt: v => `A design system typically includes:`,
    variants: [
      { correct: 'components, patterns, and guidelines', distractors: ['only logos', 'only fonts', 'only marketing slogans'] },
      { correct: 'reusable UI elements', distractors: ['only backend APIs', 'only test cases', 'only user stories'] },
      { correct: 'consistent visual and interaction rules', distractors: ['ad-hoc styles', 'random colors', 'unstructured assets'] },
      { correct: 'tokens like color, spacing, typography', distractors: ['server configs', 'database schemas', 'payment plans'] },
    ],
  },
  {
    prompt: v => `The primary goal of user research is to:`,
    variants: [
      { correct: 'understand user needs and behaviors', distractors: ['increase code speed', 'reduce server costs', 'create logos'] },
      { correct: 'inform design decisions', distractors: ['replace design entirely', 'avoid testing', 'skip validation'] },
      { correct: 'reduce assumptions with evidence', distractors: ['increase opinions', 'focus only on stakeholders', 'avoid customers'] },
      { correct: 'find pain points and goals', distractors: ['only gather demographics', 'only measure revenue', 'only check analytics'] },
    ],
  },
  {
    prompt: v => `A/B testing compares:`,
    variants: [
      { correct: 'two variants to see which performs better', distractors: ['two servers to compare uptime', 'two databases to compare size', 'two brands to compare logos'] },
      { correct: 'metrics between versions', distractors: ['only colors', 'only fonts', 'only code style'] },
      { correct: 'controlled experiment outcomes', distractors: ['random selection only', 'uncontrolled changes', 'single variant only'] },
      { correct: 'conversion rates of variants', distractors: ['profit only', 'traffic only', 'cost only'] },
    ],
  },
  {
    prompt: v => `A persona is:`,
    variants: [
      { correct: 'a fictional representation of a target user', distractors: ['a real individual only', 'a UI component', 'a marketing plan'] },
      { correct: 'based on research data', distractors: ['based on guesses only', 'based on code', 'based on KPIs only'] },
      { correct: 'used to guide design decisions', distractors: ['used for billing', 'used to replace testing', 'used for deployment'] },
      { correct: 'a tool for empathy and focus', distractors: ['a tool for accounting', 'a tool for networking', 'a tool for debugging'] },
    ],
  },
  {
    prompt: v => `In business analytics, correlation means:`,
    variants: [
      { correct: 'a relationship between two variables', distractors: ['one variable causes another', 'randomness only', 'no relationship'] },
      { correct: 'association, not causation', distractors: ['proof of causation', 'measurement of profit', 'measurement of cost'] },
      { correct: 'co-movement patterns', distractors: ['absolute dependence', 'no dependency', 'only linear regression'] },
      { correct: 'statistical linkage', distractors: ['financial linkage only', 'legal linkage only', 'technical linkage only'] },
    ],
  },
  {
    prompt: v => `In finance, liquidity refers to:`,
    variants: [
      { correct: 'ability to convert assets to cash quickly', distractors: ['long-term profitability', 'total debt', 'market share'] },
      { correct: 'short-term cash availability', distractors: ['long-term growth', 'employee productivity', 'brand value'] },
      { correct: 'ease of cash flow', distractors: ['high fixed costs', 'high leverage', 'high inflation'] },
      { correct: 'cash readiness', distractors: ['inventory only', 'fixed assets only', 'equity only'] },
    ],
  },
  {
    prompt: v => `The primary purpose of a wireframe is to:`,
    variants: [
      { correct: 'define layout and structure', distractors: ['define final colors', 'define final copy', 'define backend logic'] },
      { correct: 'quickly explore UI ideas', distractors: ['finalize branding', 'code interactions', 'launch marketing'] },
      { correct: 'communicate placement of elements', distractors: ['communicate server load', 'communicate costs', 'communicate legal policies'] },
      { correct: 'test flows early', distractors: ['avoid testing', 'skip feedback', 'avoid iteration'] },
    ],
  },
  {
    prompt: v => `A value proposition explains:`,
    variants: [
      { correct: 'why a customer should choose your product', distractors: ['how to write code', 'how to optimize servers', 'how to recruit'] },
      { correct: 'unique benefits offered', distractors: ['only pricing', 'only branding', 'only legal terms'] },
      { correct: 'problem solved and outcomes', distractors: ['just features', 'just UI colors', 'just company history'] },
      { correct: 'customer value and differentiation', distractors: ['internal structure only', 'employee benefits only', 'IT architecture only'] },
    ],
  },
  {
    prompt: v => `In analytics, a dashboard should:`,
    variants: [
      { correct: 'surface key metrics at a glance', distractors: ['show every data point', 'hide trends', 'avoid KPIs'] },
      { correct: 'support quick decisions', distractors: ['slow down analysis', 'avoid context', 'replace raw data'] },
      { correct: 'be aligned with goals', distractors: ['be random', 'avoid stakeholders', 'only show tables'] },
      { correct: 'use clear visual hierarchy', distractors: ['use only text', 'use only pie charts', 'avoid labels'] },
    ],
  },
  {
    prompt: v => `In product management, a roadmap defines:`,
    variants: [
      { correct: 'planned features and timeline', distractors: ['team salaries', 'server configs', 'legal policy'] },
      { correct: 'direction and priorities', distractors: ['random ideas', 'only KPIs', 'only marketing copy'] },
      { correct: 'sequence of deliverables', distractors: ['bug list only', 'design tokens only', 'code style'] },
      { correct: 'strategic milestones', distractors: ['only UI layout', 'only brand colors', 'only user personas'] },
    ],
  },
];

const banks = {
  cs_ai: buildBank('cs-ai', csAiTemplates),
  electronics: buildBank('electronics', electronicsTemplates),
  mech_civil: buildBank('mech-civil', mechCivilTemplates),
  business_design: buildBank('business-design', businessDesignTemplates),
};

const categoryToBank = {
  'Computer Science': 'cs_ai',
  'B.Tech - CSE': 'cs_ai',
  'Artificial Intelligence': 'cs_ai',
  'B.Tech - AI': 'cs_ai',
  'B.Tech - ECE': 'electronics',
  'B.Tech - EEE': 'electronics',
  'B.Tech - ME': 'mech_civil',
  'B.Tech - CE': 'mech_civil',
  MBA: 'business_design',
  Design: 'business_design',
};

export function getAssessmentQuestions({ courseCategory }) {
  const bankKey = categoryToBank[courseCategory] || 'cs_ai';
  return banks[bankKey];
}
