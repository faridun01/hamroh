import 'package:flutter_test/flutter_test.dart';

void main() {
  test('total price equals price per seat times selected seats', () {
    const pricePerSeat = 120;
    const selectedSeats = 2;

    expect(pricePerSeat * selectedSeats, 240);
  });
}
