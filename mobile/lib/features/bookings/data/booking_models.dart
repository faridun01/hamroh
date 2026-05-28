class BookingDetails {
  const BookingDetails({
    required this.id,
    required this.status,
    required this.fromCity,
    required this.toCity,
    required this.departureDate,
    required this.departureTime,
    required this.seatsCount,
    required this.totalPrice,
    required this.driverName,
    required this.carInfo,
    required this.contactsVisible,
    required this.chatAvailable,
    this.plateNumber,
    this.driverPhone,
  });

  final String id;
  final String status;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final int seatsCount;
  final num totalPrice;
  final String driverName;
  final String carInfo;
  final String? plateNumber;
  final String? driverPhone;
  final bool contactsVisible;
  final bool chatAvailable;

  factory BookingDetails.fromJson(Map<String, dynamic> json) {
    return BookingDetails(
      id: json['id'] as String,
      status: json['status'].toString(),
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      seatsCount: json['seatsCount'] as int,
      totalPrice: json['totalPrice'] as num,
      driverName: json['driverName'] as String,
      carInfo: json['carInfo'] as String,
      plateNumber: json['plateNumber'] as String?,
      driverPhone: json['driverPhone'] as String?,
      contactsVisible: json['contactsVisible'] as bool,
      chatAvailable: json['chatAvailable'] as bool,
    );
  }
}

class BookingListItem {
  const BookingListItem({
    required this.id,
    required this.tripId,
    required this.status,
    required this.fromCity,
    required this.toCity,
    required this.departureDate,
    required this.departureTime,
    required this.seatsCount,
    required this.totalPrice,
  });

  final String id;
  final String tripId;
  final String status;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final int seatsCount;
  final num totalPrice;

  factory BookingListItem.fromJson(Map<String, dynamic> json) {
    return BookingListItem(
      id: json['id'] as String,
      tripId: json['tripId'] as String,
      status: json['status'].toString(),
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      seatsCount: json['seatsCount'] as int,
      totalPrice: json['totalPrice'] as num,
    );
  }
}
