---
layout: post
title: "Android Webview Debugging"
subtitle: "Chrome inspect"
date: 2022-08-19 11:05:11 -0400
background: '/img/posts/android_back.jpg'
tags: [android, javascript]
---

### 안드로이드 스튜디오 웹뷰 디버깅 
* 문제발생 상황
    1. 안드로이드 웹뷰 구성 및 리액트 앱 출력 시도
    2. 리액트 앱 출력 에러
    3. 안드로이드 콘솔창에서 오류 확인이 불가능함

<br>

### 데스크탑 Chrome 브라우저 활용
* chrome://inspect 접속
    1. 자동으로 현재 기기에서 사용 중인 크롬 접속 리스트 표시
    2. 안드로이드 에뮬레이터 혹은 USB 선택하여 inspect 클릭
    3. 새로 열린 자식페이지 개발자도구에서 해당 크롬접속에 대한 콘솔 창 확인 가능

<br>

### 진입 및 디버깅 화면

<img src="/img/posts/inspectReady.png" width="90%" height="90%"> 	

<br>

<img src="/img/posts/inspectResult.png" width="90%" height="90%"> 	

<br>

### 문제 해결
* 콘솔창 확인 결과 
    1. 리액트 앱에서 사용 중인 api 라이브러리에서 오류 발생
    2. api 통신 중 사용되는 localStorage 사용 불가 에러 포착
    3. android webview 에서 localStorage 사용 세팅

<br>

#### MainActivity.java
``` java
    ...

    // 2. WebSettings
    WebSettings ws = wView.getSettings();
    ws.setJavaScriptEnabled(true); // Javascript permit
    wView.setWebViewClient(new WebViewClient());
    wView.setWebContentsDebuggingEnabled(true);     // 웹뷰 디버깅 허용 설정 추가
    wView.getSettings().setUseWideViewPort(true);
    wView.getSettings().setLoadWithOverviewMode(true); 
    wView.getSettings().setDomStorageEnabled(true); // 브라우저 스토리지 사용 옵션 추가

    ...
```
