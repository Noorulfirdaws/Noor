import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../services/api_service.dart';

class AuthProvider extends ChangeNotifier {
  String? _token;
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;

  String? get token => _token;
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isLoggedIn => _token != null;

  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final result = await ApiService.login(email, password);
      if (result['token'] != null) {
        _token = result['token'];
        _user = result['user'];
        await ApiService.saveToken(_token!);
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
      final result = await ApiService.register(name, fatherName, grandfatherName, email, password);
      if (result['token'] != null) {
        _token = result['token'];
        _user = result['user'];
        await ApiService.saveToken(_token!);
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
      _error = 'Connection error. Please try again.';
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await ApiService.clearToken();
    notifyListeners();
  }
}