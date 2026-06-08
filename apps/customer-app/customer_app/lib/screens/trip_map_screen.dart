import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter_map/flutter_map.dart';
import 'package:latlong2/latlong.dart';
import '../services/api_service.dart';

class TripMapScreen extends StatefulWidget {
  final String tripId;
  final String pickup;
  final String dropoff;

  const TripMapScreen({
    super.key,
    required this.tripId,
    required this.pickup,
    required this.dropoff,
  });

  @override
  State<TripMapScreen> createState() => _TripMapScreenState();
}

class _TripMapScreenState extends State<TripMapScreen> {
  final MapController _mapController = MapController();
  LatLng? _driverPos;
  Timer? _pollTimer;
  bool _loading = true;

  // Djibouti city center
  static const LatLng _djibouti = LatLng(11.5886, 43.1450);

  @override
  void initState() {
    super.initState();
    _refresh();
    _pollTimer = Timer.periodic(const Duration(seconds: 15), (_) => _refresh());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    super.dispose();
  }

  Future<void> _refresh() async {
    try {
      final trip = await ApiService.getTrip(widget.tripId);
      final lat = double.tryParse(trip['driver_latitude']?.toString() ?? '');
      final lng = double.tryParse(trip['driver_longitude']?.toString() ?? '');
      if (!mounted) return;
      if (lat != null && lng != null) {
        final pos = LatLng(lat, lng);
        setState(() { _driverPos = pos; _loading = false; });
        _mapController.move(pos, 14);
      } else {
        setState(() => _loading = false);
      }
    } catch (_) {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final center = _driverPos ?? _djibouti;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Driver Location', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _refresh,
          ),
        ],
      ),
      body: Stack(
        children: [
          FlutterMap(
            mapController: _mapController,
            options: MapOptions(initialCenter: center, initialZoom: 14),
            children: [
              TileLayer(
                urlTemplate: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
                userAgentPackageName: 'com.djibtaxi.customer_app',
              ),
              if (_driverPos != null)
                MarkerLayer(markers: [
                  Marker(
                    point: _driverPos!,
                    width: 70,
                    height: 70,
                    child: Column(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                          decoration: BoxDecoration(
                            color: Colors.green,
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Text('Driver',
                              style: TextStyle(color: Colors.white,
                                  fontWeight: FontWeight.bold, fontSize: 11)),
                        ),
                        const Icon(Icons.drive_eta, color: Colors.green, size: 30),
                      ],
                    ),
                  ),
                ]),
            ],
          ),

          // Trip info at bottom
          Positioned(
            bottom: 0, left: 0, right: 0,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
                boxShadow: [BoxShadow(blurRadius: 10, color: Colors.black12)],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Row(children: [
                    const Icon(Icons.circle, color: Colors.green, size: 10),
                    const SizedBox(width: 8),
                    Expanded(child: Text(widget.pickup,
                        style: const TextStyle(fontWeight: FontWeight.bold))),
                  ]),
                  const SizedBox(height: 4),
                  Row(children: [
                    const Icon(Icons.location_on, color: Colors.red, size: 10),
                    const SizedBox(width: 8),
                    Expanded(child: Text(widget.dropoff)),
                  ]),
                  if (_driverPos == null && !_loading)
                    const Padding(
                      padding: EdgeInsets.only(top: 8),
                      child: Text('Driver location not yet available. Refreshing…',
                          style: TextStyle(color: Colors.grey, fontSize: 12)),
                    ),
                ],
              ),
            ),
          ),

          if (_loading)
            const Center(child: CircularProgressIndicator(color: Color(0xFFFFB800))),
        ],
      ),
    );
  }
}
