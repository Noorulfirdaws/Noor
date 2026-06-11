import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import '../services/offline_cache.dart';
import '../services/connectivity_service.dart';
import 'login_screen.dart';
import 'request_trip_screen.dart';
import 'complaint_screen.dart';
import 'profile_screen.dart';
import 'trip_map_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _trips = [];
  bool _isLoading = true;
  String? _error;
  Set<String> _ratedTripIds = {};
  String _filter = 'all'; // all | active | completed | cancelled

  static const _activeStatuses  = {'requested','accepted','driver_arrived','in_progress'};
  static const _finishedStatuses = {'completed'};
  static const _cancelledStatuses = {'cancelled','driver_no_show','customer_no_show'};

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() { _isLoading = true; _error = null; });

    final connectivity = context.read<ConnectivityService>();

    if (!connectivity.isOnline) {
      // Serve from cache immediately
      final cached = await OfflineCache.loadTrips();
      final rated  = await ApiService.getRatedTripIds();
      setState(() {
        _trips = cached;
        _ratedTripIds = rated;
        _isLoading = false;
        _error = cached.isEmpty ? 'Hors ligne — aucune donnée en cache.' : null;
      });
      return;
    }

    try {
      final results = await Future.wait([
        ApiService.getMyTrips(),
        ApiService.getRatedTripIds(),
      ]);
      final trips = results[0] as List<dynamic>;
      await OfflineCache.saveTrips(trips); // persist for offline use
      setState(() {
        _trips = trips;
        _ratedTripIds = results[1] as Set<String>;
        _isLoading = false;
      });
    } catch (e) {
      // Network failed — fall back to cache
      final cached = await OfflineCache.loadTrips();
      setState(() {
        _trips = cached;
        _isLoading = false;
        _error = cached.isEmpty ? 'Connexion impossible. Vérifiez votre réseau.' : null;
      });
    }
  }

  String _fullName(Map<String, dynamic>? user) {
    if (user == null) return 'Customer';
    return [user['name'], user['father_name'], user['grandfather_name']]
        .where((p) => p != null && p.toString().isNotEmpty)
        .join(' ');
  }

  // ── Status helpers ────────────────────────────────────────────────────────

  Color _statusColor(String? status) {
    switch (status) {
      case 'requested':        return Colors.orange;
      case 'accepted':         return Colors.blue;
      case 'driver_arrived':   return const Color(0xFF9C27B0);
      case 'in_progress':      return Colors.green;
      case 'completed':        return Colors.grey;
      case 'cancelled':        return Colors.red;
      case 'driver_no_show':   return Colors.red;
      case 'customer_no_show': return Colors.deepOrange;
      default:                 return Colors.grey;
    }
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'requested':        return 'Waiting for driver';
      case 'accepted':         return 'Driver is coming';
      case 'driver_arrived':   return 'Driver arrived!';
      case 'in_progress':      return 'Trip in progress';
      case 'completed':        return 'Completed';
      case 'cancelled':        return 'Cancelled';
      case 'driver_no_show':   return 'Driver no-show';
      case 'customer_no_show': return 'You no-showed';
      default:                 return status ?? '';
    }
  }

  String _fmtDate(String? raw) {
    if (raw == null) return '';
    final dt = DateTime.tryParse(raw);
    if (dt == null) return '';
    return '${dt.day.toString().padLeft(2,'0')}/${dt.month.toString().padLeft(2,'0')}/${dt.year}  ${dt.hour.toString().padLeft(2,'0')}:${dt.minute.toString().padLeft(2,'0')}';
  }

  bool _canReportNoShow(Map<String, dynamic> trip) {
    final created = DateTime.tryParse(trip['created_at'] ?? '');
    if (created == null) return false;
    return DateTime.now().difference(created).inMinutes >= 10;
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  Future<void> _cancelTrip(String id) async {
    try {
      await ApiService.cancelTrip(id);
      if (mounted) _loadTrips();
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _reportNoShow(String id) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Report Driver No-Show'),
        content: const Text('The driver did not arrive? Your deposit will be refunded.'),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context, false), child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Confirm', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true || !mounted) return;
    try {
      final result = await ApiService.reportDriverNoShow(id);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(result['message'] ?? 'Reported'), backgroundColor: Colors.green));
        _loadTrips();
      }
    } catch (e) {
      if (mounted) ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(e.toString())));
    }
  }

  Future<void> _openRating(Map<String, dynamic> trip) async {
    final driverId = trip['driver_id']?.toString();
    if (driverId == null) return;

    int selectedRating = 0;
    final commentController = TextEditingController();

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => StatefulBuilder(
        builder: (ctx, setSheet) => Padding(
          padding: EdgeInsets.only(bottom: MediaQuery.of(ctx).viewInsets.bottom, left: 24, right: 24, top: 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Rate your trip', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text('${trip['pickup_location']} → ${trip['dropoff_location']}',
                  style: const TextStyle(color: Colors.grey, fontSize: 13)),
              const SizedBox(height: 20),
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (i) => GestureDetector(
                  onTap: () => setSheet(() => selectedRating = i + 1),
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 6),
                    child: Icon(
                      i < selectedRating ? Icons.star : Icons.star_border,
                      color: const Color(0xFFF97316),
                      size: 42,
                    ),
                  ),
                )),
              ),
              const SizedBox(height: 8),
              Center(child: Text(
                ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][selectedRating],
                style: TextStyle(
                  color: selectedRating > 0 ? const Color(0xFFF97316) : Colors.grey,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              )),
              const SizedBox(height: 16),
              TextField(
                controller: commentController,
                maxLines: 2,
                decoration: InputDecoration(
                  hintText: 'Leave a comment (optional)',
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: selectedRating == 0 ? Colors.grey : const Color(0xFFF97316),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed: selectedRating == 0 ? null : () async {
                    Navigator.pop(ctx);
                    try {
                      final res = await ApiService.submitReview(
                          trip['id'].toString(), driverId, selectedRating, commentController.text.trim());
                      if (!mounted) return;
                      if (res['review'] != null) {
                        await ApiService.markTripRated(trip['id'].toString());
                        setState(() => _ratedTripIds.add(trip['id'].toString()));
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(content: Text('Thank you for your rating! ⭐'), backgroundColor: Colors.green));
                      } else {
                        ScaffoldMessenger.of(context).showSnackBar(
                          SnackBar(content: Text(res['message'] ?? 'Failed to submit rating')));
                      }
                    } catch (_) {
                      if (mounted) ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(content: Text('Connection error. Please try again.')));
                    }
                    commentController.dispose();
                  },
                  child: const Text('Submit Rating', style: TextStyle(fontSize: 17, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  // ── Build ─────────────────────────────────────────────────────────────────

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: const Color(0xFFF97316),
        title: const Text('DjibRide', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh, color: Colors.white),
            onPressed: _loadTrips,
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
              if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          ),
        ],
      ),
      body: Consumer<ConnectivityService>(
        builder: (context, conn, child) => Column(
        children: [
          if (!conn.isOnline) const OfflineBanner(),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: const Color(0xFFF97316),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello, ${_fullName(auth.user)}!',
                    style: const TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold)),
                const Text('Where are you going today?',
                    style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.black,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                icon: const Icon(Icons.local_taxi, color: Colors.white),
                label: const Text('Request a Taxi', style: TextStyle(fontSize: 18, color: Colors.white)),
                onPressed: () => Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const RequestTripScreen()))
                    .then((_) => _loadTrips()),
              ),
            ),
          ),
          _buildFilterBar(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFB800)))
                : _error != null
                    ? Center(child: GestureDetector(
                        onTap: _loadTrips,
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(Icons.wifi_off, color: Colors.grey, size: 48),
                            const SizedBox(height: 8),
                            Text(_error!, style: const TextStyle(color: Colors.red)),
                          ],
                        )))
                    : _trips.isEmpty
                        ? const Center(child: Column(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.directions_car_outlined, size: 64, color: Colors.grey),
                              SizedBox(height: 12),
                              Text('No trips yet', style: TextStyle(color: Colors.grey, fontSize: 16)),
                              Text('Request your first taxi above!',
                                  style: TextStyle(color: Colors.grey, fontSize: 13)),
                            ],
                          ))
                        : _buildTripList(),
          ),
        ],
      ),
      ),
    );
  }

  // ── Filter bar ────────────────────────────────────────────────────────────

  List<dynamic> get _filteredTrips {
    switch (_filter) {
      case 'active':    return _trips.where((t) => _activeStatuses.contains(t['status'])).toList();
      case 'completed': return _trips.where((t) => _finishedStatuses.contains(t['status'])).toList();
      case 'cancelled': return _trips.where((t) => _cancelledStatuses.contains(t['status'])).toList();
      default:          return _trips;
    }
  }

  Widget _buildFilterBar() {
    final counts = {
      'all':       _trips.length,
      'active':    _trips.where((t) => _activeStatuses.contains(t['status'])).length,
      'completed': _trips.where((t) => _finishedStatuses.contains(t['status'])).length,
      'cancelled': _trips.where((t) => _cancelledStatuses.contains(t['status'])).length,
    };
    final labels = {'all': 'All', 'active': 'Active', 'completed': 'Done', 'cancelled': 'Cancelled'};
    return Padding(
      padding: const EdgeInsets.fromLTRB(12, 8, 12, 4),
      child: SingleChildScrollView(
        scrollDirection: Axis.horizontal,
        child: Row(
          children: labels.entries.map((e) {
            final selected = _filter == e.key;
            return Padding(
              padding: const EdgeInsets.only(right: 8),
              child: GestureDetector(
                onTap: () => setState(() => _filter = e.key),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 180),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                  decoration: BoxDecoration(
                    color: selected ? const Color(0xFFF97316) : Colors.white,
                    borderRadius: BorderRadius.circular(20),
                    border: Border.all(
                      color: selected ? const Color(0xFFF97316) : Colors.grey.shade300,
                    ),
                    boxShadow: selected
                        ? [BoxShadow(color: const Color(0xFFF97316).withOpacity(.3), blurRadius: 6)]
                        : [],
                  ),
                  child: Text(
                    '${e.value}  ${counts[e.key]}',
                    style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 13,
                      color: selected ? Colors.white : Colors.grey.shade700,
                    ),
                  ),
                ),
              ),
            );
          }).toList(),
        ),
      ),
    );
  }

  Widget _buildTripList() {
    final list = _filteredTrips;
    if (list.isEmpty) {
      return Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Icon(Icons.directions_car_outlined, size: 64, color: Colors.grey),
            const SizedBox(height: 12),
            Text(
              _filter == 'all' ? 'No trips yet' : 'No ${_filter} trips',
              style: const TextStyle(color: Colors.grey, fontSize: 16),
            ),
          ],
        ),
      );
    }
    return RefreshIndicator(
      onRefresh: _loadTrips,
      color: const Color(0xFFF97316),
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(16, 4, 16, 16),
        itemCount: list.length,
        itemBuilder: (context, index) => _buildTripCard(list[index]),
      ),
    );
  }

  // ── Trip card ─────────────────────────────────────────────────────────────

  Widget _buildTripCard(Map<String, dynamic> trip) {
    final status = trip['status'] as String? ?? '';
    final tripId = trip['id'].toString();
    final isRated = _ratedTripIds.contains(tripId);
    final fare = trip['fare'];
    final deposit = trip['deposit'];

    return Card(
      margin: const EdgeInsets.only(bottom: 14),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
      elevation: 2,
      child: Column(
        children: [
          // Status bar at top
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
            decoration: BoxDecoration(
              color: _statusColor(status).withOpacity(0.12),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                Container(
                  width: 8, height: 8,
                  decoration: BoxDecoration(color: _statusColor(status), shape: BoxShape.circle),
                ),
                const SizedBox(width: 8),
                Text(_statusLabel(status),
                    style: TextStyle(color: _statusColor(status), fontWeight: FontWeight.w700, fontSize: 13)),
                const Spacer(),
                Text(_fmtDate(trip['created_at']),
                    style: const TextStyle(color: Colors.grey, fontSize: 11)),
              ],
            ),
          ),

          // Trip locations
          Padding(
            padding: const EdgeInsets.all(14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(children: [
                  const Icon(Icons.circle, color: Colors.green, size: 10),
                  const SizedBox(width: 8),
                  Expanded(child: Text(trip['pickup_location'] ?? '',
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14))),
                ]),
                Padding(
                  padding: const EdgeInsets.only(left: 4),
                  child: Container(width: 2, height: 14, color: Colors.grey.shade300),
                ),
                Row(children: [
                  const Icon(Icons.location_on, color: Colors.red, size: 10),
                  const SizedBox(width: 8),
                  Expanded(child: Text(trip['dropoff_location'] ?? '',
                      style: const TextStyle(fontSize: 14))),
                ]),

                // Driver info (shown when driver is assigned)
                if (trip['driver_name'] != null && status != 'requested') ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(children: [
                      const Icon(Icons.drive_eta, color: Colors.blue, size: 18),
                      const SizedBox(width: 8),
                      Expanded(child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            [trip['driver_name'], trip['driver_father_name'], trip['driver_grandfather_name']]
                                .where((x) => x != null && x.toString().isNotEmpty)
                                .join(' '),
                            style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                          ),
                          if (trip['vehicle_model'] != null)
                            Text(
                              '${trip['vehicle_model']} • ${trip['vehicle_plate'] ?? ''}',
                              style: const TextStyle(fontSize: 12, color: Colors.grey),
                            ),
                        ],
                      )),
                    ]),
                  ),
                ],

                // Fare info
                if (status == 'completed' && fare != null) ...[
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                    decoration: BoxDecoration(color: Colors.grey.shade100, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.attach_money, size: 16, color: Colors.green),
                        Text('Fare: $fare DJF  |  Deposit: ${deposit ?? 200} DJF',
                            style: const TextStyle(fontSize: 12, color: Colors.grey)),
                      ],
                    ),
                  ),
                ],

                // Driver no-show info
                if (status == 'driver_no_show') ...[
                  const SizedBox(height: 8),
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(color: Colors.red.shade50, borderRadius: BorderRadius.circular(8)),
                    child: const Row(children: [
                      Icon(Icons.info_outline, color: Colors.red, size: 16),
                      SizedBox(width: 6),
                      Text('Your deposit will be refunded.',
                          style: TextStyle(color: Colors.red, fontSize: 12)),
                    ]),
                  ),
                ],

                // Action buttons
                const SizedBox(height: 10),
                _buildActions(trip, status, tripId, isRated),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActions(Map<String, dynamic> trip, String status, String tripId, bool isRated) {
    final actions = <Widget>[];

    if (status == 'requested') {
      actions.add(_outlineBtn('Cancel', Colors.red, () => _cancelTrip(tripId)));
      if (_canReportNoShow(trip)) {
        actions.add(_outlineBtn('Driver No-Show', Colors.orange, () => _reportNoShow(tripId)));
      }
    }

    // Map button for in-progress trips
    if ({'accepted', 'driver_arrived', 'in_progress'}.contains(status)) {
      actions.add(ElevatedButton.icon(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.blue,
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        ),
        icon: const Icon(Icons.map, color: Colors.white, size: 16),
        label: const Text('Track Driver', style: TextStyle(color: Colors.white, fontSize: 13)),
        onPressed: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => TripMapScreen(
            tripId: tripId,
            pickup: trip['pickup_location'] ?? '',
            dropoff: trip['dropoff_location'] ?? '',
          )),
        ),
      ));
    }

    if (status == 'completed' && !isRated) {
      actions.add(SizedBox(
        width: double.infinity,
        child: ElevatedButton.icon(
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFFF97316),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
          ),
          icon: const Icon(Icons.star, color: Colors.white, size: 18),
          label: const Text('Rate this trip', style: TextStyle(color: Colors.white)),
          onPressed: () => _openRating(trip),
        ),
      ));
    }

    if (status == 'completed' && isRated) {
      actions.add(const Row(children: [
        Icon(Icons.star, color: Color(0xFFFFB800), size: 16),
        SizedBox(width: 4),
        Text('You rated this trip', style: TextStyle(color: Colors.grey, fontSize: 13)),
      ]));
    }

    // Complaint button for completed trips with a driver
    if (status == 'completed' && trip['driver_id'] != null) {
      if (actions.isNotEmpty) actions.add(const SizedBox(width: 8));
      actions.add(_outlineBtn('Complaint', Colors.grey, () {
        Navigator.push(context,
            MaterialPageRoute(builder: (_) => ComplaintScreen(trip: trip)));
      }));
    }

    if (actions.isEmpty) return const SizedBox.shrink();
    return Wrap(spacing: 8, runSpacing: 8, children: actions);
  }

  Widget _outlineBtn(String label, Color color, VoidCallback onTap) {
    return OutlinedButton(
      style: OutlinedButton.styleFrom(
        foregroundColor: color,
        side: BorderSide(color: color),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
      ),
      onPressed: onTap,
      child: Text(label, style: const TextStyle(fontSize: 13)),
    );
  }
}
