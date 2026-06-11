import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';

class OfflineCache {
  static const _tripsKey     = 'cache_my_trips';
  static const _tripPrefix   = 'cache_trip_';
  static const _profileKey   = 'cache_profile';
  static const _queueKey     = 'offline_action_queue';

  // ── Trips list ──────────────────────────────────────────────────────────────
  static Future<void> saveTrips(List<dynamic> trips) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_tripsKey, jsonEncode(trips));
  }

  static Future<List<dynamic>> loadTrips() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_tripsKey);
    if (raw == null) return [];
    return jsonDecode(raw) as List<dynamic>;
  }

  // ── Single trip ─────────────────────────────────────────────────────────────
  static Future<void> saveTrip(String tripId, Map<String, dynamic> trip) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('$_tripPrefix$tripId', jsonEncode(trip));
  }

  static Future<Map<String, dynamic>?> loadTrip(String tripId) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString('$_tripPrefix$tripId');
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  // ── Profile ─────────────────────────────────────────────────────────────────
  static Future<void> saveProfile(Map<String, dynamic> profile) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_profileKey, jsonEncode(profile));
  }

  static Future<Map<String, dynamic>?> loadProfile() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_profileKey);
    if (raw == null) return null;
    return jsonDecode(raw) as Map<String, dynamic>;
  }

  // ── Offline action queue ────────────────────────────────────────────────────
  // Actions that failed due to no connectivity are queued and retried on reconnect
  static Future<void> enqueue(Map<String, dynamic> action) async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_queueKey);
    final queue = raw != null ? jsonDecode(raw) as List<dynamic> : [];
    queue.add({...action, 'queuedAt': DateTime.now().toIso8601String()});
    await prefs.setString(_queueKey, jsonEncode(queue));
  }

  static Future<List<Map<String, dynamic>>> loadQueue() async {
    final prefs = await SharedPreferences.getInstance();
    final raw = prefs.getString(_queueKey);
    if (raw == null) return [];
    return (jsonDecode(raw) as List<dynamic>)
        .map((e) => Map<String, dynamic>.from(e as Map))
        .toList();
  }

  static Future<void> clearQueue() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_queueKey);
  }
}
