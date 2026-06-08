import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import 'home_screen.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nameController = TextEditingController();
  final _fatherNameController = TextEditingController();
  final _grandfatherNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final _licenseController = TextEditingController();
  final _vehicleModelController = TextEditingController();
  final _vehiclePlateController = TextEditingController();

  @override
  void dispose() {
    _nameController.dispose();
    _fatherNameController.dispose();
    _grandfatherNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _phoneController.dispose();
    _licenseController.dispose();
    _vehicleModelController.dispose();
    _vehiclePlateController.dispose();
    super.dispose();
  }

  Future<void> _doRegister(AuthProvider auth) async {
    final name = _nameController.text.trim();
    final fatherName = _fatherNameController.text.trim();
    final grandfatherName = _grandfatherNameController.text.trim();
    final email = _emailController.text.trim();
    final password = _passwordController.text;
    final phone = _phoneController.text.trim();
    final license = _licenseController.text.trim();
    final vehicleModel = _vehicleModelController.text.trim();
    final vehiclePlate = _vehiclePlateController.text.trim();

    if (name.isEmpty || fatherName.isEmpty || grandfatherName.isEmpty ||
        email.isEmpty || password.isEmpty || phone.isEmpty ||
        license.isEmpty || vehicleModel.isEmpty || vehiclePlate.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Please fill all fields')));
      return;
    }

    final accountOk = await auth.register(
        name, fatherName, grandfatherName, email, password);
    if (!accountOk || !mounted) return;

    final profileOk = await auth.registerDriverProfile(
        phone, license, vehicleModel, vehiclePlate);
    if (!mounted) return;

    if (profileOk) {
      Navigator.pushReplacement(
          context, MaterialPageRoute(builder: (_) => const HomeScreen()));
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Driver Registration',
            style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _sectionLabel('Personal Info'),
            const SizedBox(height: 12),
            _field(_nameController, 'Your Name (First)', Icons.person),
            const SizedBox(height: 12),
            _field(_fatherNameController, "Father's Name",
                Icons.person_outline),
            const SizedBox(height: 12),
            _field(_grandfatherNameController, "Grandfather's Name",
                Icons.people_outline),
            const SizedBox(height: 12),
            _field(_emailController, 'Email', Icons.email,
                keyboard: TextInputType.emailAddress),
            const SizedBox(height: 12),
            _field(_passwordController, 'Password', Icons.lock,
                obscure: true),
            const SizedBox(height: 24),
            _sectionLabel('Vehicle Info'),
            const SizedBox(height: 12),
            _field(_phoneController, 'Phone Number', Icons.phone,
                keyboard: TextInputType.phone),
            const SizedBox(height: 12),
            _field(_licenseController, 'License Number', Icons.badge),
            const SizedBox(height: 12),
            _field(_vehicleModelController, 'Vehicle Model',
                Icons.directions_car),
            const SizedBox(height: 12),
            _field(_vehiclePlateController, 'Vehicle Plate',
                Icons.confirmation_number),
            const SizedBox(height: 16),
            Consumer<AuthProvider>(builder: (context, auth, _) {
              if (auth.error != null) {
                return Padding(
                  padding: const EdgeInsets.only(bottom: 12),
                  child: Text(auth.error!,
                      style: const TextStyle(color: Colors.red)),
                );
              }
              return const SizedBox.shrink();
            }),
            Consumer<AuthProvider>(builder: (context, auth, _) {
              return SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFFFFB800),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  onPressed:
                      auth.isLoading ? null : () => _doRegister(auth),
                  child: auth.isLoading
                      ? const CircularProgressIndicator(color: Colors.white)
                      : const Text('Register as Driver',
                          style: TextStyle(
                              fontSize: 18, color: Colors.white)),
                ),
              );
            }),
            const SizedBox(height: 12),
            Center(
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                    color: Colors.amber[50],
                    borderRadius: BorderRadius.circular(8)),
                child: const Text(
                  'Your account will be reviewed by an admin before you can accept rides.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.orange, fontSize: 13),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _sectionLabel(String label) {
    return Text(label,
        style: const TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.bold,
            color: Color(0xFFFFB800)));
  }

  Widget _field(TextEditingController controller, String label, IconData icon,
      {TextInputType keyboard = TextInputType.text, bool obscure = false}) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      obscureText: obscure,
      textInputAction: TextInputAction.next,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
