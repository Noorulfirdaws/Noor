import 'package:flutter/material.dart';
import '../services/api_service.dart';

class RequestTripScreen extends StatefulWidget {
  const RequestTripScreen({super.key});

  @override
  State<RequestTripScreen> createState() => _RequestTripScreenState();
}

class _RequestTripScreenState extends State<RequestTripScreen> {
  final _pickupController = TextEditingController();
  final _dropoffController = TextEditingController();
  bool _isLoading = false;
  String? _message;

  Future<void> _requestTrip() async {
    if (_pickupController.text.isEmpty || _dropoffController.text.isEmpty) {
      setState(() => _message = 'Please enter pickup and dropoff locations');
      return;
    }

    setState(() {
      _isLoading = true;
      _message = null;
    });

    try {
      final result = await ApiService.requestTrip(
        _pickupController.text,
        _dropoffController.text,
      );

      if (result['trip'] != null) {
        setState(() {
          _message = '✅ Trip requested! Deposit: ${result['trip']['deposit']} DJF';
          _isLoading = false;
        });
        await Future.delayed(const Duration(seconds: 2));
        if (mounted) Navigator.pop(context);
      } else {
        setState(() {
          _message = result['message'] ?? 'Failed to request trip';
          _isLoading = false;
        });
      }
    } catch (e) {
      setState(() {
        _message = 'Connection error. Please try again.';
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Request Taxi', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 20),
            const Text('Where are you?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _pickupController,
              decoration: InputDecoration(
                hintText: 'Enter pickup location',
                prefixIcon: const Icon(Icons.location_on, color: Colors.green),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
            const Text('Where to?', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _dropoffController,
              decoration: InputDecoration(
                hintText: 'Enter destination',
                prefixIcon: const Icon(Icons.location_on, color: Colors.red),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.amber[50],
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFFFB800)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline, color: Color(0xFFFFB800)),
                  SizedBox(width: 8),
                  Text('Booking deposit: 200 DJF', style: TextStyle(fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            if (_message != null) ...[
              const SizedBox(height: 16),
              Text(_message!, style: TextStyle(
                color: _message!.startsWith('✅') ? Colors.green : Colors.red,
                fontWeight: FontWeight.bold,
              )),
            ],
            const Spacer(),
            SizedBox(
              width: double.infinity,
              height: 55,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFB800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isLoading ? null : _requestTrip,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Confirm Request', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}