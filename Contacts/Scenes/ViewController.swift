//
//  ViewController.swift
//  Contacts
//
//  Created by Glenn Posadas on 3/26/21.
//  Copyright © 2021 Outliant. All rights reserved.
//

import UIKit

class ViewController: UIViewController {
  
  var v: UIView!
  
  override func viewDidLoad() {
    super.viewDidLoad()
    
    view.backgroundColor = .white
  }
  
  override func viewDidAppear(_ animated: Bool) {
    super.viewDidAppear(animated)
    
    v = UIView.new(backgroundColor: .red)
    v.frame = CGRect(x: 100, y: 100, width: 50, height: 50)
    view.addSubview(v)
    
    DispatchQueue.main.asyncAfter(deadline: .now() + .seconds(2)) {
      guard let x = self.v.copyView() else { return }
      x.frame.origin.x = 150
      x.frame.origin.y = 200
      self.view.addSubview(x)
    }
  }
}

