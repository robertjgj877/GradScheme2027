import BackgroundTasks

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
            return response.schemes.count
        }
        task.expirationHandler = { work.cancel() }
        Task { task.setTaskCompleted(success: (try? await work.value) != nil) }
    }
}

