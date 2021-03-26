//
//  FullscreenPopGestureRecognizerDelegate.swift
//  FDFullscreenPopGestureDemo
//
//  Created by Glenn Posadas on 3/7/21.
//  Copyright © 2021 forkingdog. All rights reserved.
//

import UIKit

class FullscreenPopGestureRecognizerDelegate: NSObject {
  
  // MARK: - Properties
  
  var navigationController: BaseNavigationController?
  
  // MARK: - Overrides
  // MARK: Functions
}

// MARK: - UIGestureRecognizerDelegate

extension FullscreenPopGestureRecognizerDelegate: UIGestureRecognizerDelegate {
  func gestureRecognizerShouldBegin(_ gestureRecognizer: UIGestureRecognizer) -> Bool {
    guard let panGesture = gestureRecognizer as? UIPanGestureRecognizer else { return true }
    
    // Ignore when no view controller is pushed into the navigation stack.
    if navigationController?.viewControllers.count ?? 0 <= 1 {
      return false
    }
    
    if let topVC = navigationController?.viewControllers.last as? BaseController {
      if topVC.interactivePopDisabled {
        return false
      }
      
      let beginningLocationX = panGesture.location(in: panGesture.view).x
      
      if let maxAllowedInitialDistance = topVC.interactivePopMaxAllowedInitialDistanceToLeftEdge {
        // Ignore when the beginning location is beyond max allowed initial distance to left edge.
        if maxAllowedInitialDistance > 0 && beginningLocationX > maxAllowedInitialDistance {
          return false
        }
        
        // Ignore pan gesture when the navigation controller is currently in transition.
        if navigationController?.value(forKey: "_isTransitioning") as? Bool == true {
          return true
        }
        
        // Prevent calling the handler when the gesture begins in an opposite direction.
        let translation = panGesture.translation(in: panGesture.view)
        let isLTR = UIApplication.shared.userInterfaceLayoutDirection == .leftToRight
        let multiplier = isLTR ? 1 : -1
        
        if (Int(translation.x) * multiplier) <= 0 {
          return false
        }
      }
    }
    
    return true
  }
}
