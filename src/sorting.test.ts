import {
  bubbleSortWithSteps,
  selectionSortWithSteps,
  insertionSortWithSteps,
  mergeSortWithSteps,
  quickSortWithSteps,
} from './App'
import type { SortStep } from './App'

function isSorted(arr: number[]): boolean {
  for (let i = 0; i < arr.length - 1; i++) {
    if (arr[i] > arr[i + 1]) return false
  }
  return true
}

function lastStep(steps: SortStep[]): SortStep {
  return steps[steps.length - 1]
}

function countInversions(arr: number[]): number {
  let count = 0
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] > arr[j]) count++
    }
  }
  return count
}

const algorithms: [string, (arr: number[]) => SortStep[]][] = [
  ['bubble sort', bubbleSortWithSteps],
  ['selection sort', selectionSortWithSteps],
  ['insertion sort', insertionSortWithSteps],
  ['merge sort', mergeSortWithSteps],
  ['quick sort', quickSortWithSteps],
]

const inputs: [string, number[]][] = [
  ['a random array', [5, 2, 8, 1, 9, 3]],
  ['an already sorted array', [1, 2, 3, 4, 5]],
  ['a reversed array', [9, 7, 5, 3, 1]],
  ['an array with duplicates', [4, 2, 4, 1, 2, 4]],
  ['an array of identical values', [7, 7, 7, 7]],
  ['a single element', [42]],
  ['two elements', [2, 1]],
  ['an array of 20 values like the app makes', [56, 12, 99, 5, 73, 41, 88, 20, 64, 33, 101, 8, 47, 90, 15, 62, 29, 77, 104, 36]],
]

describe.each(algorithms)('%s', (_name, sortWithSteps) => {
  test.each(inputs)('sorts %s', (_label, input) => {
    const finalArray = lastStep(sortWithSteps(input)).array

    expect(isSorted(finalArray)).toBe(true)
    expect(finalArray).toEqual([...input].sort((a, b) => a - b))
  })

  test('does not change the array passed in', () => {
    const input = [5, 2, 8, 1, 9, 3]
    sortWithSteps(input)

    expect(input).toEqual([5, 2, 8, 1, 9, 3])
  })

  test('every step only shows values from the input', () => {
    const input = [5, 2, 8, 1, 9, 3]

    for (const step of sortWithSteps(input)) {
      expect(step.array).toHaveLength(input.length)
      for (const value of step.array) {
        expect(input).toContain(value)
      }
    }
  })

  test('each step has its own copy of the array', () => {
    const steps = sortWithSteps([5, 2, 8, 1, 9, 3])

    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].array).not.toBe(steps[i - 1].array)
    }
  })

  test('the last step marks every bar as sorted', () => {
    const input = [5, 2, 8, 1, 9, 3]
    const sorted = lastStep(sortWithSteps(input)).sorted

    expect([...sorted].sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5])
  })

  test('comparison and swap counters never go down', () => {
    const steps = sortWithSteps([5, 2, 8, 1, 9, 3])

    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].comparisons).toBeGreaterThanOrEqual(steps[i - 1].comparisons)
      expect(steps[i].swaps).toBeGreaterThanOrEqual(steps[i - 1].swaps)
    }
  })

  test('highlighted bars and ranges stay inside the array', () => {
    const input = [5, 2, 8, 1, 9, 3]

    for (const step of sortWithSteps(input)) {
      for (const index of step.comparing) {
        // -1 means "nothing is being compared"
        expect(index).toBeGreaterThanOrEqual(-1)
        expect(index).toBeLessThan(input.length)
      }
      expect(step.range[0]).toBeGreaterThanOrEqual(0)
      expect(step.range[1]).toBeLessThanOrEqual(input.length)
      expect(step.range[0]).toBeLessThanOrEqual(step.range[1])
    }
  })

  test('produces steps to animate', () => {
    expect(sortWithSteps([3, 1, 2]).length).toBeGreaterThan(0)
  })
})

// Swap-based sorts only ever swap two bars, so every frame is a reordering of the input.
// Merge sort is left out: it copies values back one at a time, so mid-merge a value
// can briefly appear twice while another is missing.
describe.each(algorithms.filter(([name]) => name !== 'merge sort'))('%s', (_name, sortWithSteps) => {
  test('every step holds the same values as the input, just reordered', () => {
    const input = [5, 2, 8, 1, 9, 3]
    const expected = [...input].sort((a, b) => a - b)

    for (const step of sortWithSteps(input)) {
      expect([...step.array].sort((a, b) => a - b)).toEqual(expected)
    }
  })
})

describe('bubble sort counters', () => {
  test('compares every pair once per pass: n(n-1)/2 comparisons', () => {
    const input = [5, 2, 8, 1, 9, 3]
    expect(lastStep(bubbleSortWithSteps(input)).comparisons).toBe(15)
  })

  test('makes one swap per out-of-order pair', () => {
    const input = [5, 2, 8, 1, 9, 3]
    expect(lastStep(bubbleSortWithSteps(input)).swaps).toBe(countInversions(input))
  })

  test('makes no swaps on an already sorted array', () => {
    expect(lastStep(bubbleSortWithSteps([1, 2, 3, 4])).swaps).toBe(0)
  })

  test('highlights the first two bars on the first step', () => {
    expect(bubbleSortWithSteps([3, 1, 2])[0].comparing).toEqual([0, 1])
  })
})

describe('selection sort counters', () => {
  test('always makes n(n-1)/2 comparisons', () => {
    expect(lastStep(selectionSortWithSteps([5, 2, 8, 1, 9, 3])).comparisons).toBe(15)
    expect(lastStep(selectionSortWithSteps([1, 2, 3, 4, 5, 6])).comparisons).toBe(15)
  })

  test('makes at most n-1 swaps', () => {
    expect(lastStep(selectionSortWithSteps([9, 7, 5, 3, 1])).swaps).toBeLessThanOrEqual(4)
  })

  test('makes no swaps on an already sorted array', () => {
    expect(lastStep(selectionSortWithSteps([1, 2, 3, 4])).swaps).toBe(0)
  })
})

describe('insertion sort counters', () => {
  test('makes one swap per out-of-order pair', () => {
    const input = [5, 2, 8, 1, 9, 3]
    expect(lastStep(insertionSortWithSteps(input)).swaps).toBe(countInversions(input))
  })

  test('only needs n-1 comparisons on an already sorted array', () => {
    expect(lastStep(insertionSortWithSteps([1, 2, 3, 4, 5])).comparisons).toBe(4)
  })
})

describe('merge sort counters', () => {
  test('makes fewer comparisons than bubble sort on a big array', () => {
    const input = Array.from({ length: 50 }, (_, i) => (i * 37) % 50)
    const merge = lastStep(mergeSortWithSteps(input)).comparisons
    const bubble = lastStep(bubbleSortWithSteps(input)).comparisons

    expect(merge).toBeLessThan(bubble)
  })
})

describe('quick sort counters', () => {
  test('makes fewer comparisons than bubble sort on a shuffled array', () => {
    const input = Array.from({ length: 50 }, (_, i) => (i * 37) % 50)
    const quick = lastStep(quickSortWithSteps(input)).comparisons
    const bubble = lastStep(bubbleSortWithSteps(input)).comparisons

    expect(quick).toBeLessThan(bubble)
  })

  test('marks each pivot as sorted once it is in place', () => {
    const steps = quickSortWithSteps([3, 1, 2])
    const firstPivotStep = steps.find((step) => step.sorted.length > 0)

    expect(firstPivotStep).toBeDefined()
    expect(firstPivotStep!.array[firstPivotStep!.sorted[0]]).toBe(2)
  })
})
