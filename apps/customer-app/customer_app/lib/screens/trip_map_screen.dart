import 'dart:async';
import 'dart:math';
import 'package:flutter/material.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';
import '../services/api_service.dart';
import '../services/connectivity_service.dart';
import '../services/offline_cache.dart';

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

class _TripMapScreenState extends State<TripMapScreen>
    with SingleTickerProviderStateMixin {
  GoogleMapController? _mapController;
  Timer? _pollTimer;
  Timer? _animTimer;

  LatLng? _driverPos;
  LatLng? _driverTarget;      // smoothly animate toward this
  LatLng? _pickupPos;
  String? _driverName;
  String? _driverVehicle;
  String? _tripStatus;
  double? _etaMinutes;
  bool _loading = true;
  bool _offlineMode = false;

  static const LatLng _djiboutiCenter = LatLng(11.5886, 43.1450);
  static const Color _brand = Color(0xFFf97316);

  final Set<Marker>   _markers   = {};
  final Set<Polyline> _polylines = {};

  @override
  void initState() {
    super.initState();
    _loadCached();
    _refresh();
    // Poll every 5 seconds when online
    _pollTimer = Timer.periodic(const Duration(seconds: 5), (_) => _refresh());
    // Smooth animation tick every 100ms
    _animTimer = Timer.periodic(const Duration(milliseconds: 100), (_) => _animateDriver());
  }

  @override
  void dispose() {
    _pollTimer?.cancel();
    _animTimer?.cancel();
    _mapController?.dispose();
    super.dispose();
  }

  // Load last known trip from cache for instant display
  Future<void> _loadCached() async {
    final cached = await OfflineCache.loadTrip(widget.tripId);
    if (cached != null) _applyTripData(cached, fromCache: true);
  }

  Future<void> _refresh() async {
    final connectivity = context.read<ConnectivityService>();
    if (!connectivity.isOnline) {
      setState(() { _offlineMode = true; _loading = false; });
      return;
    }
    try {
      final trip = await ApiService.getTrip(widget.tripId);
      await OfflineCache.saveTrip(widget.tripId, trip);
      if (!mounted) return;
      _applyTripData(trip, fromCache: false);
    } catch (_) {
      if (!mounted) return;
      setState(() { _loading = false; _offlineMode = true; });
    }
  }

  void _applyTripData(Map<String, dynamic> trip, {required bool fromCache}) {
    final lat = double.tryParse(trip['driver_latitude']?.toString() ?? '');
    final lng = double.tryParse(trip['driver_longitude']?.toString() ?? '');

    setState(() {
      _tripStatus  = trip['status'] as String?;
      _driverName  = trip['driver_name'] as String?;
      _driverVehicle = [
        trip['vehicle_model'],
        trip['vehicle_plate'] != null ? '· ${trip['vehicle_plate']}' : null
      ].where((e) => e != null).join(' ');
      _loading     = false;
      _offlineMode = fromCache;

      if (lat != null && lng != null) {
        _driverTarget = LatLng(lat, lng);
        _driverPos ??= _driverTarget;
        _etaMinutes = _calcEta(_driverTarget!, _djiboutiCenter);
      }
    });

    _rebuildMarkers();
    if (_driverTarget != null) {
      _mapController?.animateCamera(
        CameraUpdate.newCameraPosition(
          CameraPosition(target: _driverTarget!, zoom: 15),
        ),
      );
    }
  }

  // Linear interpolation toward target position
  void _animateDriver() {
    if (_driverPos == null || _driverTarget == null) return;
    if (_driverPos == _driverTarget) return;
    const step = 0.15;
    final newLat = _driverPos!.latitude  + (_driverTarget!.latitude  - _driverPos!.latitude)  * step;
    final newLng = _driverPos!.longitude + (_driverTarget!.longitude - _driverPos!.longitude) * step;
    setState(() => _driverPos = LatLng(newLat, newLng));
    _rebuildMarkers();
  }

  void _rebuildMarkers() {
    _markers.clear();
    _polylines.clear();

    if (_driverPos != null) {
      _markers.add(Marker(
        markerId: const MarkerId('driver'),
        position: _driverPos!,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueOrange),
        infoWindow: InfoWindow(
          title: _driverName ?? 'Chauffeur',
          snippet: _driverVehicle ?? '',
        ),
      ));
    }

    if (_pickupPos != null) {
      _markers.add(Marker(
        markerId: const MarkerId('pickup'),
        position: _pickupPos!,
        icon: BitmapDescriptor.defaultMarkerWithHue(BitmapDescriptor.hueBlue),
        infoWindow: InfoWindow(title: 'Votre position', snippet: widget.pickup),
      ));

      if (_driverPos != null) {
        _polylines.add(Polyline(
          polylineId: const PolylineId('route'),
          points: [_driverPos!, _pickupPos!],
          color: _brand,
          width: 4,
          patterns: [PatternItem.dash(20), PatternItem.gap(10)],
        ));
      }
    }
  }

  // Rough ETA: haversine distance ÷ avg city speed 30 km/h
  double _calcEta(LatLng from, LatLng to) {
    const R = 6371.0;
    final dLat = _toRad(to.latitude  - from.latitude);
    final dLng = _toRad(to.longitude - from.longitude);
    final a = sin(dLat / 2) * sin(dLat / 2) +
        cos(_toRad(from.latitude)) * cos(_toRad(to.latitude)) *
        sin(dLng / 2) * sin(dLng / 2);
    final distKm = 2 * R * asin(sqrt(a));
    return (distKm / 30.0) * 60; // minutes
  }

  double _toRad(double deg) => deg * pi / 180;

  String _statusLabel(String? s) {
    switch (s) {
      case 'accepted':       return 'Chauffeur en route';
      case 'driver_arrived': return 'Chauffeur arrivé';
      case 'in_progress':    return 'Trajet en cours';
      case 'completed':      return 'Trajet terminé';
      default:               return 'Recherche d\'un chauffeur…';
    }
  }

  Color _statusColor(String? s) {
    switch (s) {
      case 'accepted':       return Colors.blue;
      case 'driver_arrived': return Colors.green;
      case 'in_progress':    return _brand;
      case 'completed':      return Colors.teal;
      default:               return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<ConnectivityService>(
      builder: (context, conn, _) {
        return Scaffold(
          backgroundColor: const Color(0xFF0f172a),
          appBar: AppBar(
            backgroundColor: const Color(0xFF1e293b),
            foregroundColor: Colors.white,
            elevation: 0,
            title: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Suivi du trajet',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                if (_tripStatus != null)
                  Text(_statusLabel(_tripStatus),
                      style: TextStyle(
                          fontSize: 12, color: _statusColor(_tripStatus))),
              ],
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: _refresh,
              ),
            ],
          ),
          body: Column(
            children: [
              // Offline banner
              if (!conn.isOnline || _offlineMode) const OfflineBanner(),

              // Map
              Expanded(
                flex: 3,
                child: _loading
                    ? const Center(
                        child: CircularProgressIndicator(
                            color: Color(0xFFf97316)))
                    : GoogleMap(
                        initialCameraPosition: CameraPosition(
                          target: _driverPos ?? _djiboutiCenter,
                          zoom: 14,
                        ),
                        onMapCreated: (ctrl) => _mapController = ctrl,
                        markers:   _markers,
                        polylines: _polylines,
                        myLocationEnabled: true,
                        myLocationButtonEnabled: false,
                        mapToolbarEnabled: false,
                        zoomControlsEnabled: false,
                        mapType: MapType.normal,
                        style: _darkMapStyle,
                      ),
              ),

              // Bottom info card
              Container(
                decoration: const BoxDecoration(
                  color: Color(0xFF1e293b),
                  borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
                ),
                padding: const EdgeInsets.fromLTRB(20, 20, 20, 32),
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // ETA chip
                    if (_etaMinutes != null && _tripStatus == 'accepted')
                      Container(
                        margin: const EdgeInsets.only(bottom: 16),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 20, vertical: 10),
                        decoration: BoxDecoration(
                          color: _brand.withOpacity(0.15),
                          borderRadius: BorderRadius.circular(50),
                          border: Border.all(color: _brand.withOpacity(0.4)),
                        ),
                        child: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.directions_car,
                                color: Color(0xFFf97316), size: 18),
                            const SizedBox(width: 8),
                            Text(
                              'Arrivée dans ~${_etaMinutes!.round()} min',
                              style: const TextStyle(
                                color: Color(0xFFf97316),
                                fontWeight: FontWeight.bold,
                                fontSize: 14,
                              ),
                            ),
                          ],
                        ),
                      ),

                    // Driver info
                    if (_driverName != null)
                      Row(
                        children: [
                          CircleAvatar(
                            backgroundColor: _brand,
                            radius: 22,
                            child: Text(
                              _driverName![0].toUpperCase(),
                              style: const TextStyle(
                                  color: Colors.white,
                                  fontWeight: FontWeight.bold,
                                  fontSize: 16),
                            ),
                          ),
                          const SizedBox(width: 14),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(_driverName!,
                                    style: const TextStyle(
                                        color: Colors.white,
                                        fontWeight: FontWeight.bold,
                                        fontSize: 15)),
                                if (_driverVehicle != null &&
                                    _driverVehicle!.isNotEmpty)
                                  Text(_driverVehicle!,
                                      style: const TextStyle(
                                          color: Color(0xFF94a3b8),
                                          fontSize: 12)),
                              ],
                            ),
                          ),
                          // Status pill
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 5),
                            decoration: BoxDecoration(
                              color: _statusColor(_tripStatus).withOpacity(0.15),
                              borderRadius: BorderRadius.circular(50),
                            ),
                            child: Text(
                              _statusLabel(_tripStatus),
                              style: TextStyle(
                                color: _statusColor(_tripStatus),
                                fontSize: 11,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        ],
                      ),

                    const SizedBox(height: 16),

                    // Route summary
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.05),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Column(
                        children: [
                          _routeRow(
                              Icons.circle, Colors.green, 'Départ', widget.pickup),
                          const Padding(
                            padding: EdgeInsets.only(left: 10, top: 2, bottom: 2),
                            child: SizedBox(
                              height: 16,
                              child: VerticalDivider(
                                  color: Color(0xFF475569), width: 1),
                            ),
                          ),
                          _routeRow(Icons.location_on, Colors.red,
                              'Destination', widget.dropoff),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _routeRow(
      IconData icon, Color color, String label, String value) {
    return Row(
      children: [
        Icon(icon, color: color, size: 14),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: const TextStyle(
                      color: Color(0xFF64748b), fontSize: 10)),
              Text(value,
                  style: const TextStyle(
                      color: Colors.white,
                      fontSize: 13,
                      fontWeight: FontWeight.w500)),
            ],
          ),
        ),
      ],
    );
  }

  // Dark map style JSON
  static const String _darkMapStyle = '''
[
  {"elementType":"geometry","stylers":[{"color":"#1e293b"}]},
  {"elementType":"labels.text.fill","stylers":[{"color":"#94a3b8"}]},
  {"elementType":"labels.text.stroke","stylers":[{"color":"#0f172a"}]},
  {"featureType":"road","elementType":"geometry","stylers":[{"color":"#334155"}]},
  {"featureType":"road.highway","elementType":"geometry","stylers":[{"color":"#475569"}]},
  {"featureType":"water","elementType":"geometry","stylers":[{"color":"#0ea5e9"}]},
  {"featureType":"poi","elementType":"geometry","stylers":[{"color":"#1e293b"}]},
  {"featureType":"transit","elementType":"geometry","stylers":[{"color":"#334155"}]}
]
''';
}
