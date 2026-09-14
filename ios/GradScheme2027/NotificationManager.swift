import UserNotifications

actor NotificationManager {
    static let shared = NotificationManager()

    func requestPermission() async {
        _ = try? await UNUserNotificationCenter.current()
            .requestAuthorization(options: [.alert, .badge, .sound])
    }

    func notifyNewScheme(_ scheme: Scheme) async {
        let content = UNMutableNotificationContent()
        content.title = "New 2027 scheme: \(scheme.employer)"
        content.body = "\(scheme.title) — \(scheme.location)"
        content.sound = .default
        let request = UNNotificationRequest(identifier: scheme.id, content: content, trigger: nil)
        try? await UNUserNotificationCenter.current().add(request)
    }
}

