//
//  ContactListRouter.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

protocol ContactListRoutingLogic: class {

}

protocol ContactListDataPassing: class {
  var dataStore: ContactListDataStore? { get }
}

final class ContactListRouter: ContactListRoutingLogic, ContactListDataPassing {

  weak var viewController: ContactListController?
  var dataStore: ContactListDataStore?

}
