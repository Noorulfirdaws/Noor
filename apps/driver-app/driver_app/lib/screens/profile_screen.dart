import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../services/api_service.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late final TextEditingController _nameCtrl;
  late final TextEditingController _fatherCtrl;
  late final TextEditingController _grandfatherCtrl;
  bool _edited = false;
  Map<String, dynamic>? _stats;
  bool _statsLoading = true;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().user;
    _nameCtrl        = TextEditingController(text: user?['name']             ?? '');
    _fatherCtrl      = TextEditingController(text: user?['father_name']      ?? '');
    _grandfatherCtrl = TextEditingController(text: user?['grandfather_name'] ?? '');
    for (final c in [_nameCtrl, _fatherCtrl, _grandfatherCtrl]) {
      c.addListener(() => setState(() => _edited = true));
    }
    _loadStats();
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _fatherCtrl.dispose();
    _grandfatherCtrl.dispose();
    super.dispose();
  }

  Future<void> _loadStats() async {
    try {
      final s = await ApiService.getMyStats();
      if (mounted) setState(() { _stats = s; _statsLoading = false; });
    } catch (_) {
      if (mounted) setState(() => _statsLoading = false);
    }
  }

  Future<void> _save() async {
    if (_nameCtrl.text.trim().isEmpty ||
        _fatherCtrl.text.trim().isEmpty ||
        _grandfatherCtrl.text.trim().isEmpty) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('All name fields are required')));
      return;
    }
    final ok = await context.read<AuthProvider>().updateProfile(
          _nameCtrl.text.trim(),
          _fatherCtrl.text.trim(),
          _grandfatherCtrl.text.trim(),
        );
    if (!mounted) return;
    if (ok) {
      setState(() => _edited = false);
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Profile updated'), backgroundColor: Colors.green));
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(context.read<AuthProvider>().error ?? 'Failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth  = context.watch<AuthProvider>();
    final user  = auth.user;
    final prof  = auth.driverProfile;
    final rating = _stats?['rating'];
    final trips  = _stats?['trips'];

    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('My Profile', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            // Avatar + rating
            CircleAvatar(
              radius: 44,
              backgroundColor: const Color(0xFFFFB800),
              child: Text(
                (user?['name'] ?? 'D')[0].toUpperCase(),
                style: const TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            Text(user?['email'] ?? '', style: const TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 6),
            if (!_statsLoading && rating != null && rating['average'] != null)
              Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                const Icon(Icons.star, color: Color(0xFFFFB800), size: 20),
                const SizedBox(width: 4),
                Text('${rating['average']}',
                    style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(width: 4),
                Text('(${rating['total']} reviews)',
                    style: const TextStyle(color: Colors.grey, fontSize: 13)),
              ]),

            // Stats row
            if (!_statsLoading && trips != null) ...[
              const SizedBox(height: 16),
              Row(mainAxisAlignment: MainAxisAlignment.spaceEvenly, children: [
                _statBox('Completed', trips['completed'].toString(), Colors.green),
                _statBox('Cancelled', trips['cancelled'].toString(), Colors.red),
                _statBox('Earnings', '${trips['totalFare'].toStringAsFixed(0)} DJF',
                    const Color(0xFFFFB800)),
              ]),
            ],

            // Vehicle info card
            if (prof != null) ...[
              const SizedBox(height: 20),
              Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.grey.shade100,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Column(children: [
                  _infoRow(Icons.directions_car, 'Vehicle', '${prof['vehicle_model']} • ${prof['vehicle_plate']}'),
                  const SizedBox(height: 6),
                  _infoRow(Icons.badge, 'License', prof['license_number'] ?? ''),
                  const SizedBox(height: 6),
                  _infoRow(Icons.phone, 'Phone', prof['phone'] ?? ''),
                ]),
              ),
            ],

            const SizedBox(height: 24),
            const Align(
              alignment: Alignment.centerLeft,
              child: Text('Edit Name', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            ),
            const SizedBox(height: 12),
            _field(_nameCtrl, 'First Name', Icons.person),
            const SizedBox(height: 12),
            _field(_fatherCtrl, "Father's Name", Icons.person_outline),
            const SizedBox(height: 12),
            _field(_grandfatherCtrl, "Grandfather's Name", Icons.people_outline),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _edited ? const Color(0xFFFFB800) : Colors.grey.shade300,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: (_edited && !auth.isLoading) ? _save : null,
                child: auth.isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Save Changes',
                        style: TextStyle(fontSize: 17, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _statBox(String label, String value, Color color) {
    return Column(children: [
      Text(value, style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: color)),
      Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
    ]);
  }

  Widget _infoRow(IconData icon, String label, String value) {
    return Row(children: [
      Icon(icon, size: 16, color: Colors.grey),
      const SizedBox(width: 8),
      Text('$label: ', style: const TextStyle(color: Colors.grey, fontSize: 13)),
      Expanded(child: Text(value, style: const TextStyle(fontWeight: FontWeight.w500, fontSize: 13))),
    ]);
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon) {
    return TextField(
      controller: ctrl,
      textInputAction: TextInputAction.next,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
