import Foundation

@MainActor
final class SchemeStore: ObservableObject {
    @Published private(set) var schemes: [Scheme] = []
    @Published private(set) var isLoading = false
    @Published var errorMessage: String?
    @Published var query = ""
    @Published var londonOnly = false

    private let api = APIClient()
    private let cacheURL = URL.documentsDirectory.appending(path: "schemes.json")
    private let seenKey = "seenSchemeIDs"

    init() { loadCache() }

    var filtered: [Scheme] {
        schemes.filter { scheme in
            (!londonOnly || scheme.isLondon) &&
            (query.isEmpty || [scheme.employer, scheme.title, scheme.location]
                .joined(separator: " ").localizedCaseInsensitiveContains(query))
        }
    }

    func refresh() async {
        guard !isLoading else { return }
        isLoading = true
        defer { isLoading = false }
        do {
            let response = try await api.fetchSchemes()
            let accepted = response.schemes
                .filter { $0.startYear == 2027 }
                .sorted { ($0.isLondon ? 0 : 1, $0.deadline ?? .distantFuture) < ($1.isLondon ? 0 : 1, $1.deadline ?? .distantFuture) }
            await notifyAboutNewSchemes(accepted)
            schemes = accepted
            try saveCache(accepted)
            errorMessage = nil
        } catch {
            errorMessage = schemes.isEmpty ? error.localizedDescription : nil
        }
    }

    private func notifyAboutNewSchemes(_ incoming: [Scheme]) async {
        let defaults = UserDefaults.standard
        let seen = Set(defaults.stringArray(forKey: seenKey) ?? [])
        let newItems = incoming.filter { !seen.contains($0.id) }
        if !seen.isEmpty {
            for scheme in newItems.prefix(5) {
                await NotificationManager.shared.notifyNewScheme(scheme)
            }
        }
        defaults.set(Array(Set(incoming.map(\.id)).union(seen)), forKey: seenKey)
    }

    private func saveCache(_ value: [Scheme]) throws {
        let encoder = JSONEncoder()
        encoder.dateEncodingStrategy = .iso8601
        try encoder.encode(value).write(to: cacheURL, options: .atomic)
    }

    private func loadCache() {
        guard let data = try? Data(contentsOf: cacheURL) else { return }
        let decoder = JSONDecoder(); decoder.dateDecodingStrategy = .iso8601
        schemes = (try? decoder.decode([Scheme].self, from: data)) ?? []
    }
}

