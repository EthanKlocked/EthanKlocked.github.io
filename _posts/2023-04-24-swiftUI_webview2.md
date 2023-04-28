---
layout: post
title: "Swift UI WebView2"
subtitle: "Camera permission / image upload"
date: 2023-04-24 17:23:11 -0400
background: '/img/posts/apple.jpeg'
tags: [swift]
---

### Preview

* 웹뷰 페이지 컨트롤 및 뒤로가기 설정
* intent, 카카오로그인, 카카오링크 설정
* 카메라 기능, 업로드 연동 설정

<div padding="1em" background="#eee">
    <img src="/img/work/alldeal_ios_login.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_main.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_desc.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_guide.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_mypage.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_team.jpg" width="20%" height="20%"> 	
    <img src="/img/work/alldeal_ios_myteam.jpg" width="20%" height="20%"> 	
</div>

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

* 카메라 권한허용 체크 추가
* 업로드 연동기능 추가

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
import AVFoundation
import Photos

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
    var showImagePicker: (() -> Void)?
    var selectedImage: ((UIImage?) -> Void)?
    
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
    
    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        print(error)
    }
    
    func checkCameraPermission(completion: @escaping (Bool) -> Void) {
        let authStatus = AVCaptureDevice.authorizationStatus(for: .video)
        switch authStatus {
        case .authorized:
            completion(true)
        case .denied, .restricted:
            completion(false)
        case .notDetermined:
            AVCaptureDevice.requestAccess(for: .video) { granted in
                completion(granted)
            }
        @unknown default:
            completion(false)
        }
    }
    
    func checkPhotoLibraryPermission(completion: @escaping (Bool) -> Void) {
        let status = PHPhotoLibrary.authorizationStatus()
        switch status {
        case .authorized:
            completion(true)
        case .denied, .restricted:
            completion(false)
        case .notDetermined:
            PHPhotoLibrary.requestAuthorization { status in
                completion(status == .authorized)
            }
        @unknown default:
            completion(false)
        }
    }
    
    func showImagePickerWithPermissionCheck(completion: @escaping (UIImage?) -> Void) {
        checkCameraPermission { granted in
            if granted {
                DispatchQueue.main.async {
                    self.showImagePicker?()
                }
                self.selectedImage = completion
            } else {
                // show an alert to inform the user that camera access is required
            }
        }
    }
    
    func imagePickerController(_ picker: UIImagePickerController, didFinishPickingMediaWithInfo info: [UIImagePickerController.InfoKey : Any]) {
        let image = info[.originalImage] as? UIImage
        selectedImage?(image)
        picker.dismiss(animated: true, completion: nil)
    }
    
    func imagePickerControllerDidCancel(_ picker: UIImagePickerController) {
        selectedImage?(nil)
        picker.dismiss(animated: true, completion: nil)
    }
}



```
