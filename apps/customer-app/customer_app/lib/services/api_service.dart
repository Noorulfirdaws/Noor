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

  static Future<Map<String, dynamic>> requestTrip(
      String pickup, String dropoff) async {
    final token = await getToken();
    final response = await http.post(
      Uri.parse('$baseUrl/trips/request'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'pickupLocation': pickup, 'dropoffLocation': dropoff}),
    );
    return jsonDecode(response.body);
  }

  static Future<List<dynamic>> getMyTrips() async {
    final token = await getToken();
    final response = await http.get(
      Uri.parse('$baseUrl/trips/my'),
      headers: {'Authorization': 'Bearer $token'},
    );
    final data = jsonDecode(response.body);
    if (data is List) return data;
    return [];
  }

  static Future<Map<String, dynamic>> cancelTrip(String tripId) async {
    final token = await getToken();
    final response = await http.put(
      Uri.parse('$baseUrl/trips/$tripId/cancel'),
      headers: {'Authorization': 'Bearer $token'},
    );
    return jsonDecode(response.body);
  }
}