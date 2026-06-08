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

  @override
  void dispose() {
    _nameController.dispose();
    _fatherNameController.dispose();
    _grandfatherNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Create Account',
            style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 8),
              const Text('Join Djib Taxi',
                  style: TextStyle(
                      fontSize: 28, fontWeight: FontWeight.bold)),
              const Text('Create your account',
                  style: TextStyle(fontSize: 16, color: Colors.grey)),
              const SizedBox(height: 32),
              _field(_nameController, 'Your Name (First)', Icons.person,
                  action: TextInputAction.next),
              const SizedBox(height: 14),
              _field(_fatherNameController, "Father's Name", Icons.person_outline,
                  action: TextInputAction.next),
              const SizedBox(height: 14),
              _field(_grandfatherNameController, "Grandfather's Name",
                  Icons.people_outline,
                  action: TextInputAction.next),
              const SizedBox(height: 14),
              _field(_emailController, 'Email', Icons.email,
                  keyboard: TextInputType.emailAddress,
                  action: TextInputAction.next),
              const SizedBox(height: 14),
              _field(_passwordController, 'Password', Icons.lock,
                  obscure: true, action: TextInputAction.done),
              const SizedBox(height: 24),
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  if (auth.error != null) {
                    return Padding(
                      padding: const EdgeInsets.only(bottom: 16),
                      child: Text(auth.error!,
                          style: const TextStyle(color: Colors.red)),
                    );
                  }
                  return const SizedBox.shrink();
                },
              ),
              Consumer<AuthProvider>(
                builder: (context, auth, _) {
                  return SizedBox(
                    width: double.infinity,
                    height: 50,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFFFFB800),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12)),
                      ),
                      onPressed: auth.isLoading
                          ? null
                          : () async {
                              final success = await auth.register(
                                _nameController.text.trim(),
                                _fatherNameController.text.trim(),
                                _grandfatherNameController.text.trim(),
                                _emailController.text.trim(),
                                _passwordController.text,
                              );
                              if (success && mounted) {
                                Navigator.pushReplacement(
                                    context,
                                    MaterialPageRoute(
                                        builder: (_) => const HomeScreen()));
                              }
                            },
                      child: auth.isLoading
                          ? const CircularProgressIndicator(
                              color: Colors.white)
                          : const Text('Register',
                              style: TextStyle(
                                  fontSize: 18, color: Colors.white)),
                    ),
                  );
                },
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController controller, String label, IconData icon,
      {TextInputType keyboard = TextInputType.text,
      bool obscure = false,
      TextInputAction action = TextInputAction.next}) {
    return TextField(
      controller: controller,
      keyboardType: keyboard,
      obscureText: obscure,
      textInputAction: action,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon),
        border:
            OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }
}
