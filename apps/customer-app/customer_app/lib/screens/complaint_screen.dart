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
    'Le chauffeur était impoli',
    'Le chauffeur était en retard',
    'Le chauffeur n\'est pas arrivé',
    'Mauvais itinéraire',
    'Autre',
  ];

  @override
  void dispose() {
    _descController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (_selectedReason == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Veuillez sélectionner une raison')));
      return;
    }
    final driverId = widget.trip['driver_id']?.toString();
    if (driverId == null) {
      ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Aucun chauffeur associé à ce trajet')));
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
        await showDialog(
          context: context,
          barrierDismissible: false,
          builder: (_) => AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            title: const Row(children: [
              Icon(Icons.info_outline, color: Color(0xFFF97316)),
              SizedBox(width: 8),
              Text('Signalement enregistré',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ]),
            content: const Text(
              'Votre signalement a été enregistré dans nos systèmes.\n\n'
              '📍 Preuve numérique disponible\n'
              'Ce trajet est enregistré par GPS : itinéraire exact, heure de départ et d\'arrivée, '
              'identité du chauffeur et du client. DjibRide dispose de toutes les preuves '
              'techniques pour vérifier les faits si nécessaire.\n\n'
              '⚠️ DjibRide est une plateforme de mise en relation. '
              'Nous ne sommes pas un service de médiation ou de règlement de litiges.\n\n'
              'Les conflits doivent être résolus directement entre les parties '
              'ou par les voies légales compétentes à Djibouti.\n\n'
              'DjibRide n\'interviendra pas dans votre litige et n\'accordera '
              'aucune compensation financière à ce titre.',
              style: TextStyle(fontSize: 13, height: 1.55),
            ),
            actions: [
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF97316),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  Navigator.pop(context);  // close dialog
                  Navigator.pop(context);  // close screen
                },
                child: const Text('Compris', style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        );
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text(result['message'] ?? 'Échec de l\'envoi')));
      }
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Erreur de connexion. Réessayez.')));
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
        backgroundColor: const Color(0xFFF97316),
        title: const Text('Signaler un problème', style: TextStyle(color: Colors.white)),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [

            // ── GPS proof banner ───────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFE8F5E9),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.green.withOpacity(.4)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Icon(Icons.gps_fixed, color: Colors.green, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Historique numérique enregistré\n\n'
                      'Chaque trajet est enregistré par GPS : itinéraire exact, '
                      'heure de départ et d\'arrivée, identité du chauffeur et du client. '
                      'DjibRide dispose de toutes les preuves techniques pour vérifier '
                      'les faits en cas de besoin.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF1B5E20), height: 1.55),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),

            // ── Disclaimer banner ──────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFFFFF3E0),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFFF97316).withOpacity(.4)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Icon(Icons.warning_amber_rounded, color: Color(0xFFF97316), size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'DjibRide n\'est pas un service de médiation. '
                      'Votre signalement est enregistré à titre informatif uniquement. '
                      'DjibRide n\'interviendra pas dans les litiges entre utilisateurs.',
                      style: TextStyle(fontSize: 12, color: Color(0xFF7C4700), height: 1.5),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Trip summary ───────────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.grey.shade100,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('Trajet', style: TextStyle(fontSize: 12, color: Colors.grey)),
                  const SizedBox(height: 4),
                  Text('${trip['pickup_location']} → ${trip['dropoff_location']}',
                      style: const TextStyle(fontWeight: FontWeight.bold)),
                  if (trip['driver_name'] != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      'Chauffeur : ${[trip['driver_name'], trip['driver_father_name'], trip['driver_grandfather_name']].where((x) => x != null && x.toString().isNotEmpty).join(' ')}',
                      style: const TextStyle(fontSize: 13, color: Colors.grey),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Reason ─────────────────────────────────────────────────────
            const Text('Raison', style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            ..._reasons.map((r) => RadioListTile<String>(
                  title: Text(r),
                  value: r,
                  groupValue: _selectedReason,
                  activeColor: const Color(0xFFF97316),
                  contentPadding: EdgeInsets.zero,
                  onChanged: (v) => setState(() => _selectedReason = v),
                )),
            const SizedBox(height: 8),

            // ── Description ────────────────────────────────────────────────
            const Text('Description (optionnel)',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 10),
            TextField(
              controller: _descController,
              maxLines: 4,
              decoration: InputDecoration(
                hintText: 'Décrivez ce qui s\'est passé…',
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
            const SizedBox(height: 24),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFF97316),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Envoyer le signalement',
                        style: TextStyle(fontSize: 17, color: Colors.white)),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
