/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export enum UserRole {
  Passenger = 'Passenger',
  Driver = 'Driver',
  Admin = 'Admin'
}

export enum Language {
  RU = 'RU',
  TJ = 'TJ',
  EN = 'EN'
}

export enum VerificationStatus {
  PendingVerification = 'PendingVerification',
  Verified = 'Verified',
  Rejected = 'Rejected',
  Suspended = 'Suspended',
  Banned = 'Banned'
}

export enum BookingStatus {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Rejected = 'Rejected',
  CancelledByPassenger = 'CancelledByPassenger',
  CancelledByDriver = 'CancelledByDriver',
  Completed = 'Completed',
  Disputed = 'Disputed',
  NoShowPassenger = 'NoShowPassenger',
  NoShowDriver = 'NoShowDriver'
}

export enum TripStatus {
  Draft = 'Draft',
  Published = 'Published',
  Full = 'Full',
  BookingPending = 'BookingPending',
  Accepted = 'Accepted',
  Started = 'Started',
  Completed = 'Completed',
  Cancelled = 'Cancelled',
  NoShowPassenger = 'NoShowPassenger',
  NoShowDriver = 'NoShowDriver',
  Disputed = 'Disputed',
  BlockedByAdmin = 'BlockedByAdmin'
}

export enum ComplaintType {
  DriverDidNotArrive = 'DriverDidNotArrive',
  PassengerDidNotArrive = 'PassengerDidNotArrive',
  UnsafeDriving = 'UnsafeDriving',
  PriceChanged = 'PriceChanged',
  RudeBehavior = 'RudeBehavior',
  PaymentProblem = 'PaymentProblem',
  LostItem = 'LostItem',
  FakeProfile = 'FakeProfile',
  WrongCar = 'WrongCar',
  Other = 'Other'
}

export enum ComplaintStatus {
  Open = 'Open',
  InReview = 'InReview',
  WaitingUser = 'WaitingUser',
  Resolved = 'Resolved',
  Rejected = 'Rejected'
}

export enum PaymentMethod {
  Cash = 'Cash',
  Alif = 'Alif',
  DushanbeCity = 'DushanbeCity',
  KortiMilli = 'KortiMilli',
  VisaMastercard = 'VisaMastercard'
}

export enum PaymentStatus {
  Pending = 'Pending',
  Completed = 'Completed',
  Refunded = 'Refunded'
}

export interface User {
  id: string;
  fullName: string;
  phone: string;
  password?: string;
  gender: 'male' | 'female';
  role: UserRole;
  language: Language;
  city: string;
  avatarUrl: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PassengerProfile {
  id: string;
  userId: string;
  rating: number;
  totalTrips: number;
}

export interface DriverProfile {
  id: string;
  userId: string;
  verificationStatus: VerificationStatus;
  licenseNumber: string;
  licensePhotoUrl: string;
  idDocumentUrl: string;
  rating: number;
  totalTrips: number;
  cancellationRate: number;
}

export interface Vehicle {
  id: string;
  driverId: string;
  brand: string;
  model: string;
  color: string;
  plateNumber: string;
  seats: number;
  photoUrl: string;
  verificationStatus: VerificationStatus;
}

export interface Trip {
  id: string;
  driverId: string;
  vehicleId: string;
  fromCity: string;
  toCity: string;
  departureDate: string;
  departureTime: string;
  pickupPoint: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffPoint: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  intermediateStops: string[];
  pricePerSeat: number;
  pricingMode?: 'flat' | 'row';
  frontSeatPrice?: number;
  secondRowPrice?: number;
  thirdRowPrice?: number;
  totalSeats: number;
  availableSeats: number;
  status: TripStatus;
  allowBaggage: boolean;
  allowChildren: boolean;
  smokingAllowed: boolean;
  airConditioner: boolean;
  musicAllowed: boolean;
  familyFriendly: boolean;
  womenFriendly?: boolean;
  comment: string;
}

export interface Booking {
  id: string;
  tripId: string;
  passengerId: string;
  seatsCount: number;
  status: BookingStatus;
  totalPrice: number;
  passengerMessage: string;
  seatRow?: 'front' | 'second' | 'third';
  createdAt?: string;
  driverAcceptedAt?: string;
  cancellationDeadlineAt?: string;
  passengerFinalConfirmedAt?: string;
  driverFinalConfirmedAt?: string;
}

export interface PassengerRequest {
  id: string;
  passengerId: string;
  fromCity: string;
  toCity: string;
  pickupAddress: string;
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropoffAddress: string;
  dropoffLatitude?: number;
  dropoffLongitude?: number;
  departureDate: string;
  departureTime: string;
  seatsCount: number;
  baggageAllowed?: boolean;
  genderPreference?: 'male' | 'female' | 'any';
  desiredPrice?: number;
  comment?: string;
  status: 'pending' | 'accepted' | 'cancelled';
  createdAt: string;
  acceptedByDriverId?: string;
}

export interface Review {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  safetyRating?: number;
  punctualityRating?: number;
  cleanlinessRating?: number;
  politenessRating?: number;
  comment: string;
  createdAt: string;
}

export interface Complaint {
  id: string;
  userId: string;
  tripId: string;
  bookingId?: string;
  type: ComplaintType;
  description: string;
  status: ComplaintStatus;
  adminNote?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  tripId?: string;
  bookingId?: string;
  requestId?: string;
  chatUserId?: string;
  isRead: boolean;
  createdAt: string;
}

export interface Payment {
  id: string;
  bookingId: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

export interface City {
  id: string;
  nameRu: string;
  nameTj: string;
  nameEn?: string;
  isActive: boolean;
}

export interface Route {
  id: string;
  fromCityId: string;
  toCityId: string;
  recommendedMinPrice: number;
  recommendedMaxPrice: number;
  isActive: boolean;
}

export interface SuggestedDirection {
  id: string;
  userId: string;
  userFullName: string;
  type: 'city' | 'route';
  nameRu: string;
  nameTj: string;
  nameEn?: string;
  details: string; // detailed manual explanation/directions
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
}
