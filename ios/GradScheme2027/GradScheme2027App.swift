import SwiftUI
import BackgroundTasks

@main
struct GradScheme2027App: App {
    @StateObject private var store = SchemeStore()

    init() {
        BackgroundRefresh.shared.register()
    }

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(store)
                .task {
                    await NotificationManager.shared.requestPermission()
                    await store.refresh()
                    BackgroundRefresh.shared.schedule()
                }
        }
    }
}

