---
layout: post
title: "Swift UI Test"
subtitle: "xcode / app"
date: 2023-03-28 15:10:51 -0400
background: '/img/posts/apple.jpeg'
tags: [swift]
---

### Preview

<img src="/img/posts/swiftUITest.png" width="70%" height="70%"> 	

<br>

#### Content View (Swift UI)

``` swift
//
//  ContentView.swift
//  L1 Demo
//
//  Created by Ethan Kim on 2023/03/30.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        ZStack {
            Image("background-wood-cartoon")
                .resizable()
                .ignoresSafeArea()
            
            VStack{
                Spacer()
                Image("logo")
                Spacer()
                HStack{
                    Spacer()
                    Image("card2")
                    Spacer()
                    Image("card3")
                    Spacer()
                }
                Spacer()
                Image("button")
                Spacer()
                HStack{
                    Spacer()
                    VStack{
                        Text("Player")
                            .font(.headline)
                            .padding(.bottom, 10)
                        Text("0")
                    }
                    Spacer()
                    VStack{
                        Text("CPU")
                            .font(.headline)
                            .padding(.bottom, 10)
                        Text("0")
                    }
                    Spacer()
                }
                .foregroundColor(.white)
                Spacer()
            }
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView()
    }
}

```
