---
layout: post
title: "Swift UI WebView"
subtitle: "xcode / intent"
date: 2023-04-23 13:15:51 -0400
background: '/img/posts/apple.jpeg'
tags: [swift]
---

### Preview

<img src="/img/work/alldeal_ios_main.jpg" width="70%" height="70%"> 	

<br>

#### Content View

``` swift
//
//  AllDealApp.swift
//  AllDeal
//
//  Created by Ethan Kim on 2023/04/04.
//

import SwiftUI

extension View{
    func toAnyView() -> AnyView{
        AnyView(self)
    }
}

struct ContentView: View {
    
    @State private var showLoading: Bool = false
    
    var body: some View {
        VStack {
            WebView(url:URL(string: "https:alldeal.kr")!, showLoading: $showLoading).overlay(showLoading ? ProgressView("Loading...").toAnyView():EmptyView().toAnyView())
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

```

<br>

#### WebView.swift

``` swift

//
//  AllDealApp.swift
//  AllDeal
//
//  Created by Ethan Kim on 2023/04/04.
//

import Foundation
import SwiftUI
import WebKit

struct WebView: UIViewRepresentable{
    let url: URL
    @Binding var showLoading: Bool
    
    func makeUIView(context: Context) -> some UIView {
        let webView = WKWebView()
        webView.navigationDelegate = context.coordinator
        let request = URLRequest(url: url)
        webView.allowsBackForwardNavigationGestures = true //history back(loading problem.....)
        webView.load(request)
        
        return webView
    }
    
    func updateUIView(_ uiView: UIViewType, context: Context) {
        
    }
    
    //Handle URL scheme TEST.............
    func handleURLScheme(_ url: URL) -> Bool{
        if url.scheme == "kakaologin"{
            if UIApplication.shared.canOpenURL(url){
                UIApplication.shared.open(url)
            }
            return true
        }
        return false
    }
    
    func makeCoordinator() -> WebViewCoordinator {
        WebViewCoordinator(didStart: {
            //showLoading=true
        }, didFinish: {
            //showLoading=false
        })
    }
}

class WebViewCoordinator: NSObject, WKNavigationDelegate, UIImagePickerControllerDelegate, UINavigationControllerDelegate {
    var didStart: () -> Void
    var didFinish: () -> Void
    
    init(didStart:@escaping () -> Void, didFinish: @escaping () -> Void){
        self.didStart = didStart
        self.didFinish = didFinish
    }
    
    func webView(_ webView: WKWebView, didStartProvisionalNavigation navigation: WKNavigation!) {
        didStart()
    }
    
    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        didFinish()
    }
}

```
