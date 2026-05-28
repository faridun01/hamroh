/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const FLUTTER_CODE = {
  models: `// lib/models/hamroh_models.dart
import 'dart:convert';

enum UserRole { Passenger, Driver, Admin }
enum VerificationStatus { PendingVerification, Verified, Rejected, Suspended, Banned }
enum BookingStatus { Pending, Accepted, Rejected, CancelledByPassenger, CancelledByDriver, Completed, Disputed, NoShowPassenger, NoShowDriver }
enum TripStatus { Draft, Published, Full, Started, Completed, Cancelled, BlockedByAdmin }

class User {
  final String id;
  final String fullName;
  final String phone;
  final UserRole role;
  final String language; // 'RU' or 'TJ'
  final String city;
  final String avatarUrl;
  final bool isActive;

  User({
    required this.id,
    required this.fullName,
    required this.phone,
    required this.role,
    required this.language,
    required this.city,
    required this.avatarUrl,
    required this.isActive,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'],
    fullName: json['fullName'],
    phone: json['phone'],
    role: UserRole.values.firstWhere((e) => e.toString().split('.').last == json['role']),
    language: json['language'],
    city: json['city'],
    avatarUrl: json['avatarUrl'] ?? '',
    isActive: json['isActive'] ?? true,
  );

  Map<String, dynamic> toJson() => {
    'id': id,
    'fullName': fullName,
    'phone': phone,
    'role': role.toString().split('.').last,
    'language': language,
    'city': city,
    'avatarUrl': avatarUrl,
    'isActive': isActive,
  };
}`,

  apiService: `// lib/services/api_service.dart
import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/hamroh_models.dart';

class ApiService {
  static const String baseUrl = 'https://api.hamroh.tj/api';
  String? _jwtToken;

  Future<bool> sendOtp(String phone) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/send-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone}),
    );
    return response.statusCode == 200;
  }

  Future<Map<String, dynamic>?> verifyOtp(String phone, String code) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'phone': phone, 'code': code}),
    );

    if (response.statusCode == 200) {
      final resBody = jsonDecode(response.body);
      _jwtToken = resBody['token'];
      return resBody;
    }
    return null;
  }

  Future<List<dynamic>> searchTrips({
    required String fromCity,
    required String toCity,
    required String date,
    required int seats,
  }) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips/search?from=$fromCity&to=$toCity&date=$date&seats=$seats'),
      headers: {
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      },
    );

    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    }
    throw Exception('Failed to load trips');
  }

  Future<bool> bookTrip(String tripId, int seatsCount, String message) async {
    final response = await http.post(
      Uri.parse('$baseUrl/bookings'),
      headers: {
        'Content-Type': 'application/json',
        if (_jwtToken != null) 'Authorization': 'Bearer $_jwtToken',
      },
      body: jsonEncode({
        'tripId': tripId,
        'seatsCount': seatsCount,
        'passengerMessage': message,
      }),
    );
    return response.statusCode == 201;
  }
}`,

  tripSearchScreen: `// lib/screens/trip_search_screen.dart
import 'package:flutter/material.dart';
import '../services/api_service.dart';

class TripSearchScreen extends StatefulWidget {
  @override
  _TripSearchScreenState createState() => _TripSearchScreenState();
}

class _TripSearchScreenState extends State<TripSearchScreen> {
  String fromCity = 'Душанбе';
  String toCity = 'Худжанд';
  DateTime selectedDate = DateTime.now();
  int seats = 1;

  final List<String> cities = ['Душанбе', 'Худжанд', 'Бохтар', 'Куляб', 'Панджакент', 'Турсунзода', 'Истаравшан', 'Исфара', 'Канибадам'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Hamroh - Поиск Поездок', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: Colors.teal,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            Card(
              elevation: 4,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  children: [
                    DropdownButtonFormField<String>(
                      value: fromCity,
                      decoration: InputDecoration(labelText: 'Откуда', icon: Icon(Icons.location_on, color: Colors.teal)),
                      items: cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                      onChanged: (val) => setState(() => fromCity = val!),
                    ),
                    SizedBox(height: 12),
                    DropdownButtonFormField<String>(
                      value: toCity,
                      decoration: InputDecoration(labelText: 'Куда', icon: Icon(Icons.navigation, color: Colors.teal)),
                      items: cities.map((c) => DropdownMenuItem(value: c, child: Text(c))).toList(),
                      onChanged: (val) => setState(() => toCity = val!),
                    ),
                    SizedBox(height: 16),
                    Row(
                      children: [
                        Icon(Icons.calendar_today, color: Colors.teal),
                        SizedBox(width: 12),
                        Text(
                          "Дата: \${selectedDate.year}-\${selectedDate.month}-\${selectedDate.day}",
                          style: TextStyle(fontSize: 16),
                        ),
                        Spacer(),
                        TextButton(
                          onPressed: () async {
                            final picked = await showDatePicker(
                              context: context,
                              initialDate: selectedDate,
                              firstDate: DateTime.now(),
                              lastDate: DateTime.now().add(Duration(days: 30)),
                            );
                            if (picked != null) setState(() => selectedDate = picked);
                          },
                          child: Text('Выбрать'),
                        )
                      ],
                    ),
                  ],
                ),
              ),
            ),
            SizedBox(height: 20),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.teal,
                minimumSize: Size(double.infinity, 50),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
              ),
              onPressed: () {
                // Trigger API trip search and display results
              },
              child: Text('Найти поездку', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}`
};

export const ASPNET_CODE = {
  dbContext: `// Data/ApplicationDbContext.cs
using Microsoft.EntityFrameworkCore;
using HamrohApi.Models;

namespace HamrohApi.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<PassengerProfile> PassengerProfiles { get; set; }
        public DbSet<DriverProfile> DriverProfiles { get; set; }
        public DbSet<Vehicle> Vehicles { get; set; }
        public DbSet<Trip> Trips { get; set; }
        public DbSet<Booking> Bookings { get; set; }
        public DbSet<Review> Reviews { get; set; }
        public DbSet<Complaint> Complaints { get; set; }
        public DbSet<City> Cities { get; set; }
        public DbSet<Route> Routes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            
            // Relational configuring for ride sharing database rules
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Phone)
                .IsUnique();

            modelBuilder.Entity<Trip>()
                .HasOne<User>()
                .WithMany()
                .HasForeignKey(t => t.DriverId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Booking>()
                .HasOne<Trip>()
                .WithMany()
                .HasForeignKey(b => b.TripId)
                .OnDelete(DeleteBehavior.Cascade);
        }
    }
}`,

  models: `// Models/HamrohModels.cs
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace HamrohApi.Models
{
    public enum UserRole { Passenger, Driver, Admin }
    public enum VerificationStatus { PendingVerification, Verified, Rejected, Suspended, Banned }
    public enum BookingStatus { Pending, Accepted, Rejected, CancelledByPassenger, CancelledByDriver, Completed, Disputed }
    public enum TripStatus { Draft, Published, Full, Started, Completed, Cancelled }

    public class User
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        [Required, MaxLength(100)]
        public string FullName { get; set; }
        [Required, MaxLength(20)]
        public string Phone { get; set; }
        public UserRole Role { get; set; }
        public string Language { get; set; } = "RU"; // RU or TJ
        public string City { get; set; }
        public string AvatarUrl { get; set; }
        public bool IsActive { get; set; } = true;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }

    public class Vehicle
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DriverId { get; set; }
        [Required]
        public string Brand { get; set; }
        [Required]
        public string Model { get; set; }
        public string Color { get; set; }
        [Required]
        public string PlateNumber { get; set; }
        public int Seats { get; set; }
        public string PhotoUrl { get; set; }
        public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.PendingVerification;
    }

    public class Trip
    {
        [Key]
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid DriverId { get; set; }
        public Guid VehicleId { get; set; }
        public string FromCity { get; set; }
        public string ToCity { get; set; }
        public DateTime DepartureDate { get; set; }
        public string DepartureTime { get; set; }
        public string PickupPoint { get; set; }
        public string DropoffPoint { get; set; }
        public decimal PricePerSeat { get; set; }
        public int TotalSeats { get; set; }
        public int AvailableSeats { get; set; }
        public TripStatus Status { get; set; } = TripStatus.Published;
        public bool AllowBaggage { get; set; }
        public bool AllowChildren { get; set; }
        public bool SmokingAllowed { get; set; }
        public bool AirConditioner { get; set; }
    }
}`,

  controller: `// Controllers/TripsController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using HamrohApi.Data;
using HamrohApi.Models;

namespace HamrohApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TripsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public TripsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string from, [FromQuery] string to, [FromQuery] DateTime date, [FromQuery] int seats = 1)
        {
            var trips = await _context.Trips
                .Where(t => t.FromCity == @from 
                         && t.ToCity == to 
                         && t.DepartureDate.Date == date.Date 
                         && t.AvailableSeats >= seats 
                         && t.Status == TripStatus.Published)
                .OrderBy(t => t.DepartureTime)
                .ToListAsync();

            return Ok(trips);
        }

        [Authorize(Roles = "Driver")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] Trip trip)
        {
            // Validate the driver's profile is fully verified before allowing trip creation
            var driverId = Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            var driverProfile = await _context.DriverProfiles
                .FirstOrDefaultAsync(d => d.UserId == driverId);

            if (driverProfile == null || driverProfile.VerificationStatus != VerificationStatus.Verified)
            {
                return BadRequest("Only verified drivers can publish trips on Hamroh.");
            }

            trip.DriverId = driverId;
            trip.AvailableSeats = trip.TotalSeats;
            trip.Status = TripStatus.Published;

            _context.Trips.Add(trip);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(Search), new { id = trip.Id }, trip);
        }
    }
}`
};
