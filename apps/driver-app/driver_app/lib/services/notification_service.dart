import 'package:flutter_local_notifications/flutter_local_notifications.dart';

class NotificationService {
  static final _plugin = FlutterLocalNotificationsPlugin();
  static bool _initialized = false;

  static Future<void> init() async {
    if (_initialized) return;

    const android = AndroidInitializationSettings('@mipmap/ic_launcher');
    const ios = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _plugin.initialize(
      const InitializationSettings(android: android, iOS: ios),
    );
    _initialized = true;
  }

  static Future<void> showNewTrip(int count) async {
    const android = AndroidNotificationDetails(
      'new_trips',
      'New Trip Requests',
      channelDescription: 'Alerts for new customer trip requests',
      importance: Importance.high,
      priority: Priority.high,
      playSound: true,
    );
    const ios = DarwinNotificationDetails();
    await _plugin.show(
      1,
      count > 1 ? '$count New Trip Requests' : 'New Trip Request!',
      'A customer needs a ride. Open the app to accept.',
      const NotificationDetails(android: android, iOS: ios),
    );
  }

  static Future<void> showTripUpdate(String title, String body) async {
    const android = AndroidNotificationDetails(
      'trip_updates',
      'Trip Updates',
      channelDescription: 'Updates on your current trip',
      importance: Importance.defaultImportance,
      priority: Priority.defaultPriority,
    );
    const ios = DarwinNotificationDetails();
    await _plugin.show(
      2, title, body,
      const NotificationDetails(android: android, iOS: ios),
    );
  }
}
