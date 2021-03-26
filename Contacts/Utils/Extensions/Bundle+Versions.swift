//
//  Bundle+Versions.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

extension Bundle {
  /// Gets the name of the app - title under the icon.
  var displayName: String? {
    return object(forInfoDictionaryKey: "CFBundleDisplayName") as? String ??
      object(forInfoDictionaryKey: "CFBundleName") as? String
  }
  
  /// Release version numner
  var releaseVersionNumber: String {
    return (infoDictionary?["CFBundleShortVersionString"] as? String) ?? ""
  }
  
  /// Build version number
  var buildVersionNumber: String? {
    return infoDictionary?["CFBundleVersion"] as? String
  }
  
  /// Custom/Pretty version number
  var releaseVersionNumberPretty: String {
    "Version \(releaseVersionNumber)"
  }
  
  /// The version from the server config
  var version: String {
    releaseVersionNumber
  }
  
  /// Get the Int version of the app.
  
  var versionInt: Int {
    if let buildVersion = Bundle.main.buildVersionNumber,
       let versionInt = Int("\(buildVersion)") {
      return versionInt
    }
    
    return 1
  }
}
