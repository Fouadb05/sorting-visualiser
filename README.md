# Sorting Visualiser

An interactive app that animates how different sorting algorithms work, step by step.

Built with React, TypeScript and Vite.

## Features

- **5 algorithms:** Bubble, Selection, Insertion, Merge and Quick sort
- **Step-by-step animation:** bars being compared are highlighted, and sorted bars turn green
- **Controls:** Play / Pause, Previous / Next step, and a speed slider
- **Live stats:** counts comparisons and swaps as the sort runs
- **New Array:** generates a fresh random array of 20 values

> **Note on merge sort:** merge sort copies values into temporary arrays and writes them back one at a time, so bars may briefly repeat while merging. This is how the algorithm actually works.

## Getting started

```bash
npm install
npm run dev
```

Then open the link shown in the terminal (usually http://localhost:5173).

## Running the tests

```bash
npm test
```

There are two test files:

- `src/sorting.test.ts` checks each sorting algorithm on its own
- `src/App.test.tsx` checks the app's buttons, slider and dropdown

## Scripts

| Command           | What it does                    |
| ----------------- | ------------------------------- |
| `npm run dev`     | Start the app locally           |
| `npm run build`   | Build for production            |
| `npm run preview` | Preview the production build    |
| `npm test`        | Run the tests                   |
| `npm run lint`    | Check the code with ESLint      |
