import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  Map<String, dynamic>? _user;
  Map<String, dynamic>? _driverProfile;
  bool _isLoading = false;
  String? _error;

  Map<String, dynamic>? get user => _user;
  Map<String, dynamic>? get driverProfile => _driverProfile;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _user != null;

  Future<bool> tryAutoLogin() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('token');
    final userStr = prefs.getString('user');
    if (token == null || userStr == null) return false;

    _user = jsonDecode(userStr);
    // Don't fail auto-login if profile fetch fails (e.g. offline)
    try {
      _driverProfile = await ApiService.getMyDriverProfile();
    } catch (_) {
      _driverProfile = null;
    }
    notifyListeners();
    return true;
  }

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.login(email, password);
      if (result['token'] != null) {
        _user = result['user'];
        await ApiService.saveToken(result['token']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(_user));
        // Fetch profile separately — don't block or fail login if unavailable
        try {
          _driverProfile = await ApiService.getMyDriverProfile();
        } catch (_) {
          _driverProfile = null;
        }
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Login failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> register(String name, String fatherName, String grandfatherName,
      String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.register(
          name, fatherName, grandfatherName, email, password);
      if (result['token'] != null) {
        _user = result['user'];
        await ApiService.saveToken(result['token']);
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(_user));
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> registerDriverProfile(String phone, String licenseNumber,
      String vehicleModel, String vehiclePlate) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.registerDriverProfile(
          phone, licenseNumber, vehicleModel, vehiclePlate);
      if (result['driver'] != null) {
        _driverProfile = result['driver'];
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Registration failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<bool> updateProfile(
      String name, String fatherName, String grandfatherName) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    try {
      final result = await ApiService.updateProfile(name, fatherName, grandfatherName);
      if (result['user'] != null) {
        _user = result['user'];
        final prefs = await SharedPreferences.getInstance();
        await prefs.setString('user', jsonEncode(_user));
        _isLoading = false;
        notifyListeners();
        return true;
      } else {
        _error = result['message'] ?? 'Update failed';
        _isLoading = false;
        notifyListeners();
        return false;
      }
    } catch (e) {
      _error = 'Connection error.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> refreshDriverProfile() async {
    try {
      _driverProfile = await ApiService.getMyDriverProfile();
      notifyListeners();
    } catch (_) {
      // Silently fail — keep stale profile rather than crashing
    }
  }

  Future<void> logout() async {
    _user = null;
    _driverProfile = null;
    await ApiService.clearToken();
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user');
    notifyListeners();
  }
}
