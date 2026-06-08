import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  static const String baseUrl = 'http://localhost:3000/api';

  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('token');
  }

  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('token', token);
  }

  static Future<void> clearToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('token');
  }

  static Future<Map<String, String>> _headers({bool json = true}) async {
    final token = await getToken();
    return {
      if (json) 'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    };
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> register(
      String name, String fatherName, String grandfatherName,
      String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'name': name,
        'fatherName': fatherName,
        'grandfatherName': grandfatherName,
        'email': email,
        'password': password,
        'role': 'driver',
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> login(
      String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    return jsonDecode(response.body);
  }

  // ── Driver profile ────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> registerDriverProfile(
      String phone, String licenseNumber, String vehicleModel,
      String vehiclePlate) async {
    final response = await http.post(
      Uri.parse('$baseUrl/drivers/register'),
      headers: await _headers(),
      body: jsonEncode({
        'phone': phone,
        'licenseNumber': licenseNumber,
        'vehicleModel': vehicleModel,
        'vehiclePlate': vehiclePlate,
      }),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>?> getMyDriverProfile() async {
    final response = await http.get(
      Uri.parse('$baseUrl/drivers/me'),
      headers: await _headers(json: false),
    );
    if (response.statusCode == 200) return jsonDecode(response.body);
    return null;
  }

  static Future<Map<String, dynamic>> toggleOnline(String driverId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/drivers/$driverId/toggle-online'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }

  // ── Trips ─────────────────────────────────────────────────────────────────

  static Future<List<dynamic>> getAvailableTrips() async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips'),
      headers: await _headers(json: false),
    );
    final data = jsonDecode(response.body);
    if (data is List) {
      return data.where((t) => t['status'] == 'requested').toList();
    }
    return [];
  }

  static Future<List<dynamic>> getMyTrips() async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips/my'),
      headers: await _headers(json: false),
    );
    final data = jsonDecode(response.body);
    if (data is List) return data;
    return [];
  }

  static Future<Map<String, dynamic>> getTrip(String tripId) async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips/$tripId'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> acceptTrip(String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/accept'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> markArrived(String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/arrived'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> startTrip(String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/start'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> completeTrip(
      String tripId, double baseFare) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/complete'),
      headers: await _headers(),
      body: jsonEncode({'baseFare': baseFare}),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> reportCustomerNoShow(
      String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/customer-no-show'),
      headers: await _headers(json: false),
    );
    return jsonDecode(response.body);
  }
}
