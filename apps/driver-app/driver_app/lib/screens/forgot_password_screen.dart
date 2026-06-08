import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  // Step 1: enter email
  // Step 2: enter code + new password
  int _step = 1;
  final _emailCtrl    = TextEditingController();
  final _codeCtrl     = TextEditingController();
  final _passCtrl     = TextEditingController();
  final _confirmCtrl  = TextEditingController();
  bool _loading = false;
  String? _error;
  String? _info;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _codeCtrl.dispose();
    _passCtrl.dispose();
    _confirmCtrl.dispose();
    super.dispose();
  }

  Future<void> _requestCode() async {
    final email = _emailCtrl.text.trim();
    if (email.isEmpty) {
      setState(() => _error = 'Please enter your email');
      return;
    }
    setState(() { _loading = true; _error = null; _info = null; });
    try {
      final r = await ApiService.forgotPassword(email);
      if (!mounted) return;
      if (r['code'] != null) {
        setState(() {
          _step = 2;
          _info = 'A 6-digit code has been generated.\n'
              'Your admin will share it with you.\n\n'
              'Code: ${r['code']}';
          _loading = false;
        });
      } else {
        setState(() { _error = r['message'] ?? 'Failed'; _loading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Connection error'; _loading = false; });
    }
  }

  Future<void> _doReset() async {
    final code = _codeCtrl.text.trim();
    final pass = _passCtrl.text;
    final confirm = _confirmCtrl.text;
    if (code.isEmpty || pass.isEmpty) {
      setState(() => _error = 'Please fill all fields');
      return;
    }
    if (pass != confirm) {
      setState(() => _error = 'Passwords do not match');
      return;
    }
    if (pass.length < 6) {
      setState(() => _error = 'Password must be at least 6 characters');
      return;
    }
    setState(() { _loading = true; _error = null; });
    try {
      final r = await ApiService.resetPassword(
          _emailCtrl.text.trim(), code, pass);
      if (!mounted) return;
      if (r['message']?.contains('successfully') == true) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Password reset! Please log in.'),
              backgroundColor: Colors.green));
        Navigator.pop(context);
      } else {
        setState(() { _error = r['message'] ?? 'Failed'; _loading = false; });
      }
    } catch (_) {
      if (mounted) setState(() { _error = 'Connection error'; _loading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Reset Password', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 16),
            // Step indicator
            Row(children: [
              _stepDot(1), const SizedBox(width: 6),
              Expanded(child: Container(height: 2,
                  color: _step >= 2 ? const Color(0xFFFFB800) : Colors.grey.shade300)),
              const SizedBox(width: 6), _stepDot(2),
            ]),
            const SizedBox(height: 28),

            if (_step == 1) ...[
              const Text('Forgot your password?',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              const Text('Enter your registered email to receive a reset code.',
                  style: TextStyle(color: Colors.grey)),
              const SizedBox(height: 28),
              TextField(
                controller: _emailCtrl,
                keyboardType: TextInputType.emailAddress,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _requestCode(),
                decoration: InputDecoration(
                  labelText: 'Email Address',
                  prefixIcon: const Icon(Icons.email),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ] else ...[
              const Text('Enter your reset code',
                  style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
              const SizedBox(height: 6),
              Text('Code sent for: ${_emailCtrl.text}',
                  style: const TextStyle(color: Colors.grey)),
              const SizedBox(height: 28),
              if (_info != null)
                Container(
                  padding: const EdgeInsets.all(14),
                  margin: const EdgeInsets.only(bottom: 20),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: const Color(0xFFFFB800)),
                  ),
                  child: Text(_info!,
                      style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w500)),
                ),
              TextField(
                controller: _codeCtrl,
                keyboardType: TextInputType.number,
                maxLength: 6,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: '6-digit Code',
                  prefixIcon: const Icon(Icons.lock_clock),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  counterText: '',
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _passCtrl,
                obscureText: true,
                textInputAction: TextInputAction.next,
                decoration: InputDecoration(
                  labelText: 'New Password',
                  prefixIcon: const Icon(Icons.lock),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 14),
              TextField(
                controller: _confirmCtrl,
                obscureText: true,
                textInputAction: TextInputAction.done,
                onSubmitted: (_) => _doReset(),
                decoration: InputDecoration(
                  labelText: 'Confirm Password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ],

            if (_error != null) ...[
              const SizedBox(height: 14),
              Text(_error!, style: const TextStyle(color: Colors.red)),
            ],
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFB800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _loading ? null : (_step == 1 ? _requestCode : _doReset),
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : Text(
                        _step == 1 ? 'Send Reset Code' : 'Reset Password',
                        style: const TextStyle(fontSize: 17, color: Colors.white)),
              ),
            ),
            if (_step == 2) ...[
              const SizedBox(height: 12),
              Center(child: TextButton(
                onPressed: () => setState(() {
                  _step = 1; _error = null; _info = null;
                  _codeCtrl.clear(); _passCtrl.clear(); _confirmCtrl.clear();
                }),
                child: const Text('Back — request new code'),
              )),
            ],
          ],
        ),
      ),
    );
  }

  Widget _stepDot(int n) {
    final active = _step >= n;
    return Container(
      width: 28, height: 28,
      decoration: BoxDecoration(
        color: active ? const Color(0xFFFFB800) : Colors.grey.shade300,
        shape: BoxShape.circle,
      ),
      child: Center(child: Text('$n',
          style: TextStyle(color: active ? Colors.white : Colors.grey,
              fontWeight: FontWeight.bold))),
    );
  }
}
