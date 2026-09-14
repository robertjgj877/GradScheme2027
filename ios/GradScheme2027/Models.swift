import Foundation

enum ApplicationStatus: String, Codable, CaseIterable, Identifiable {
    case interested, applying, submitted, interview, offer, rejected
    var id: String { rawValue }
    var label: String { rawValue.capitalized }
}

struct Scheme: Codable, Identifiable, Hashable {
    let id: String
    let employer: String
    let title: String
    let location: String
    let description: String
    let applicationURL: URL
    let sourceURL: URL
    let sourceName: String
    let startYear: Int
    let startEvidence: String
    let openedAt: Date?
    let deadline: Date?
    let discoveredAt: Date
    let isLondon: Bool

    var daysUntilDeadline: Int? {
        guard let deadline else { return nil }
        return Calendar.current.dateComponents([.day], from: .now, to: deadline).day
    }
}

struct SchemeResponse: Codable {
    let schemes: [Scheme]
    let generatedAt: Date
}

