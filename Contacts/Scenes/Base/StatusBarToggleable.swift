//
//  StatusBarToggleable.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

protocol StatusBarToggleable: class {
  var statusBarShouldBeHidden: Bool { get set }
  var statusBarAnimationStyle: UIStatusBarAnimation { get set }
}

extension StatusBarToggleable where Self: UIViewController {
  func updateStatusBarAppearance(
    withDuration duration: Double = 0.3,
    completion: ((Bool) -> Void)? = nil) {
    UIView.animate(withDuration: duration, animations: { [weak self] in
      self?.setNeedsStatusBarAppearanceUpdate()
    }, completion: completion)
  }
}
