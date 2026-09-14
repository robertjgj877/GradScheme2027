import SwiftUI

struct ContentView: View {
    @EnvironmentObject private var store: SchemeStore

    var body: some View {
        NavigationStack {
            Group {
                if store.filtered.isEmpty && store.isLoading {
                    ProgressView("Checking 2027 schemes…")
                } else if store.filtered.isEmpty {
                    ContentUnavailableView("No matching schemes", systemImage: "briefcase", description: Text(store.errorMessage ?? "Pull down to check again."))
                } else {
                    List(store.filtered) { scheme in
                        NavigationLink(value: scheme) { SchemeRow(scheme: scheme) }
                    }
                    .refreshable { await store.refresh() }
                }
            }
            .navigationTitle("GradScheme 2027")
            .searchable(text: $store.query, prompt: "Employer or role")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button { store.londonOnly.toggle() } label: {
                        Image(systemName: store.londonOnly ? "building.2.fill" : "building.2")
                    }.accessibilityLabel("London only")
                }
            }
            .navigationDestination(for: Scheme.self) { SchemeDetail(scheme: $0) }
            .task { await store.refresh() }
        }
    }
}

private struct SchemeRow: View {
    let scheme: Scheme
    var body: some View {
        VStack(alignment: .leading, spacing: 6) {
            HStack { Text(scheme.employer).font(.headline); Spacer(); if scheme.isLondon { Text("LONDON").font(.caption2.bold()).foregroundStyle(.blue) } }
            Text(scheme.title).font(.subheadline)
            Label(scheme.location, systemImage: "mappin.and.ellipse").font(.caption).foregroundStyle(.secondary)
            if let days = scheme.daysUntilDeadline { Text(days >= 0 ? "Deadline in \(days) days" : "Deadline passed").font(.caption.bold()).foregroundStyle(days < 7 ? .red : .secondary) }
        }.padding(.vertical, 4)
    }
}

private struct SchemeDetail: View {
    let scheme: Scheme
    @AppStorage private var statusRaw: String

    init(scheme: Scheme) {
        self.scheme = scheme
        _statusRaw = AppStorage(wrappedValue: ApplicationStatus.interested.rawValue, "status.\(scheme.id)")
    }

    var body: some View {
        Form {
            Section("Scheme") {
                LabeledContent("Employer", value: scheme.employer)
                LabeledContent("Location", value: scheme.location)
                LabeledContent("Start", value: "2027")
                Text(scheme.startEvidence).font(.caption).foregroundStyle(.secondary)
            }
            Section("My application") {
                Picker("Status", selection: $statusRaw) {
                    ForEach(ApplicationStatus.allCases) { Text($0.label).tag($0.rawValue) }
                }
            }
            Section("Details") { Text(scheme.description) }
            Section { Link("Apply on employer website", destination: scheme.applicationURL); Link("View source", destination: scheme.sourceURL) }
        }.navigationTitle(scheme.title).navigationBarTitleDisplayMode(.inline)
    }
}

