import { wmoIcon } from '../services/weather'

test('clear sky returns sun emoji', () => {
  expect(wmoIcon(0)).toBe('☀️')
})

test('partly cloudy codes return cloud-sun emoji', () => {
  expect(wmoIcon(1)).toBe('🌤️')
  expect(wmoIcon(2)).toBe('🌤️')
  expect(wmoIcon(3)).toBe('🌤️')
})

test('fog codes return fog emoji', () => {
  expect(wmoIcon(45)).toBe('🌫️')
  expect(wmoIcon(48)).toBe('🌫️')
})

test('rain codes return rain emoji', () => {
  expect(wmoIcon(61)).toBe('🌧️')
  expect(wmoIcon(65)).toBe('🌧️')
})

test('snow codes return snow emoji', () => {
  expect(wmoIcon(71)).toBe('❄️')
  expect(wmoIcon(77)).toBe('❄️')
})

test('shower codes return cloud-rain emoji', () => {
  expect(wmoIcon(80)).toBe('🌦️')
  expect(wmoIcon(82)).toBe('🌦️')
})

test('thunderstorm codes return lightning emoji', () => {
  expect(wmoIcon(95)).toBe('⛈️')
  expect(wmoIcon(99)).toBe('⛈️')
})

test('unknown code returns thermometer emoji', () => {
  expect(wmoIcon(999)).toBe('🌡️')
})
