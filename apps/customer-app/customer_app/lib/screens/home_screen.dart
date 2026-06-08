import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';
import 'login_screen.dart';
import 'request_trip_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});
  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  List<dynamic> _trips = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadTrips();
  }

  Future<void> _loadTrips() async {
    setState(() { _isLoading = true; _error = null; });
    try {
      final trips = await ApiService.getMyTrips();
      setState(() { _trips = trips; _isLoading = false; });
    } catch (e) {
      setState(() { _isLoading = false; _error = 'Failed to load trips. Tap to retry.'; });
    }
  }

  String _fullName(Map<String, dynamic>? user) {
    if (user == null) return 'Customer';
    return [user['name'], user['father_name'], user['grandfather_name']]
        .where((p) => p != null && p.toString().isNotEmpty)
        .join(' ');
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'requested': return Colors.orange;
      case 'accepted': return Colors.blue;
      case 'in_progress': return Colors.green;
      case 'completed': return Colors.grey;
      case 'cancelled': return Colors.red;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    return Scaffold(
      backgroundColor: Colors.grey[100],
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Djib Taxi', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: () async {
              await auth.logout();
              if (mounted) Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LoginScreen()));
            },
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            color: const Color(0xFFFFB800),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Hello, ${_fullName(auth.user)}!', style: const TextStyle(fontSize: 20, color: Colors.white, fontWeight: FontWeight.bold)),
                const Text('Where are you going today?', style: TextStyle(color: Colors.white70)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(16),
            child: SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(backgroundColor: Colors.black, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12))),
                onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const RequestTripScreen())).then((_) => _loadTrips()),
                child: const Text('Request a Taxi', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ),
          const Padding(padding: EdgeInsets.symmetric(horizontal: 16), child: Align(alignment: Alignment.centerLeft, child: Text('My Trips', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)))),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Color(0xFFFFB800)))
                : _error != null
                    ? Center(child: GestureDetector(onTap: _loadTrips, child: Text(_error!, style: const TextStyle(color: Colors.red))))
                    : _trips.isEmpty
                    ? const Center(child: Text('No trips yet!'))
                    : ListView.builder(
                        padding: const EdgeInsets.all(16),
                        itemCount: _trips.length,
                        itemBuilder: (context, index) {
                          final trip = _trips[index];
                          return Card(
                            margin: const EdgeInsets.only(bottom: 12),
                            child: Padding(
                              padding: const EdgeInsets.all(12),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(trip['pickup_location'] ?? '', style: const TextStyle(fontWeight: FontWeight.bold)),
                                  Text(trip['dropoff_location'] ?? ''),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                                    children: [
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                        decoration: BoxDecoration(color: _getStatusColor(trip['status']), borderRadius: BorderRadius.circular(8)),
                                        child: Text(trip['status'] ?? '', style: const TextStyle(color: Colors.white, fontSize: 12)),
                                      ),
                                      if (trip['status'] == 'requested')
                                        TextButton(
                                          onPressed: () async {
                                            await ApiService.cancelTrip(trip['id'].toString());
                                            if (mounted) _loadTrips();
                                          },
                                          child: const Text('Cancel', style: TextStyle(color: Colors.red)),
                                        ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
          ),
        ],
      ),
    );
  }
}
