//
//  UIView+Shimmer.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

extension UIView {
  func shimmer() {
    let gradientBackgroundColor: CGColor = UIColor(white: 0.85, alpha: 1.0).cgColor
    let gradientMovingColor: CGColor = UIColor(white: 0.75, alpha: 1.0).cgColor
    
    let gradientLayer = CAGradientLayer()
    gradientLayer.frame = self.bounds
    gradientLayer.startPoint = CGPoint(x: 0.0, y: 1.0)
    gradientLayer.endPoint = CGPoint(x: 1.0, y: 1.0)
    gradientLayer.colors = [
      gradientBackgroundColor,
      gradientMovingColor,
      gradientBackgroundColor
    ]
    gradientLayer.locations = [-1.0, -0.5, 0.0]
    self.layer.addSublayer(gradientLayer)
    
    let startLocations: [NSNumber] = [-1.0, -0.5, 0.0]
    let endLocations: [NSNumber] = [1.0, 1.5, 2.0]
    
    let movingAnimationDuration: CFTimeInterval = 0.8
    let delayBetweenAnimationLoops: CFTimeInterval = 1.0
    
    let animation = CABasicAnimation(keyPath: "locations")
    animation.fromValue = startLocations
    animation.toValue = endLocations
    animation.duration = movingAnimationDuration
    animation.timingFunction = CAMediaTimingFunction(name: CAMediaTimingFunctionName.easeInEaseOut)
    
    let animationGroup = CAAnimationGroup()
    animationGroup.duration = movingAnimationDuration + delayBetweenAnimationLoops
    animationGroup.animations = [animation]
    animationGroup.repeatCount = .infinity
    gradientLayer.add(animationGroup, forKey: animation.keyPath)
  }
  
  func removeShimmer() {
    guard let sublayers = self.layer.sublayers else {
      return
    }
    
    sublayers.forEach { $0.removeFromSuperlayer() }
  }
}
