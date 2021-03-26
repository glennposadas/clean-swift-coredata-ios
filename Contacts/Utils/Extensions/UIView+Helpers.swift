//
//  UIView+Helpers.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

extension UIView {
  /// Helper for adding multiple subviews in a view.
  func addSubviews(_ views: UIView...) {
    views.forEach({self.addSubview($0)})
  }
  
  /// Generates a generic view with specic bg.
  static func new(backgroundColor: UIColor?, alpha: CGFloat = 1.0, isHidden: Bool = false) -> UIView {
    let view = UIView()
    view.backgroundColor = backgroundColor ?? .white
    view.alpha = alpha
    view.isHidden = isHidden
    return view
  }
  
  func copyView<T: UIView>() -> T? {
    do {
      let archivedData = try NSKeyedArchiver.archivedData(withRootObject: self, requiringSecureCoding: false)
      return try NSKeyedUnarchiver.unarchiveTopLevelObjectWithData(archivedData) as? T
    } catch {
      print(error.localizedDescription)
      return nil
    }
  }
}
