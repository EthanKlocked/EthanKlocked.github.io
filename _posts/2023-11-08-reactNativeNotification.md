---
layout: post
title: "앱 푸시알림 연동"
subtitle: "Firebase / Notification"
date: 2023-11-08 14:55:23 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 기능 설명
* Firebase 연동을 통한 디바이스 앱 푸시 알림 수신
* 모바일 내 앱 구동/미구동(백그라운드) 상태에서 알림 UI 노출

<br>

### 세팅 순서
1. Firebase 내 IOS/Android 앱 생성
2. 내려받은 JSON 파일 세팅 및 각 Native code작성을 통한 연동 sdk 설치
3. IOS 연동을 위한 APN 키 발급 및 Firebase 내 세팅
4. react native 라이브러리 설치 (firebase message 수신 연동 / foreground push notification 노출)
5. react native 라이브러리를 통한 코드 세팅 (토큰 송신, 알림 수신)

<br>

##### Fireabase 앱 생성 및 키 세팅

* IOS/Android 각 생성 및 안내에 따라 각 JSON파일/코드세팅
<img src="/img/posts/firebase_regi.PNG" width="70%" height="70%"> 	
<br>

##### IOS APN 키 발급 및 세팅
<img src="/img/posts/apn_cert.png" width="90%" height="90%"> 	
<img src="/img/posts/apn_set.png" width="90%" height="90%"> 	
<br>

##### 라이브러리 설치 및 코드작성

<br>

##### 구동 테스트
