//
//  BaseNavigationController.swift
//  FDFullscreenPopGestureDemo
//
//  Created by Glenn Posadas on 3/7/21.
//  Copyright © 2021 forkingdog. All rights reserved.
//

import UIKit

/**
 A subclass of `UINavigationController` that implements `FDFullscreenPopGesture`.
 This base navigationController class also conforms to `StatusBarToggelable` protocol.
 We can set the statusBar states (ie visibility, and animation style) by using navCon init method.
 We can also set it by using the extension method `setStatusBarAppearance` of `UIViewController`.
 The reason why we put everything in the navCon subclass is that ideally and most of the time, we embed the controller
 in a navCon even if our controller has no navBar. This means if we have a standalone modal, we could embed it in a navController to use this `StatusBarToggleable`.
 */
class BaseNavigationController: UINavigationController, StatusBarToggleable {
  
  // MARK: - Properties
  
  /// The gesture recognizer that actually handles interactive pop.
  lazy var fullscreenPopGestureRecognizer: UIPanGestureRecognizer = {
    let panGesture = UIPanGestureRecognizer()
    panGesture.maximumNumberOfTouches = 1
    panGesture.delegate = self.popGestureRecognizerDelegate
    return panGesture
  }()
  
  lazy var popGestureRecognizerDelegate: FullscreenPopGestureRecognizerDelegate = {
    let delegate = FullscreenPopGestureRecognizerDelegate()
    delegate.navigationController = self
    return delegate
  }()
  
  /// A view controller is able to control navigation bar's appearance by itself,
  /// rather than a global way, checking "prefersNavigationBarHidden" property.
  /// Default to YES, disable it if you don't want so.
  var viewControllerBasedNavigationBarAppearanceEnabled: Bool = true
  
  // MARK: - StatusBar | StatusBarToggleable
  
  var statusBarShouldBeHidden: Bool = false
  var statusBarAnimationStyle: UIStatusBarAnimation = .slide
  
  
  override var prefersStatusBarHidden: Bool { statusBarShouldBeHidden }
  override var preferredStatusBarUpdateAnimation: UIStatusBarAnimation { statusBarAnimationStyle }
  
  // MARK: - Overrides
  // MARK: Functions
  
  convenience init(
      rootViewController: UIViewController,
      statusBarShouldBeHidden: Bool = false,
      statusBarAnimationStyle: UIStatusBarAnimation = .slide) {
      
      self.init(rootViewController: rootViewController)
      self.statusBarShouldBeHidden = statusBarShouldBeHidden
      self.statusBarAnimationStyle = statusBarAnimationStyle
  }
  
  override func viewWillAppear(_ animated: Bool) {
      super.viewWillAppear(animated)
      
      updateStatusBarAppearance(completion: nil)
  }
  
  override func pushViewController(_ viewController: UIViewController, animated: Bool) {
    super.pushViewController(viewController, animated: animated)
    
    guard let viewController = viewController as? BaseController else { return }
    
    if let recognizers = interactivePopGestureRecognizer?.view?.gestureRecognizers,
       !recognizers.contains(fullscreenPopGestureRecognizer) {
      // Add our own gesture recognizer to where the onboard screen edge pan gesture recognizer is attached to.
      interactivePopGestureRecognizer?.view?.addGestureRecognizer(fullscreenPopGestureRecognizer)
      
      // Forward the gesture events to the private handler of the onboard gesture recognizer.
      if let internalTargets = interactivePopGestureRecognizer?.value(forKey: "targets") as? Array<NSObject> {
        if let internalTarget = internalTargets.first?.value(forKey: "target") {
          let internalAction = NSSelectorFromString("handleNavigationTransition:")
          fullscreenPopGestureRecognizer.delegate = popGestureRecognizerDelegate
          fullscreenPopGestureRecognizer.addTarget(internalTarget, action: internalAction)
          
          // Disable the onboard gesture recognizer.
          interactivePopGestureRecognizer?.isEnabled = false
        }
      }
    }
    
    // Handle perferred navigation bar appearance.
    self.setupViewControllerBasedNavigationBarAppearanceIfNeeded(viewController)
    
    // Forward to primary implementation.
    if !viewControllers.contains(viewController) {
      pushViewController(viewController, animated: animated)
    }
  }
  
  func setupViewControllerBasedNavigationBarAppearanceIfNeeded(_ appearingViewController: BaseController) {
    if !viewControllerBasedNavigationBarAppearanceEnabled {
      return
    }
    
    weak var weakSelf = self
    let block: ViewControllerWillAppearInjectBlock = { (viewController, animated) in
      if let strongSelf = weakSelf {
        strongSelf.setNavigationBarHidden(viewController.prefersNavigationBarHidden, animated: animated)
      }
    }
    
    // Setup will appear inject block to appearing view controller.
    // Setup disappearing view controller as well, because not every view controller is added into
    // stack by pushing, maybe by "-setViewControllers:".
    appearingViewController.willAppearInjectBlock = block
    if let disappearingViewController = viewControllers.last as? BaseController {
      if disappearingViewController.willAppearInjectBlock == nil {
        disappearingViewController.willAppearInjectBlock = block
      }
    }
  }
}
