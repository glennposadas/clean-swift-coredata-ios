//
//  ContactViewerRouter.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

protocol ContactViewerRoutingLogic: class {

}

protocol ContactViewerDataPassing: class {
  var dataStore: ContactViewerDataStore? { get }
}

final class ContactViewerRouter: ContactViewerRoutingLogic, ContactViewerDataPassing {

  weak var viewController: ContactViewerController?
  var dataStore: ContactViewerDataStore?

}
