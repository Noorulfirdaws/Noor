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

  static Future<Map<String, String>> _authHeaders({bool json = true}) async {
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

  // ── Trips ─────────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> requestTrip(
      String pickup, String dropoff) async {
    final response = await http.post(
      Uri.parse('$baseUrl/trips/request'),
      headers: await _authHeaders(),
      body: jsonEncode({'pickupLocation': pickup, 'dropoffLocation': dropoff}),
    );
    return jsonDecode(response.body);
  }

  static Future<List<dynamic>> getMyTrips() async {
    final response = await http.get(
      Uri.parse('$baseUrl/trips/my'),
      headers: await _authHeaders(json: false),
    );
    final data = jsonDecode(response.body);
    if (data is List) return data;
    return [];
  }

  static Future<Map<String, dynamic>> cancelTrip(String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/cancel'),
      headers: await _authHeaders(json: false),
    );
    return jsonDecode(response.body);
  }

  static Future<Map<String, dynamic>> reportDriverNoShow(String tripId) async {
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/driver-no-show'),
      headers: await _authHeaders(json: false),
    );
    return jsonDecode(response.body);
  }

  // ── Reviews ───────────────────────────────────────────────────────────────

  static Future<Map<String, dynamic>> submitReview(
      String tripId, String driverId, int rating, String comment) async {
    final response = await http.post(
      Uri.parse('$baseUrl/reviews'),
      headers: await _authHeaders(),
      body: jsonEncode({
        'tripId': tripId,
        'driverId': driverId,
        'rating': rating,
        'comment': comment,
      }),
    );
    return jsonDecode(response.body);
  }

  // ── Local: rated trip IDs ─────────────────────────────────────────────────

  static Future<Set<String>> getRatedTripIds() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getStringList('rated_trips')?.toSet() ?? {};
  }

  static Future<void> markTripRated(String tripId) async {
    final prefs = await SharedPreferences.getInstance();
    final rated = prefs.getStringList('rated_trips') ?? [];
    if (!rated.contains(tripId)) {
      rated.add(tripId);
      await prefs.setStringList('rated_trips', rated);
    }
  }
}
