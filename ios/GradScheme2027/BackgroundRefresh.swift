import BackgroundTasks
import Foundation

final class BackgroundRefresh {
    static let shared = BackgroundRefresh()
    private let identifier = "uk.co.gradscheme2027.refresh"

    func register() {
        BGTaskScheduler.shared.register(forTaskWithIdentifier: identifier, using: nil) { task in
            guard let refresh = task as? BGAppRefreshTask else { return }
            self.handle(refresh)
        }
    }

    func schedule() {
        let request = BGAppRefreshTaskRequest(identifier: identifier)
        request.earliestBeginDate = .now.addingTimeInterval(4 * 60 * 60)
        try? BGTaskScheduler.shared.submit(request)
    }

    private func handle(_ task: BGAppRefreshTask) {
        schedule()
        let work = Task {
            let response = try await APIClient().fetchSchemes()
            let defaults = UserDefaults.standard
            let key = "seenSchemeIDs"
            let seen = Set(defaults.stringArray(forKey: key) ?? [])
            let valid = response.schemes.filter { $0.startYear == 2027 }
            for scheme in valid.filter({ !seen.contains($0.id) }).prefix(5) {
                await NotificationManager.shared.notifyNewScheme(scheme)
            }
            defaults.set(Array(seen.union(valid.map(\.id))), forKey: key)
            return valid.count
        }
        task.expirationHandler = { work.cancel() }
        Task { task.setTaskCompleted(success: (try? await work.value) != nil) }
    }
}
