//
//  ContactsENVManager.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

/**
 Manages the environment of the application.
 */
struct ENVManager {
  enum ENVType: String {
    /// Production / Live targetting LIVE API endpoint
    case production = ""
    /// Development env targetting DEV API endpoint
    case development = "DEV"
    /// Unit and UI Testing env targetting DEV API endpoint
    case unitUITest = "TESTING"
  }
  
  private static let production: Bool = {
    #if DEBUG
    let dic = ProcessInfo.processInfo.environment
    if let forceProduction = dic["forceProduction"] , forceProduction == "true" {
      return true
    }
    
    return false
    
    #else
    return true
    #endif
  }()
  
  static var currentEnv: ENVType {
    get {
      if self.production {
        return .production
      } else {
        // Check first if we're in unit testing
        let dic = ProcessInfo.processInfo.environment
        if let isUnitTesting = dic["unitUITest"], isUnitTesting == "true" {
          return .unitUITest
        }
        
        return .development
      }
    }
  }
}


