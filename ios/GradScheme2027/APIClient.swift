import Foundation

enum APIError: LocalizedError {
    case badResponse
    var errorDescription: String? { "The scheme service returned an invalid response." }
}

struct APIClient {
    private let decoder: JSONDecoder = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return decoder
    }()

    func fetchSchemes() async throws -> SchemeResponse {
        let url = Configuration.apiBaseURL.appending(path: "api/schemes")
        let (data, response) = try await URLSession.shared.data(from: url)
        guard let http = response as? HTTPURLResponse, http.statusCode == 200 else {
            throw APIError.badResponse
        }
        return try decoder.decode(SchemeResponse.self, from: data)
    }
}

