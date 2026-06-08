import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ComplaintScreen extends StatefulWidget {
  final Map<String, dynamic> trip;

  const ComplaintScreen({super.key, required this.trip});

  @override
  State<ComplaintScreen> createState() => _ComplaintScreenState();
}

class _ComplaintScreenState extends State<ComplaintScreen> {
  String? _selectedReason;
  final _descController = TextEditingController();
  bool _isLoading = false;

  static const _reasons = [
    'Driver was rude',
    'Driver was late',
    'Driver did not arrive',
    'Driver took wrong route',
    'Overcharged fare',
    'Vehicle was dirty',
    'Other',
  ];

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedReason == null) {
      ScaffoldMessenger.of(context)
          .showSnackBar(const SnackBar(content: Text('Please select a reason')));
      return;
    }
    final driverId = widget.trip['driver_id']?.toString();
    if (driverId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('No driver assigned to this trip')));
      return;
    }

    setState(() => _isLoading = true);
    try {
      final result = await ApiService.submitComplaint(
        widget.trip['id'].toString(),
        driverId,
        _selectedReason!,
        _descController.text.trim(),
      );
      if (!mounted) return;
      if (result['complaint'] != null) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Complaint submitted. We will review it shortly.'),
              backgroundColor: Colors.green),
        );
        Navigator.pop(context);
      } else {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(result['message'] ?? 'Failed')));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Connection error. Please try again.')));
      }
    } finally {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final trip = widget.trip;
    return Scaffold(
      appBar: AppBar(
        backgroundColor: const Color(0xFFFFB800),
        title: const Text('Submit Complaint', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Trip summary
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Trip', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text('${trip['pickup_location']} → ${trip['dropoff_location']}',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (trip['driver_name'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Driver: ${[trip['driver_name'], trip['driver_father_name'], trip['driver_grandfather_name']].where((x) => x != null && x.toString().isNotEmpty).join(' ')}',
                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),
            const Text('Reason', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ..._reasons.map((r) => RadioListTile<String>(
                  title: Text(r),
                  value: r,
                  groupValue: _selectedReason,
                  activeColor: const Color(0xFFFFB800),
                  contentPadding: EdgeInsets.zero,
                  onChanged: (v) => setState(() => _selectedReason = v),
                )),
            const SizedBox(height: 8),
            const Text('Description (optional)',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: _descController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Describe what happened…',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFB800),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Submit Complaint',
                        style: TextStyle(fontSize: 17, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
