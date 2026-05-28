class TripSummary {
  const TripSummary({
    required this.id,
    required this.fromCity,
    required this.toCity,
    required this.departureDate,
    required this.departureTime,
    required this.pricePerSeat,
    required this.availableSeats,
    required this.driverName,
    required this.vehicle,
    required this.allowBaggage,
    required this.womenFriendly,
  });

  final String id;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final num pricePerSeat;
  final int availableSeats;
  final String driverName;
  final String vehicle;
  final bool allowBaggage;
  final bool womenFriendly;

  factory TripSummary.fromJson(Map<String, dynamic> json) {
    return TripSummary(
      id: json['id'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      pricePerSeat: json['pricePerSeat'] as num,
      availableSeats: json['availableSeats'] as int,
      driverName: json['driverName'] as String,
      vehicle: json['vehicle'] as String,
      allowBaggage: json['allowBaggage'] as bool,
      womenFriendly: json['womenFriendly'] as bool,
    );
  }
}

class TripDetails {
  const TripDetails({
    required this.id,
    required this.fromCity,
    required this.toCity,
    required this.departureDate,
    required this.departureTime,
    required this.pickupPoint,
    this.pickupLatitude,
    this.pickupLongitude,
    required this.dropoffPoint,
    this.dropoffLatitude,
    this.dropoffLongitude,
    required this.pricePerSeat,
    required this.availableSeats,
    required this.totalSeats,
    required this.status,
    required this.driverName,
    required this.vehicle,
    required this.allowBaggage,
    required this.womenFriendly,
    required this.driverComment,
  });

  final String id;
  final String fromCity;
  final String toCity;
  final String departureDate;
  final String departureTime;
  final String pickupPoint;
  final double? pickupLatitude;
  final double? pickupLongitude;
  final String dropoffPoint;
  final double? dropoffLatitude;
  final double? dropoffLongitude;
  final num pricePerSeat;
  final int availableSeats;
  final int totalSeats;
  final String status;
  final String driverName;
  final String vehicle;
  final bool allowBaggage;
  final bool womenFriendly;
  final String driverComment;

  factory TripDetails.fromJson(Map<String, dynamic> json) {
    return TripDetails(
      id: json['id'] as String,
      fromCity: json['fromCity'] as String,
      toCity: json['toCity'] as String,
      departureDate: json['departureDate'] as String,
      departureTime: json['departureTime'] as String,
      pickupPoint: json['pickupPoint'] as String,
      pickupLatitude: (json['pickupLatitude'] as num?)?.toDouble(),
      pickupLongitude: (json['pickupLongitude'] as num?)?.toDouble(),
      dropoffPoint: json['dropoffPoint'] as String,
      dropoffLatitude: (json['dropoffLatitude'] as num?)?.toDouble(),
      dropoffLongitude: (json['dropoffLongitude'] as num?)?.toDouble(),
      pricePerSeat: json['pricePerSeat'] as num,
      availableSeats: json['availableSeats'] as int,
      totalSeats: json['totalSeats'] as int,
      status: json['status'].toString(),
      driverName: json['driverName'] as String,
      vehicle: json['vehicle'] as String,
      allowBaggage: json['allowBaggage'] as bool,
      womenFriendly: json['womenFriendly'] as bool,
      driverComment: json['driverComment'] as String,
    );
  }
}
