//
//  UIViewController+StatusBar.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

extension UIViewController {
  /// A helper function that can be called from any controller.
  /// Example: `navigationController?.setStatusBarAppearance()`.
  func setStatusBarAppearance(statusBarShouldBeHidden hidden: Bool,
                              statusBarAnimationStyle: UIStatusBarAnimation = .slide) {
    func set(controller: BaseNavigationController) {
      controller.statusBarShouldBeHidden = hidden
      controller.statusBarAnimationStyle = statusBarAnimationStyle
      controller.updateStatusBarAppearance(completion: nil)
    }
    if let controller = self as? BaseNavigationController {
      set(controller: controller)
    } else if let controller = self.navigationController as? BaseNavigationController {
      set(controller: controller)
    }
  }
}
