import 'package:flutter/material.dart';
import '../services/api_service.dart';

class ActiveTripScreen extends StatefulWidget {
  final Map<String, dynamic> trip;

  const ActiveTripScreen({super.key, required this.trip});

  @override
  State<ActiveTripScreen> createState() => _ActiveTripScreenState();
}

class _ActiveTripScreenState extends State<ActiveTripScreen> {
  late Map<String, dynamic> _trip;
  bool _isLoading = false;
  String? _message;
  Map<String, dynamic>? _completionSummary;

  @override
  void initState() {
    super.initState();
    _trip = Map<String, dynamic>.from(widget.trip);
  }

  Future<void> _refresh() async {
    try {
      final fresh = await ApiService.getTrip(_trip['id'].toString());
      setState(() => _trip = Map<String, dynamic>.from(fresh));
    } catch (_) {}
  }

  Future<void> _markArrived() async {
    setState(() { _isLoading = true; _message = null; });
    try {
      final result = await ApiService.markArrived(_trip['id'].toString());
      setState(() {
        if (result['trip'] != null) _trip = Map<String, dynamic>.from(result['trip'] as Map);
        _message = result['message']?.toString();
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _message = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _startTrip() async {
    setState(() { _isLoading = true; _message = null; });
    try {
      final result = await ApiService.startTrip(_trip['id'].toString());
      setState(() {
        if (result['trip'] != null) _trip = Map<String, dynamic>.from(result['trip'] as Map);
        final wf = (result['waitingFee'] as num? ?? 0).toDouble();
        _message = wf > 0
            ? 'Waiting fee: $wf DJF (${result['waitingMinutes']} min)'
            : 'Trip started!';
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _message = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _reportNoShow() async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Customer No-Show?'),
        content: const Text(
            'Are you sure you want to report the customer as a no-show? You must have waited at least 5 minutes.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context, false),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context, true),
            child: const Text('Report No-Show',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
    if (confirm != true) return;

    setState(() { _isLoading = true; _message = null; });
    try {
      final result =
          await ApiService.reportCustomerNoShow(_trip['id'].toString());
      setState(() {
        if (result['trip'] != null) _trip = Map<String, dynamic>.from(result['trip'] as Map);
        _message = result['message']?.toString();
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _message = e.toString(); _isLoading = false; });
    }
  }

  Future<void> _completeTrip() async {
    final fareController = TextEditingController();
    bool? confirmed;
    double? fare;

    try {
      confirmed = await showDialog<bool>(
        context: context,
        builder: (_) => AlertDialog(
          title: const Text('Complete Trip'),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Enter the base fare for this trip (DJF):'),
              const SizedBox(height: 12),
              TextField(
                controller: fareController,
                keyboardType:
                    const TextInputType.numberWithOptions(decimal: true),
                autofocus: true,
                decoration: const InputDecoration(
                  labelText: 'Base Fare (DJF)',
                  prefixIcon: Icon(Icons.attach_money),
                  border: OutlineInputBorder(),
                ),
              ),
            ],
          ),
          actions: [
            TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: const Text('Cancel')),
            ElevatedButton(
              style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFFFB800)),
              onPressed: () => Navigator.pop(context, true),
              child: const Text('Complete',
                  style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      );
      fare = double.tryParse(fareController.text);
    } finally {
      fareController.dispose();
    }

    if (confirmed != true) return;
    if (fare == null || fare <= 0) {
      setState(() => _message = 'Please enter a valid fare amount');
      return;
    }

    setState(() { _isLoading = true; _message = null; });
    try {
      final result =
          await ApiService.completeTrip(_trip['id'].toString(), fare);
      setState(() {
        if (result['trip'] != null) _trip = Map<String, dynamic>.from(result['trip'] as Map);
        if (result['summary'] != null) _completionSummary = Map<String, dynamic>.from(result['summary'] as Map);
        _isLoading = false;
      });
    } catch (e) {
      setState(() { _message = e.toString(); _isLoading = false; });
    }
  }

  @override
  Widget build(BuildContext context) {
    final status = _trip['status'] ?? '';
    final isDone =
        status == 'completed' || status == 'cancelled' || status == 'customer_no_show';

    return PopScope(
      canPop: isDone,
      onPopInvoked: (didPop) {
        if (!didPop && !isDone) {
          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(
              content: Text('Complete or cancel the trip first')));
        }
      },
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFFFFB800),
          title: const Text('Active Trip',
              style: TextStyle(color: Colors.white)),
          iconTheme: const IconThemeData(color: Colors.white),
          automaticallyImplyLeading: isDone,
          actions: [
            if (!isDone)
              IconButton(
                icon: const Icon(Icons.refresh, color: Colors.white),
                onPressed: _refresh,
              ),
          ],
        ),
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: [
              _statusBanner(status),
              const SizedBox(height: 16),
              _tripInfoCard(),
              const SizedBox(height: 16),
              if (_message != null) _messageCard(),
              if (_completionSummary != null) _summaryCard(),
              const SizedBox(height: 16),
              if (!isDone && !_isLoading) _actionButtons(status),
              if (_isLoading)
                const CircularProgressIndicator(color: Color(0xFFFFB800)),
              if (isDone) _doneButton(),
            ],
          ),
        ),
      ),
    );
  }

  Widget _statusBanner(String status) {
    final config = {
      'accepted': ('Head to Pickup Point', Colors.blue, Icons.navigation),
      'driver_arrived': ('Waiting for Customer', Colors.orange, Icons.hourglass_top),
      'in_progress': ('Trip in Progress', Colors.green, Icons.drive_eta),
      'completed': ('Trip Completed', Colors.grey, Icons.check_circle),
      'cancelled': ('Trip Cancelled', Colors.red, Icons.cancel),
      'customer_no_show': ('Customer No-Show', Colors.red, Icons.person_off),
    };
    final cfg = config[status] ??
        ('Unknown Status', Colors.grey, Icons.help);

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cfg.$2,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(cfg.$3, color: Colors.white, size: 32),
          const SizedBox(width: 12),
          Text(cfg.$1,
              style: const TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }

  Widget _tripInfoCard() {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Trip Details',
                style: TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold)),
            const Divider(),
            _infoRow(Icons.circle, Colors.green, 'Pickup',
                _trip['pickup_location'] ?? ''),
            const SizedBox(height: 8),
            _infoRow(Icons.location_on, Colors.red, 'Dropoff',
                _trip['dropoff_location'] ?? ''),
            const SizedBox(height: 8),
            _infoRow(Icons.attach_money, Colors.orange, 'Deposit',
                '${_trip['deposit'] ?? 200} DJF'),
            if ((double.tryParse(_trip['waiting_fee']?.toString() ?? '0') ?? 0) > 0) ...[
              const SizedBox(height: 8),
              _infoRow(Icons.timer, Colors.blue, 'Waiting Fee',
                  '${_trip['waiting_fee']} DJF (${_trip['waiting_minutes']} min)'),
            ],
          ],
        ),
      ),
    );
  }

  Widget _infoRow(
      IconData icon, Color color, String label, String value) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, color: color, size: 18),
        const SizedBox(width: 8),
        Text('$label: ',
            style: const TextStyle(
                fontWeight: FontWeight.bold, color: Colors.grey)),
        Expanded(
            child: Text(value,
                style: const TextStyle(fontWeight: FontWeight.w500))),
      ],
    );
  }

  Widget _messageCard() {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: Colors.blue[50],
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.blue.shade200),
      ),
      child: Text(_message!,
          style: TextStyle(color: Colors.blue[800])),
    );
  }

  Widget _summaryCard() {
    final s = _completionSummary!;
    return Card(
      color: Colors.green[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Payment Summary',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: Colors.green)),
            const Divider(),
            _summaryRow('Base Fare', '${s['baseFare']} DJF'),
            _summaryRow('Waiting Fee', '${s['waitingFee']} DJF'),
            _summaryRow('Deposit Paid', '${s['deposit']} DJF'),
            const Divider(),
            _summaryRow('Total Fare', '${s['totalFare']} DJF',
                bold: true),
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.green,
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline,
                      color: Colors.white, size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      s['message'] ?? '',
                      style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.bold),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _summaryRow(String label, String value,
      {bool bold = false}) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 2),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label,
              style: TextStyle(
                  fontWeight:
                      bold ? FontWeight.bold : FontWeight.normal)),
          Text(value,
              style: TextStyle(
                  fontWeight: bold ? FontWeight.bold : FontWeight.normal,
                  color: bold ? Colors.green : null)),
        ],
      ),
    );
  }

  Widget _actionButtons(String status) {
    return Column(
      children: [
        if (status == 'accepted')
          _actionButton('I\'ve Arrived', Colors.blue,
              Icons.location_pin, _markArrived),
        if (status == 'driver_arrived') ...[
          _actionButton('Start Trip', const Color(0xFFFFB800),
              Icons.play_arrow, _startTrip),
          const SizedBox(height: 8),
          _actionButton('Customer No-Show', Colors.red,
              Icons.person_off, _reportNoShow,
              outlined: true),
        ],
        if (status == 'in_progress')
          _actionButton('Complete Trip', Colors.green,
              Icons.check_circle, _completeTrip),
      ],
    );
  }

  Widget _actionButton(
      String label, Color color, IconData icon, VoidCallback onTap,
      {bool outlined = false}) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: outlined
          ? OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: color,
                side: BorderSide(color: color),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: Icon(icon),
              label: Text(label,
                  style: const TextStyle(fontSize: 16)),
              onPressed: onTap,
            )
          : ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: color,
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12)),
              ),
              icon: Icon(icon, color: Colors.white),
              label: Text(label,
                  style: const TextStyle(
                      fontSize: 16, color: Colors.white)),
              onPressed: onTap,
            ),
    );
  }

  Widget _doneButton() {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: Colors.grey,
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12)),
        ),
        onPressed: () => Navigator.pop(context),
        child: const Text('Back to Home',
            style: TextStyle(fontSize: 16, color: Colors.white)),
      ),
    );
  }
}
