import { useState, useEffect } from 'react'
import './App.css'





export type SortStep = {
  array: number[]
  comparing: [number, number]
  range: [number, number]
  sorted: number[]
  comparisons: number
  swaps: number
}


export function bubbleSortWithSteps(arr: number[]): SortStep[] {
  const array = [...arr]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0


  for (let i = 0; i < array.length; i++) {
    for (let j = 0; j < array.length - i - 1; j++) {
      comparisons++
      steps.push({ array: [...array], comparing: [j, j + 1], comparisons, range: [j, j + 2], sorted: [], swaps})

      if (array[j] > array[j + 1]) {
        const temp = array[j]
        array[j] = array[j + 1]
        array[j + 1] = temp
        swaps++
        steps.push({ array: [...array], comparing: [j, j + 1], range: [j, j + 2], sorted: [], comparisons, swaps})
      }
    }
  }

  const allSorted = Array.from({ length: array.length }, (_, index) => index)
  steps.push({ array: [...array], comparing: [-1, -1], range: [0, array.length], sorted: allSorted, comparisons, swaps })

  return steps

}

export function selectionSortWithSteps(arr: number[]): SortStep[] {
  const array = [...arr]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const sortedIndices: number[] = []

  for (let i = 0; i < array.length; i++) {
    let minIndex = i

    for (let j = i + 1; j < array.length; j++) {
      comparisons++
      steps.push({ array: [...array], comparing: [minIndex, j], range: [i, array.length], sorted: [...sortedIndices], comparisons, swaps })

      if (array[j] < array[minIndex]) {
        minIndex = j
      }
    }

    if (minIndex !== i) {
      const temp = array[i]
      array[i] = array[minIndex]
      array[minIndex] = temp
      swaps++
    }

    sortedIndices.push(i)
    steps.push({ array: [...array], comparing: [i, i], range: [i, array.length], sorted: [...sortedIndices], comparisons, swaps })


  }

  return steps
}

export function insertionSortWithSteps(arr: number[]): SortStep[] {
  const array = [...arr]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  for (let i = 1; i < array.length; i++) {
    let j = i

    while (j > 0) {
      comparisons++
      steps.push({ array: [...array], comparing: [j - 1, j], range: [j - 1, j + 1], sorted: [], comparisons, swaps })

      if (array[j - 1] > array[j]) {
        const temp = array[j - 1]
        array[j - 1] = array[j]
        array[j] = temp
        swaps++
        steps.push({ array: [...array], comparing: [j - 1, j], range: [j - 1, j + 1], sorted: [], comparisons, swaps })
        j--
      } else {
        break
      }
    }
  }

  const allSorted = Array.from({ length: array.length }, (_, index) => index)
  steps.push({ array: [...array], comparing: [-1, -1], range: [0, array.length], sorted: allSorted, comparisons, swaps })

  return steps
}

export function mergeSortWithSteps(arr: number[]): SortStep[] {
  const array = [...arr]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0

  function mergeSortHelper(start: number, end: number) {
    steps.push({ array: [...array], comparing: [-1, -1], range: [start, end], sorted: [], comparisons, swaps })

    if (end - start <= 1) return

    const middle = Math.floor((start + end) / 2)
    mergeSortHelper(start, middle)
    mergeSortHelper(middle, end)

    const left = array.slice(start, middle)
    const right = array.slice(middle, end)

    let i = 0
    let j = 0
    let k = start

    while (i < left.length && j < right.length) {
      const leftPos = start + i
      const rightPos = middle + j

      comparisons++
      steps.push({ array: [...array], comparing: [leftPos, rightPos], range: [start, end], sorted: [], comparisons, swaps })

      if (left[i] <= right[j]) {
        array[k] = left[i]
        i++
      } else {
        array[k] = right[j]
        j++
      }
      swaps++
      steps.push({ array: [...array], comparing: [k, k], range: [start, end], sorted: [], comparisons, swaps })
      k++
    }

    while (i < left.length) {
      array[k] = left[i]
      swaps++
      steps.push({ array: [...array], comparing: [k, k], range: [start, end], sorted: [], comparisons, swaps })
      i++
      k++
    }

    while (j < right.length) {
      array[k] = right[j]
      swaps++
      steps.push({ array: [...array], comparing: [k, k], range: [start, end], sorted: [], comparisons, swaps })
      j++
      k++
    }
  }

  mergeSortHelper(0, array.length)

  const allSorted = Array.from({ length: array.length }, (_, index) => index)
  steps.push({ array: [...array], comparing: [-1, -1], range: [0, array.length], sorted: allSorted, comparisons, swaps })

  return steps
}

export function quickSortWithSteps(arr: number[]): SortStep[] {
  const array = [...arr]
  const steps: SortStep[] = []
  let comparisons = 0
  let swaps = 0
  const sortedIndices: number[] = []

  function partition(start: number, end: number): number {
    const pivotValue = array[end - 1]
    let boundary = start

    for (let k = start; k < end - 1; k++) {
      comparisons++
      steps.push({ array: [...array], comparing: [k, end - 1], range: [start, end], sorted: [...sortedIndices], comparisons, swaps })

      if (array[k] < pivotValue) {
        const temp = array[k]
        array[k] = array[boundary]
        array[boundary] = temp
        swaps++
        boundary++
        steps.push({ array: [...array], comparing: [k, boundary - 1], range: [start, end], sorted: [...sortedIndices], comparisons, swaps })
      }
    }

    const temp = array[boundary]
    array[boundary] = array[end - 1]
    array[end - 1] = temp
    swaps++
    sortedIndices.push(boundary)
    steps.push({ array: [...array], comparing: [boundary, boundary], range: [start, end], sorted: [...sortedIndices], comparisons, swaps })

    return boundary
  }

  function quickSortHelper(start: number, end: number) {
    if (end - start <= 1) {
      if (end - start === 1) sortedIndices.push(start)
      return
    }

    const pivotIndex = partition(start, end)
    quickSortHelper(start, pivotIndex)
    quickSortHelper(pivotIndex + 1, end)
  }

  quickSortHelper(0, array.length)
  
  const allSorted = Array.from({ length: array.length }, (_, index) => index)
  steps.push({ array: [...array], comparing: [-1, -1], range: [0, array.length], sorted: allSorted, comparisons, swaps })
  
  return steps
}


function generateRandomArray(size: number): number[] {
  const array: number[] = []
  for (let i = 0; i < size; i++) {
    array.push(Math.floor(Math.random() * 100) + 5)
  }
  return array
}

function App() {
  const [array, setArray] = useState<number[]>(generateRandomArray(20))
  const [steps, setSteps] = useState<SortStep[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const displayArray = steps.length > 0 ? steps[currentStep].array : array
  const [speed, setSpeed] = useState(100)
  const [algorithm, setAlgorithm] = useState("bubble")
  const [isPaused, setIsPaused] = useState(false)



function handleSort() {
  const newSteps =
    algorithm === "bubble" ? bubbleSortWithSteps(array) :
    algorithm === "selection" ? selectionSortWithSteps(array) :
    algorithm === "insertion" ? insertionSortWithSteps(array) :
    algorithm === "merge" ? mergeSortWithSteps(array) :
    quickSortWithSteps(array)
  setSteps(newSteps)
  setCurrentStep(0)
}

function handleNewArray() {
  setArray(generateRandomArray(20))
  setSteps([])
  setCurrentStep(0)
}

useEffect(() => {
  if (steps.length === 0) return
  if (isPaused) return
  if (currentStep >= steps.length - 1) return

  const timer = setTimeout(() => {
    setCurrentStep(currentStep + 1)
  }, 510 - speed)

  return () => clearTimeout(timer)
}, [currentStep, steps, speed, isPaused])

  return (
    <div className="app">
      <h1>Sorting Visualiser</h1>

      <div className="controls">
        <select value={algorithm} onChange={(e) => setAlgorithm(e.target.value)}>
          <option value="bubble">Bubble Sort</option>
          <option value="selection">Selection Sort</option>
          <option value="insertion">Insertion Sort</option>
          <option value="merge">Merge Sort</option>
          <option value="quick">Quick Sort</option>
        </select>

        <button onClick={handleNewArray}>New Array</button>
        <button onClick={handleSort}>Sort</button>
        <button onClick={() => setIsPaused(!isPaused)}>
          {isPaused ? "Play" : "Pause"}
        </button>

        <button
          onClick={() => {
            setIsPaused(true)
            setCurrentStep(Math.max(0, currentStep - 1))
          }}
          disabled={currentStep === 0}
        >
          Previous
        </button>

        <button
          onClick={() => {
            setIsPaused(true)
            setCurrentStep(Math.min(steps.length - 1, currentStep + 1))
          }}
          disabled={currentStep >= steps.length - 1}
        >
          Next
        </button>

        <input
          type="range"
          min="10"
          max="500"
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
        />
      </div>

      {steps.length > 0 && (
        <div className="stats">
          Comparison: {steps[currentStep].comparisons} | Swaps: {steps[currentStep].swaps}
        </div>
      )}

      <div className="array-container">
        {displayArray.map((value, index) => {
          const isComparing =
            steps.length > 0 &&
            (steps[currentStep].comparing[0] === index || steps[currentStep].comparing[1] === index)

          const isInRange =
            steps.length > 0 &&
            index >= steps[currentStep].range[0] &&
            index < steps[currentStep].range[1]

          const isSorted = steps.length > 0 && steps[currentStep].sorted.includes(index)

          const barClass = isSorted
            ? 'array-bar sorted'
            : isComparing
            ? 'array-bar comparing'
            : isInRange
            ? 'array-bar in-range'
            : 'array-bar'

          return (
            <div
              key={index}
              className={barClass}
              style={{ height: `${value * 4}px` }}
            ></div>
          )
        })}
      </div>
    </div>
  )
}

export default App