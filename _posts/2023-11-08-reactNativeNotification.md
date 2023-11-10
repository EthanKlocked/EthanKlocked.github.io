---
layout: post
title: "앱 푸시알림 연동"
subtitle: "Firebase / Notification"
date: 2023-11-08 14:55:23 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react, android, ios]
---

### 기능 설명
* Firebase 연동을 통한 디바이스 앱 푸시 알림 수신
* 모바일 내 앱 구동/미구동(백그라운드) 상태에서 알림 UI 노출

<br>
<br>

### 세팅 순서
1. Firebase 내 IOS/Android 앱 생성
2. 내려받은 JSON 파일 세팅 및 각 Native code작성을 통한 연동 sdk 설치
3. IOS 연동을 위한 APN 키 발급 및 Firebase 내 세팅
4. react native 라이브러리 설치 (firebase message 수신 연동 / foreground push notification 노출)
5. react native 라이브러리를 통한 코드 세팅 (토큰 송신, 알림 수신)

<br>
<br>

##### Fireabase 앱 생성 및 키 세팅

* IOS/Android 각 생성 및 안내에 따라 각 JSON파일/코드세팅
<img src="/img/posts/firebase_regi.PNG" width="50%" height="50%">

<br>
<br>

##### IOS APN 키 발급 및 세팅
* Apple Push Notification 연동을 위해 key 혹은 certificate 인증서 생성
<img src="/img/posts/apn_cert.png" width="90%" height="90%">

<br>

* 생성된 인증서를 firebase앱 내 세팅
<img src="/img/posts/apn_set.png" width="90%" height="90%">

<br>
<br>

##### 라이브러리 설치 및 코드작성

* 앱 초기실행 시 background 수신 세팅 /index.js 
``` javascript
import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';

// Register background handler
messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
});
AppRegistry.registerComponent(appName, () => App);
```

<br>

* 앱 초기실행 시 foreground 수신 세팅 /app.js (tsx) 
``` javascript
//------------------------------ MODULE --------------------------------
import React, { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { pushNoti } from './src/lib';

//---------------------------- COMPONENT -------------------------------
function App(): JSX.Element {
    // Register foreground handler
    useEffect(() => {
        const unsubscribe = messaging().onMessage(async remoteMessage => {
            //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage));
            console.log(remoteMessage);
            pushNoti(remoteMessage); 
        });
        return unsubscribe;
    }, []);

    //render
    return (
        ...
    );
}

export default App;
```

<br>

* foreground 수신을 위한 라이브러리 사용 함수 src/lib/pushNoti.js
``` javascript
import notifee, { AndroidImportance } from '@notifee/react-native';

const displayNotification = async message => {
    const channelAnoucement = await notifee.createChannel({
        id: 'default',
        name: '시분',
        importance: AndroidImportance.HIGH,
    });

    await notifee.displayNotification({
        title: message.data?.title || message.notification?.title || 'none message',
        body: message.data?.body || message.notification?.title || 'none message',
        android: {
            channelId: channelAnoucement,
            smallIcon: 'ic_launcher'
        },
    });
};

export default remoteMessage => displayNotification(remoteMessage);
```

<br>

* 디바이스 토큰 송신을 위한 함수 src/lib/setDeviceToken.js
``` javascript
//------------------------------ MODULE --------------------------------
import messaging from '@react-native-firebase/messaging';
import { apiCall } from '@/lib';
import { Platform } from 'react-native';
import { requestNotifications } from "react-native-permissions";

//----------------------------- FUNCTION -------------------------------
export default async function setDeviceToken(){
	//permission for device token 
	//ANDROID : authorized default for android
	//IOS : including push permission 
  	const authStatus = await messaging().requestPermission();
  	const enabled = (
		authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
		authStatus === messaging.AuthorizationStatus.PROVISIONAL
  	);

	//push permission for android
	if (Platform.OS == "android") requestNotifications(["alert", "sound"]);

	//set device code in server 
	const headers = {"Authorization" : "access"};
  	if(enabled) {
		await messaging()
			.getToken()
			.then(fcmToken => {
				const params = {"mb_device_token" : fcmToken};
				apiCall.post(`/user/me`, {...params}, {headers})
					.then((r) => {
						if(r.data.result != "000" && r.data.result != "001") console.log(r.data); //api error
					})
					.catch((e) => console.log(e)); //network error
			})
			.catch(e => console.log('error: ', e));
  	}else{
		const params = {"mb_device_token" : ''}; //make token empty
		apiCall.post(`/user/me`, {...params}, {headers})
			.then((r) => {
				if(r.data.result != "000" && r.data.result != "001") console.log(r.data); //api error
			})
			.catch((e) => console.log(e)); //network error
	}
}
```

<br>
<br>

##### 구동 테스트
*  Firebase 내 테스트 송신 시나리오 활용 or 서버 연동하여 디바이스 타게팅 테스트
