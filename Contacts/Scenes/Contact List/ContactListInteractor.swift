//
//  ContactListInteractor.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

protocol ContactListBusinessLogic: class {

}

protocol ContactListDataStore: class {

}

class ContactListInteractor: ContactListBusinessLogic, ContactListDataStore {

  var presenter: ContactListPresentationLogic?
  var worker: ContactListWorker?

}
