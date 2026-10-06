/**
 * @jest-environment jsdom
 */
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react'
import App from './App'

// Makes "random" arrays predictable so the tests always see the same bars
function mockRandom(values: number[]) {
  let call = 0
  jest.spyOn(Math, 'random').mockImplementation(() => values[call++ % values.length])
}

function bars(): HTMLElement[] {
  return Array.from(document.querySelectorAll<HTMLElement>('.array-bar'))
}

function barHeights(): number[] {
  return bars().map((bar) => parseInt(bar.style.height))
}

function button(name: string): HTMLButtonElement {
  return screen.getByRole('button', { name }) as HTMLButtonElement
}

function stats(): string {
  return document.querySelector('.stats')?.textContent ?? ''
}

function setSpeed(value: number) {
  fireEvent.change(screen.getByRole('slider'), { target: { value: String(value) } })
}

// Lets the animation run one timer tick at a time until it reaches the end
function runToEnd() {
  for (let i = 0; i < 2000 && !button('Next').disabled; i++) {
    act(() => {
      jest.advanceTimersByTime(500)
    })
  }
}

function isAscending(values: number[]): boolean {
  return values.every((value, i) => i === 0 || values[i - 1] <= value)
}

beforeEach(() => {
  jest.useFakeTimers()
  mockRandom([0.42, 0.07, 0.93, 0.15, 0.66, 0.31, 0.88, 0.02, 0.54, 0.77])
})

afterEach(() => {
  cleanup()
  jest.useRealTimers()
  jest.restoreAllMocks()
})

describe('starting screen', () => {
  test('shows the title', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'Sorting Visualiser' })).toBeTruthy()
  })

  test('draws 20 bars', () => {
    render(<App />)
    expect(bars()).toHaveLength(20)
  })

  test('bar heights are 4px per unit of value (values 5 to 104)', () => {
    render(<App />)
    for (const height of barHeights()) {
      expect(height % 4).toBe(0)
      expect(height).toBeGreaterThanOrEqual(5 * 4)
      expect(height).toBeLessThanOrEqual(104 * 4)
    }
  })

  test('no bars are highlighted before sorting', () => {
    render(<App />)
    for (const bar of bars()) {
      expect(bar.className).toBe('array-bar')
    }
  })

  test('stats are hidden before sorting', () => {
    render(<App />)
    expect(document.querySelector('.stats')).toBeNull()
  })

  test('Previous and Next are disabled before sorting', () => {
    render(<App />)
    expect(button('Previous').disabled).toBe(true)
    expect(button('Next').disabled).toBe(true)
  })

  test('bubble sort is selected by default', () => {
    render(<App />)
    expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe('bubble')
  })
})

describe('New Array button', () => {
  test('replaces the bars with a new random array', () => {
    render(<App />)
    const before = barHeights()

    mockRandom([0.11, 0.99, 0.5, 0.25])
    fireEvent.click(button('New Array'))

    expect(barHeights()).toHaveLength(20)
    expect(barHeights()).not.toEqual(before)
  })

  test('stops a running sort and clears the stats', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    expect(stats()).not.toBe('')

    fireEvent.click(button('New Array'))

    expect(document.querySelector('.stats')).toBeNull()
    expect(button('Next').disabled).toBe(true)
  })
})

describe('Sort button', () => {
  test('shows the stats starting from the first comparison', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    expect(stats()).toBe('Comparison: 1 | Swaps: 0')
  })

  test('highlights the first two bars being compared', () => {
    render(<App />)
    fireEvent.click(button('Sort'))

    const highlighted = bars().filter((bar) => bar.classList.contains('comparing'))
    expect(highlighted).toEqual([bars()[0], bars()[1]])
  })

  test('animates on its own over time', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    const before = stats()

    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(stats()).not.toBe(before)
  })

  test('ends with every bar sorted in ascending order', () => {
    render(<App />)
    setSpeed(500)
    fireEvent.click(button('Sort'))
    runToEnd()

    expect(isAscending(barHeights())).toBe(true)
    for (const bar of bars()) {
      expect(bar.classList.contains('sorted')).toBe(true)
    }
  })
})

describe('algorithm dropdown', () => {
  test.each(['bubble', 'selection', 'insertion', 'merge', 'quick'])(
    '%s sort can be picked and sorts the bars',
    (algorithm) => {
      render(<App />)
      fireEvent.change(screen.getByRole('combobox'), { target: { value: algorithm } })
      setSpeed(500)
      fireEvent.click(button('Sort'))
      runToEnd()

      expect((screen.getByRole('combobox') as HTMLSelectElement).value).toBe(algorithm)
      expect(isAscending(barHeights())).toBe(true)
    },
  )

  test('different algorithms report different stats for the same array', () => {
    render(<App />)
    setSpeed(500)
    fireEvent.click(button('Sort'))
    runToEnd()
    const bubbleStats = stats()

    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'merge' } })
    fireEvent.click(button('Sort'))
    runToEnd()

    expect(stats()).not.toBe(bubbleStats)
  })
})

describe('Pause / Play button', () => {
  test('says Pause at first and switches to Play when clicked', () => {
    render(<App />)
    fireEvent.click(button('Pause'))
    expect(button('Play')).toBeTruthy()

    fireEvent.click(button('Play'))
    expect(button('Pause')).toBeTruthy()
  })

  test('pausing freezes the animation', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    fireEvent.click(button('Pause'))
    const frozen = stats()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(stats()).toBe(frozen)
  })

  test('pressing Play carries on from where it stopped', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    fireEvent.click(button('Pause'))
    const frozen = stats()

    fireEvent.click(button('Play'))
    act(() => {
      jest.advanceTimersByTime(500)
    })

    expect(stats()).not.toBe(frozen)
  })
})

describe('Previous / Next buttons', () => {
  test('Next moves forward one step and pauses', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    fireEvent.click(button('Next'))

    expect(stats()).toBe('Comparison: 1 | Swaps: 1')
    expect(button('Play')).toBeTruthy()
  })

  test('Previous goes back one step', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    fireEvent.click(button('Next'))
    fireEvent.click(button('Next'))
    const afterTwo = stats()

    fireEvent.click(button('Previous'))
    expect(stats()).not.toBe(afterTwo)

    fireEvent.click(button('Previous'))
    expect(stats()).toBe('Comparison: 1 | Swaps: 0')
  })

  test('Previous is disabled on the first step', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    expect(button('Previous').disabled).toBe(true)

    fireEvent.click(button('Next'))
    expect(button('Previous').disabled).toBe(false)
  })

  test('Next is disabled on the last step', () => {
    render(<App />)
    setSpeed(500)
    fireEvent.click(button('Sort'))
    runToEnd()

    expect(button('Next').disabled).toBe(true)
    expect(button('Previous').disabled).toBe(false)
  })

  test('stepping does not run on by itself while paused', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    fireEvent.click(button('Next'))
    const afterNext = stats()

    act(() => {
      jest.advanceTimersByTime(5000)
    })

    expect(stats()).toBe(afterNext)
  })
})

describe('speed slider', () => {
  test('starts at 100', () => {
    render(<App />)
    expect((screen.getByRole('slider') as HTMLInputElement).value).toBe('100')
  })

  test('goes from 10 to 500', () => {
    render(<App />)
    const slider = screen.getByRole('slider') as HTMLInputElement
    expect(slider.min).toBe('10')
    expect(slider.max).toBe('500')
  })

  test('at speed 100 a step takes 410ms', () => {
    render(<App />)
    fireEvent.click(button('Sort'))
    const start = stats()

    act(() => {
      jest.advanceTimersByTime(409)
    })
    expect(stats()).toBe(start)

    act(() => {
      jest.advanceTimersByTime(1)
    })
    expect(stats()).not.toBe(start)
  })

  test('at max speed a step takes only 10ms', () => {
    render(<App />)
    setSpeed(500)
    fireEvent.click(button('Sort'))
    const start = stats()

    act(() => {
      jest.advanceTimersByTime(10)
    })

    expect(stats()).not.toBe(start)
  })
})
