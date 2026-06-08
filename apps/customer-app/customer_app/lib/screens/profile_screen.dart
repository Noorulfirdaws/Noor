import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

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
  }

  @override
  void dispose() {
    _nameCtrl.dispose();
    _fatherCtrl.dispose();
    _grandfatherCtrl.dispose();
    super.dispose();
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
          SnackBar(content: Text(context.read<AuthProvider>().error ?? 'Update failed')));
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = context.watch<AuthProvider>();
    final user = auth.user;
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
            // Avatar
            CircleAvatar(
              radius: 44,
              backgroundColor: const Color(0xFFFFB800),
              child: Text(
                (user?['name'] ?? 'C')[0].toUpperCase(),
                style: const TextStyle(fontSize: 40, color: Colors.white, fontWeight: FontWeight.bold),
              ),
            ),
            const SizedBox(height: 8),
            Text(user?['email'] ?? '',
                style: const TextStyle(color: Colors.grey, fontSize: 14)),
            const SizedBox(height: 28),
            _field(_nameCtrl, 'First Name', Icons.person),
            const SizedBox(height: 14),
            _field(_fatherCtrl, "Father's Name", Icons.person_outline),
            const SizedBox(height: 14),
            _field(_grandfatherCtrl, "Grandfather's Name", Icons.people_outline),
            const SizedBox(height: 28),
            if (auth.error != null)
              Padding(
                padding: const EdgeInsets.only(bottom: 12),
                child: Text(auth.error!, style: const TextStyle(color: Colors.red)),
              ),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor:
                      _edited ? const Color(0xFFFFB800) : Colors.grey.shade300,
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
