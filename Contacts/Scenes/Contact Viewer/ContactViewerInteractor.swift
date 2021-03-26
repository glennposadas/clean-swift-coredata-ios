//
//  ContactViewerInteractor.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

protocol ContactViewerBusinessLogic: class {

}

protocol ContactViewerDataStore: class {

}

class ContactViewerInteractor: ContactViewerBusinessLogic, ContactViewerDataStore {

  var presenter: ContactViewerPresentationLogic?
  var worker: ContactViewerWorker?

}
