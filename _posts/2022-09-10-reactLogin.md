---
layout: post
title: "React Login"
subtitle: "Token"
date: 2022-09-10 15:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 기본 프로세스 
* 토큰을 통한 인증 및 로그인 처리
1. 휴대폰번호 인증을 위해 인증번호를 담은 토큰을 암호화
2. 사용자 입력값과 복호화된 토큰 인증번호 확인
3. 로그인 토큰 발행
4. 모든 API 요청시 토큰 인증절차 추가

<br>

### 클라이언트 로직
* 토큰 수신,저장 및 송신
    1. localStorage에 저장
    2. API header에 담아 통신

### 서버 로직
* 토큰 발행 및 검증
    1. 고유 키값을 서버 key를 이용해 암호화
    2. 클라이언트 요청 시 복화하여 고유 키값 확인

<br>

### 구현 결과
<img src="/img/posts/PhoneLoginGIF.gif" width="30%" height="30%"> 	
<br>

#### ./src/Login/Phone.js

* 휴대전화 인증번호 요청

``` javascript
    const passLevel1 = async() => {
        setLevel1(false);
        setLevel2(false);
        setValidateMsg("empty");
        setConfirmMsg("empty");

        //----FORMAT CHECK----//
        if(!phoneNum) {
            setValidateMsg("needPhoneNum");
            return false;
        }
        if(phoneNum.length < 12) {
            setValidateMsg("informal");
            return false;
        }

        //----DUPLICATE CHECK----//
        try {
            const params = {
                srch : 'cellphone',
                kwd : phoneNum
            }
            const result = await apiCall.get("/join/any/makeDigit", {params});
            setValidateMsg("sentCertNum");
            setCdata(result.data.c);
            setSetTime(result.data.exp);
            setMemberId(result.data.memberId);
        }catch(e){
            console.log(e);
            return false;
        }
    
        //----LEVEL1 PASSED----//
        setLevel1(true);
        //navigate('/Login/Phone?extraHide', { replace : true }); // for input scan
        setExpired(false);
    };

```

<br>

* 인증번호 검증 요청 -> 로그인 토큰 발행

``` javascript
    const passLevel2 = async() => {
        setLevel2(false);
        setConfirmMsg("empty");

        //----CERTIFICATE----//
        try {
            const params = {
                data : certNum
            }
            const result = await apiCall.get(`/join/${cData}/digitChk`, {params});           
            if(result.data['res'] == "MISMATCH") return setConfirmMsg("differCertNum");
            if(result.data['res'] == "EXPIRED") return setConfirmMsg("timeExpired");
            if(result.data['res'] == "MATCH"){
                if(memberId){ //----CASE MEMBER ALREADY----//
                    const loginResult = await apiCall.get(`/login/${memberId}/phone`);
                    if(loginResult.data.res == "SUCCESS"){
                        window.localStorage.setItem('token', JSON.stringify(loginResult.data.token));
                        if(order && order.set){
                            const selfResult = await apiCall.get(`/self/self`);           
                            setSelfHandler(selfResult.data); //----SELF CONTEXT SET----//
                            navigate('/Order', {replace : true });
                            return false;
                        }
                        navigate('/', { replace : true });
                    }else{
                        setAlertMsg("loginProblem");
                        setAlert(true);
                        return false; 
                    }
                }            
                setConfirmMsg("passedCert"); //----CASE NEW MEMBER----//
                setCertPhone(result.data['kwdData']);
                setLevel2(true);
            }
        }catch(e){
            console.log(e);
            return false;
        }        
    };
```

<br>

* 서버 쪽 응답 ( 인증번호 발행 및 토큰발행 )

``` php
    function phone(){
        $result = array();
        try{
            $id = $this->param['ident'];
            $row = $this->member->get($id,"mb_id,mb_stt,pt_id,mb_passwd,mb_login_cnt,count(mb_id) as cnt");
            $value = array();
            if(count($row)){
                $value['mb_last_login_dt'] = _DATE_YMDHIS;
                $value['mb_last_login_ip'] = $_SERVER['REMOTE_ADDR'];
                $value['mb_login_cnt'] = $row['mb_login_cnt']+1;
                $res = $this->member->set($value,$row['mb_id'],"value");

                $result['token'] = array(
                    'access' => $this->jwt->hashing(array("index" => $id, "exp" => time()+($this->expiration))),
                    'refresh' => $this->jwt->hashing(array("index" => $id, "exp" => time()+2*($this->expiration)))
                );
                $result['res'] = "SUCCESS";
            };
        }catch(Exception $e){
            $result['res'] = "FAILED";
        }
        echo json_encode($result);
    }
```


