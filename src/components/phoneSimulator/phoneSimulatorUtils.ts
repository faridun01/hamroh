import type { Trip } from '../../types';

export type SeatRowKey = 'front' | 'second' | 'third';

export const money = (value: number) => `${value} сомони`;

export function timeToMinutes(value?: string) {
  if (!value || value === 'По наполнении') return 9999;
  const [hours = '0', minutes = '0'] = (value || '00:00').split(':');
  return Number(hours) * 60 + Number(minutes);
}

export function formatDuration(trip?: Trip) {
  if (!trip) return '4 ч 30 мин';
  const routeHours = trip.fromCity === 'Душанбе' && trip.toCity === 'Худжанд' ? 4 : 5;
  const extraMinutes = trip.pricePerSeat > 140 ? -15 : trip.pricePerSeat < 110 ? 25 : 0;
  const total = Math.max(180, routeHours * 60 + 30 + extraMinutes);
  return `${Math.floor(total / 60)} ч ${total % 60} мин`;
}

export function seatRowsForSeats(seats: number): Array<{ key: SeatRowKey; label: string; seats: number }> {
  const rows: Array<{ key: SeatRowKey; label: string; seats: number }> = [
    { key: 'front', label: 'Рядом с водителем', seats: 1 },
    { key: 'second', label: 'Второй ряд', seats: Math.min(3, Math.max(1, seats - 1)) }
  ];
  if (seats > 4) rows.push({ key: 'third', label: 'Третий ряд', seats: seats - 4 });
  return rows;
}

export function rowPriceForTrip(trip: Trip, row: SeatRowKey) {
  if (trip.pricingMode !== 'row') return trip.pricePerSeat;
  if (row === 'front') return trip.frontSeatPrice ?? trip.pricePerSeat;
  if (row === 'third') return trip.thirdRowPrice ?? trip.pricePerSeat;
  return trip.secondRowPrice ?? trip.pricePerSeat;
}

export function displayPriceForTrip(trip: Trip) {
  if (trip.pricingMode !== 'row') return trip.pricePerSeat;
  return Math.min(
    trip.frontSeatPrice ?? trip.pricePerSeat,
    trip.secondRowPrice ?? trip.pricePerSeat,
    trip.thirdRowPrice ?? trip.pricePerSeat
  );
}
