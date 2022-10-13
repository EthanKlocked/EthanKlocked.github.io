---
layout: post
title: "React Kakao Login"
subtitle: "Token / KakaoAPI"
date: 2022-09-11 11:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react,php]
---

### 기본 프로세스 
* 카카오 앱 계정 및 아이디 로그인을 통한 인증
1. 카카오톡 인증 및 로그인 URL로 이동
2. 인증요청 후 결과값을 redirect URL로 전달
3. 전달받은 데이터 서버로 송신
4. 서버체크 후 로그인 혹은 회원가입 완료

<br>

### 클라이언트 로직
* 카카오 인증 후 데이터 송신

### 서버 로직
* 데이터 검증 후 로그인 / 회원가입

<br>

### 구현 결과

##### 인증방법 선택화면
<img src="/img/posts/kakaoLogin2.PNG" width="30%" height="30%"> 	

<br>

##### 이미 회원일 경우 동의절차 생략
<img src="/img/posts/kakaoLogin.gif" width="30%" height="30%"> 	

<br>

#### ./src/Login.js

* 카카오 인증페이지 이동

``` javascript
    //function
    const kakaoAuth = async() => {
        if(order && order.set) window.localStorage.setItem('orderSet', JSON.stringify(order.set));
        window.location.href = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_API_KEY}&redirect_uri=${KAKAO_REDIRECT}`;
    }
```

<br>

* 카카오 인증데이터 검증 요청 -> 로그인 토큰 발행

``` javascript
    //function
    const getKakaoToken = async() => {
        const params = {
            client_id: KAKAO_API_KEY,
            redirect_uri: KAKAO_REDIRECT,
            code: authCode,
        }
        const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
        const result = await apiCall.post("/login/type/kakao", {params}, {headers});

        if(result.data.res == "SUCCESS"){
            window.localStorage.setItem('token', JSON.stringify(result.data.token));

            const orderSet = localStorage.getItem("orderSet");
            if(orderSet){
                localStorage.removeItem("orderSet");
                const orderInfo = JSON.parse(orderSet)
                setOrderHandler({ready : null, set : orderInfo}); //----ORDER CONTEXT SET----//
                const selfResult = await apiCall.get(`/self/self`);           
                setSelfHandler(selfResult.data); //----SELF CONTEXT SET----//
                navigate('/Order', {replace : true });
                return false;
            }

            let resultUrl = result.data.type == 'login' ? '/' : '/Login/Welcome';
            navigate(resultUrl, { replace : true, state: { name: result.data.nick } });
        }else{
            setAlert(true);
            return false; 
        }        
    }
```

<br>

* 서버 쪽 응답 ( 인증데이터 검증 및 토큰발행 )

``` php
    function kakao(){
        $result = array();
        try{
            // 토큰 받기
            $post = $this->postData['params'];
            $url = 'https://kauth.kakao.com/oauth/token';
            $curlHandle = curl_init($url);
            $data =  array(
                "grant_type"=>"authorization_code",
                "client_id"=>$clientId,
                "redirect_uri"=>$post['redirect_uri'],
                "code"=>$post['code'],
            );
            curl_setopt_array($curlHandle, [
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_POST => true,
                CURLOPT_HTTPHEADER => array(
                    'Content-Type: application/x-www-form-urlencoded;charset=utf-8'
                ),
                CURLOPT_POSTFIELDS => http_build_query($data)
            ]);
            $response = curl_exec($curlHandle);
            $httpCode = curl_getinfo($curlHandle, CURLINFO_HTTP_CODE);
            if( $httpCode!="200" ) $this->result("104",$response);
            $token = json_decode($response,true);
            curl_close($curlHandle);

            // 사용자 정보 가져오기
            $url = 'https://kapi.kakao.com/v2/user/me';
            $curlHandle = curl_init($url);
            curl_setopt_array($curlHandle, [
                CURLOPT_POST => false,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_HTTPHEADER => array(
                    'Authorization: Bearer ' . $token['access_token'],
                    'Content-Type: application/x-www-form-urlencoded;charset=utf-8'
                ),
            ]);
            $response = curl_exec($curlHandle);
            $httpCode = curl_getinfo($curlHandle, CURLINFO_HTTP_CODE);
            if( $httpCode!="200" ) $this->result("104",$response);
            $user = json_decode($response,true);
            curl_close($curlHandle);
            
            
            $value = array();
            $result['type'] = 'login';
            $row = $this->member->select("mb_id,mb_stt,pt_id,mb_passwd,mb_login_cnt,count(mb_id) as cnt"," and mb_sns_id_1 = '{$user['id']}' and pt_id = '{$this->shopId}'");
            if( $row['cnt'] < 1 ){ // 사용자 존재 여부 확인
                $result['type'] = 'join';
                $result['nick'] = $user['properties']['nickname'];

                $arr = array();
                $arr['id'] = uniqid();
                $arr['passwd'] = uniqid();
                $arr['snsid1'] = $user['id']; 
                $arr['shop'] = $this->shopId; 
                $arr['name'] = $user['properties']['nickname']; 
                $arr['gender'] = $user['kakao_account']['gender'];
                if(!empty($user['properties']['profile_image'])){
                    $rawImg = file_get_contents($user['properties']['profile_image']);
                    $img = 'data:image/jpg;base64,'.base64_encode($rawImg);
                    $arr['img'] = $img;
                }
                $res = $this->member->add($arr);
                $row = $this->member->get($arr['id'],"mb_id,mb_stt,pt_id,mb_passwd,mb_login_cnt,count(mb_id) as cnt");
            }
            
            if ( $row['mb_stt'] != 2 ) $this->result("100");

            $value['mb_last_login_dt'] = _DATE_YMDHIS;
            $value['mb_last_login_ip'] = $_SERVER['REMOTE_ADDR'];
            $value['mb_login_cnt'] = $row['mb_login_cnt']+1;
            $res = $this->member->set($value,$row['mb_id'],"value");

            $result['token'] = array(
                'access' => $this->jwt->hashing(array("index" => $row['mb_id'], "exp" => time()+($this->expiration))),
                'refresh' => $this->jwt->hashing(array("index" => $row['mb_id'], "exp" => time()+2*($this->expiration)))
            );
            $result['res'] = "SUCCESS";
        }catch(Exception $e){
            $result['res'] = "FAILED";
        }
        
        echo json_encode($result);
    }
```


