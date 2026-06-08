import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:geolocator/geolocator.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'active_trip_screen.dart';
import 'profile_screen.dart';
import 'map_screen.dart';
import '../services/notification_service.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _availableTrips = [];
  Map<String, dynamic>? _activeTrip;
  bool _isLoading = false;
  Timer? _refreshTimer;
  Timer? _locationTimer;
  int _prevAvailableCount = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
    _startPolling();
  }

  @override
  void dispose() {
    _refreshTimer?.cancel();
    _locationTimer?.cancel();
    super.dispose();
  }

  void _startPolling() {
    _refreshTimer = Timer.periodic(const Duration(seconds: 15), (_) => _loadData());
    _locationTimer = Timer.periodic(const Duration(seconds: 30), (_) => _sendLocation());
  }

  Future<void> _sendLocation() async {
    final profile = context.read<AuthProvider>().driverProfile;
    if (profile == null || profile['is_online'] != true) return;
    try {
      final permission = await Geolocator.checkPermission();
      if (permission == LocationPermission.denied ||
          permission == LocationPermission.deniedForever) return;
      final pos = await Geolocator.getCurrentPosition(
          desiredAccuracy: LocationAccuracy.high);
      await ApiService.updateLocation(pos.latitude, pos.longitude);
    } catch (_) {}
  }

  String _fullName(Map<String, dynamic>? user) {
    if (user == null) return 'Driver';
    return [user['name'], user['father_name'], user['grandfather_name']]
        .where((p) => p != null && p.toString().isNotEmpty)
        .join(' ');
  }

  Future<void> _loadData() async {
    if (!mounted || _isLoading) return;
    final profile = context.read<AuthProvider>().driverProfile;
    if (profile == null || profile['status'] != 'approved') return;

    setState(() => _isLoading = true);
    try {
      final myTrips = await ApiService.getMyTrips();
      final active = myTrips.where((t) {
        final s = t['status'];
        return s == 'accepted' || s == 'driver_arrived' || s == 'in_progress';
      }).toList();

      List<dynamic> available = [];
      if (profile['is_online'] == true && active.isEmpty) {
        available = await ApiService.getAvailableTrips();
      }

      if (!mounted) return;
      // Alert when new trip requests appear
      if (available.length > _prevAvailableCount && _prevAvailableCount >= 0) {
        final newCount = available.length - _prevAvailableCount;
        // In-app snackbar
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(SnackBar(
            content: Text('$newCount new trip request${newCount > 1 ? 's' : ''}! 🚕'),
            backgroundColor: const Color(0xFFFFB800),
            duration: const Duration(seconds: 4),
          ));
        }
        // Device notification (works even when app is in background)
        NotificationService.showNewTrip(newCount);
      }
      setState(() {
        _activeTrip = active.isNotEmpty ? active.first as Map<String, dynamic> : null;
        _availableTrips = available;
        _prevAvailableCount = available.length;
        _isLoading = false;
      });
    } catch (_) {
      if (!mounted) return;
      setState(() => _isLoading = false);
    }
  }

  Future<void> _toggleOnline() async {
    final profile = context.read<AuthProvider>().driverProfile;
    if (profile == null) return;
    try {
      await ApiService.toggleOnline(profile['id'].toString());
      if (!mounted) return;
      await context.read<AuthProvider>().refreshDriverProfile();
      if (!mounted) return;
      _loadData();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  Future<void> _acceptTrip(Map<String, dynamic> trip) async {
    try {
      final result =
          await ApiService.acceptTrip(trip['id'].toString());
      if (result['trip'] != null && mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => ActiveTripScreen(
                  trip: Map<String, dynamic>.from(result['trip'] as Map))),
        ).then((_) => _loadData());
      } else if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(
                content: Text(
                    result['message'] ?? 'Could not accept trip')));
        _loadData();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AuthProvider>(
      builder: (context, auth, _) {
        final profile = auth.driverProfile;
        final isOnline = profile?['is_online'] == true;
        final status = profile?['status'] ?? 'pending';

        return Scaffold(
          backgroundColor: Colors.grey[100],
          appBar: AppBar(
            backgroundColor: const Color(0xFFFFB800),
            title: const Text('Djib Taxi Driver',
                style: TextStyle(
                    color: Colors.white, fontWeight: FontWeight.bold)),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: _loadData,
              ),
              IconButton(
                icon: const Icon(Icons.map, color: Colors.white),
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const DriverMapScreen())),
                tooltip: 'My location',
              ),
              IconButton(
                icon: const Icon(Icons.person, color: Colors.white),
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const ProfileScreen())),
              ),
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.white),
                onPressed: () async {
                  await auth.logout();
                  if (mounted) {
                    Navigator.pushReplacement(
                        context,
                        MaterialPageRoute(
                            builder: (_) => const LoginScreen()));
                  }
                },
              ),
            ],
          ),
          body: RefreshIndicator(
            onRefresh: () async {
              try {
                await auth.refreshDriverProfile();
                await _loadData();
              } catch (_) {}
            },
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _driverInfoCard(auth, profile, status),
                const SizedBox(height: 12),
                if (status == 'pending') _pendingCard(),
                if (status == 'approved') ...[
                  _onlineToggleCard(isOnline),
                  const SizedBox(height: 12),
                  if (_activeTrip != null) _activeTripCard(),
                  if (_activeTrip == null && isOnline)
                    _availableTripsSection(),
                  if (_activeTrip == null && !isOnline) _offlineCard(),
                ],
                if (status == 'rejected') _rejectedCard(),
              ],
            ),
          ),
        );
      },
    );
  }

  Widget _driverInfoCard(AuthProvider auth, Map<String, dynamic>? profile,
      String status) {
    final statusColors = {
      'pending': Colors.orange,
      'approved': Colors.green,
      'rejected': Colors.red,
      'suspended': Colors.grey,
    };
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            const CircleAvatar(
              radius: 28,
              backgroundColor: Color(0xFFFFB800),
              child: Icon(Icons.drive_eta, color: Colors.white, size: 30),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(_fullName(auth.user),
                      style: const TextStyle(
                          fontSize: 18, fontWeight: FontWeight.bold)),
                  if (profile != null) ...[
                    Text(profile['vehicle_model'] ?? '',
                        style: const TextStyle(color: Colors.grey)),
                    Text(profile['vehicle_plate'] ?? '',
                        style: const TextStyle(color: Colors.grey)),
                  ],
                ],
              ),
            ),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
              decoration: BoxDecoration(
                color: statusColors[status] ?? Colors.grey,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(status,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 12,
                      fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }

  Widget _pendingCard() {
    return Card(
      color: Colors.orange[50],
      child: const Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(Icons.hourglass_top, size: 48, color: Colors.orange),
            SizedBox(height: 12),
            Text('Application Pending',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.orange)),
            SizedBox(height: 8),
            Text(
              'Your driver application is under review. You will be able to accept rides once approved.',
              textAlign: TextAlign.center,
              style: TextStyle(color: Colors.orange),
            ),
          ],
        ),
      ),
    );
  }

  Widget _rejectedCard() {
    return Card(
      color: Colors.red[50],
      child: const Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          children: [
            Icon(Icons.cancel, size: 48, color: Colors.red),
            SizedBox(height: 8),
            Text('Application Rejected',
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                    color: Colors.red)),
            SizedBox(height: 8),
            Text('Please contact support for more information.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.red)),
          ],
        ),
      ),
    );
  }

  Widget _onlineToggleCard(bool isOnline) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Row(
              children: [
                Icon(
                  isOnline ? Icons.wifi : Icons.wifi_off,
                  color: isOnline ? Colors.green : Colors.grey,
                  size: 28,
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(isOnline ? 'You are Online' : 'You are Offline',
                        style: const TextStyle(
                            fontSize: 16, fontWeight: FontWeight.bold)),
                    Text(
                      isOnline
                          ? 'Accepting new trip requests'
                          : 'Go online to see trips',
                      style: const TextStyle(
                          color: Colors.grey, fontSize: 13),
                    ),
                  ],
                ),
              ],
            ),
            Switch(
              value: isOnline,
              activeColor: const Color(0xFFFFB800),
              onChanged: (_) => _toggleOnline(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _activeTripCard() {
    final trip = _activeTrip!;
    final statusLabels = {
      'accepted': 'Head to Pickup',
      'driver_arrived': 'Waiting for Customer',
      'in_progress': 'Trip in Progress',
    };
    return Card(
      color: Colors.green[50],
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(
              builder: (_) => ActiveTripScreen(trip: trip)),
        ).then((_) => _loadData()),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  const Icon(Icons.directions_car, color: Colors.green),
                  const SizedBox(width: 8),
                  Text(
                    statusLabels[trip['status']] ?? 'Active Trip',
                    style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: Colors.green),
                  ),
                  const Spacer(),
                  const Icon(Icons.arrow_forward_ios,
                      size: 16, color: Colors.green),
                ],
              ),
              const SizedBox(height: 8),
              if (trip['customer_name'] != null)
                Row(children: [
                  const Icon(Icons.person, color: Colors.green, size: 14),
                  const SizedBox(width: 6),
                  Text(
                    [trip['customer_name'], trip['customer_father_name'], trip['customer_grandfather_name']]
                        .where((x) => x != null && x.toString().isNotEmpty)
                        .join(' '),
                    style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                  ),
                ]),
              const SizedBox(height: 6),
              Row(
                children: [
                  const Icon(Icons.circle, color: Colors.green, size: 12),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(trip['pickup_location'] ?? '',
                          style: const TextStyle(
                              fontWeight: FontWeight.bold))),
                ],
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  const Icon(Icons.location_on,
                      color: Colors.red, size: 12),
                  const SizedBox(width: 8),
                  Expanded(
                      child: Text(trip['dropoff_location'] ?? '')),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _offlineCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Icon(Icons.wifi_off, size: 48, color: Colors.grey),
            const SizedBox(height: 12),
            const Text('You are offline',
                style: TextStyle(fontSize: 16, color: Colors.grey)),
            const SizedBox(height: 8),
            const Text('Toggle the switch above to go online and start accepting rides.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.grey)),
          ],
        ),
      ),
    );
  }

  Widget _availableTripsSection() {
    if (_isLoading) {
      return const Center(
          child: Padding(
        padding: EdgeInsets.all(24),
        child: CircularProgressIndicator(color: Color(0xFFFFB800)),
      ));
    }
    if (_availableTrips.isEmpty) {
      return Card(
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Column(
            children: [
              const Icon(Icons.search_off, size: 48, color: Colors.grey),
              const SizedBox(height: 8),
              const Text('No trip requests right now',
                  style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 8),
              TextButton.icon(
                onPressed: _loadData,
                icon: const Icon(Icons.refresh),
                label: const Text('Refresh'),
              ),
            ],
          ),
        ),
      );
    }
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 8),
          child: Text('${_availableTrips.length} Available Trip(s)',
              style: const TextStyle(
                  fontSize: 16, fontWeight: FontWeight.bold)),
        ),
        ..._availableTrips.map((trip) => _tripRequestCard(trip as Map<String, dynamic>)),
      ],
    );
  }

  Widget _tripRequestCard(Map<String, dynamic> trip) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.circle, color: Colors.green, size: 12),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(trip['pickup_location'] ?? '',
                        style: const TextStyle(
                            fontWeight: FontWeight.bold))),
              ],
            ),
            const SizedBox(height: 4),
            Row(
              children: [
                const Icon(Icons.location_on,
                    color: Colors.red, size: 12),
                const SizedBox(width: 8),
                Expanded(
                    child: Text(trip['dropoff_location'] ?? '')),
              ],
            ),
            const SizedBox(height: 4),
            Text('Deposit: ${trip['deposit'] ?? 200} DJF',
                style: const TextStyle(
                    color: Colors.grey, fontSize: 13)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFB800),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8)),
                ),
                onPressed: () => _acceptTrip(trip),
                child: const Text('Accept Trip',
                    style: TextStyle(color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
