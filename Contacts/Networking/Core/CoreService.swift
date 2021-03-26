//
//  CoreService.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Moya

/// The max items per page in every network calls.
public let MAX_DATA_PER_PAGE: Int = 20

public let baseURLStringLIVE = ""
public let apiVersionLIVE = "/api"

public let baseURLStringLocal = ""
public let apiVersionLocal = "/api"

public let baseURLString = (baseURLStringLIVE + apiVersionLIVE) //ENVManager.currentEnv == .production ?
    //(baseURLStringLIVE + apiVersionLIVE) : (baseURLStringLocal + apiVersionLocal)

/// Helper function
public func stubbedResponse(_ filename: String) -> Data! {
    @objc class TestClass: NSObject { }
    
    let bundle = Bundle(for: TestClass.self)
    let path = bundle.path(forResource: filename, ofType: "json")
    return (try? Data(contentsOf: URL(fileURLWithPath: path!)))
}

/// The core class of sEmojo Networking
/// The constants for networking is stored in the file `CoreService.swift`.
class CoreService {
    
    /// Determines if each managers call the API verbosely.
    static var verbose: Bool = false
    
    /// Generates a bearer token.
    class func getBearerToken() -> String? {
//        if let authModel = AppDefaults.getObjectWithKey(.authModel, type: AuthModel.self) {
//            return "Bearer " + authModel.token
//        }
        
        return nil
    }
    
    class func JSONResponseDataFormatter(_ data: Data) -> String {
        do {
            let dataAsJSON = try JSONSerialization.jsonObject(with: data)
            let prettyData = try JSONSerialization.data(withJSONObject: dataAsJSON, options: .prettyPrinted)
            return String(data: prettyData, encoding: .utf8) ?? String(data: data, encoding: .utf8) ?? ""
        } catch {
            return String(data: data, encoding: .utf8) ?? ""
        }
    }
    
    /// Generates required headers for all API endpoints.
    class func getHeaders() -> [String : String] {
        return [
            "Content-type"  : "application/json",
            "X-EMOJO-Country" : "PH",
            "User-Agent"    : "Emojo User App/\(Bundle.main.version) Build #\(Bundle.main.buildVersionNumber ?? "") (iOS/\(UIDevice.current.systemVersion)) CFNetwork/672.1.13",
            "X-EMOJO-Platform": "IOS",
            "Authorization" : CoreService.getBearerToken() ?? ""
        ]
    }
}


