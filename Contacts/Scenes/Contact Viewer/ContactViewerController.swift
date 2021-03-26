//
//  ContactViewerController.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

protocol ContactViewerDisplayLogic: class {

}

final class ContactViewerController: UIViewController {

  var interactor: ContactViewerBusinessLogic?
  var router: (ContactViewerRoutingLogic & ContactViewerDataPassing)?

  // MARK: Object lifecycle

  override init(nibName nibNameOrNil: String?, bundle nibBundleOrNil: Bundle?) {
    super.init(nibName: nibNameOrNil, bundle: nibBundleOrNil)
    setup()
  }

  required init?(coder aDecoder: NSCoder) {
    super.init(coder: aDecoder)
    setup()
  }

  // MARK: Setup

  private func setup() {
    let viewController = self
    let interactor = ContactViewerInteractor()
    let presenter = ContactViewerPresenter()
    let worker = ContactViewerWorker()
    let router = ContactViewerRouter()
    viewController.interactor = interactor
    viewController.router = router
    interactor.presenter = presenter
    interactor.worker = worker
    presenter.viewController = viewController
    router.viewController = viewController
    router.dataStore = interactor
  }
}

extension ContactViewerController: ContactViewerDisplayLogic {

}
