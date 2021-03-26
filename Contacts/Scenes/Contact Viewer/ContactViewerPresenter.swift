//
//  ContactViewerPresenter.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import Foundation

protocol ContactViewerPresentationLogic: class {

}

final class ContactViewerPresenter: ContactViewerPresentationLogic {

  weak var viewController: ContactViewerDisplayLogic?

}
