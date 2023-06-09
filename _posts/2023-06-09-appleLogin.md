---
layout: post
title: "Apple Login"
subtitle: "IOS Webview / Apple Key"
date: 2023-06-09 08:15:55 -0400
background: '/img/posts/react_bg3.jpg'
tags: [php, react]
---

### 기본 프로세스 
* 웹뷰앱 내 애플로그인 구현
1. frontend server : react app
2. backend server : php server
3. web 내 애플로그인 구현

<br>

### 클라이언트 로직
* 초기 request initiating
    1. react-apple-login 라이브러리 사용하여 로그인 페이지 url request
    2. 로그인 후 backend server로 post data 포함 리다이렉트 (post 값을 받기 위해 client가 아닌 server로 전송)
    3. backend 프로세스 후 넘겨받은 정보 이용하여 회원가입, 통합로그인 등 프로세스 진행
    4. 탈퇴 시 DB 리프레시 토큰 사용하여 disconnect 필요 (disconnect 없이는 재가입시 사용자 정보 조회 불가능)

<br>

### 서버 로직
* 해당 리다이렉트 주소로 login 정보 수신
    1. 서버 내 저장된 key 및 인증정보를 사용하여 리프레시 토큰 발급 (회원 탈퇴 시 필요)
    2. 지정된 react client url로 결과정보 송신

<br>

* 초기 로그인 리퀘스트

``` javascript
    ...
    {isIOS ? 
        (
            <AppleLogin 
                clientId={APPLE_CLIENT}
                redirectURI={APPLE_REDIRECT}
                scope={"name email"}
                responseType={"code id_token"}
                responseMode={"form_post"}
                usePopup={false}
                render={(props) => (
                    <StyledButton onClick={() => props.onClick()}>
                        <RiAppleFill size="2em" color="black"/>
                        Apple로 계속하기
                    </StyledButton> 
                )}                                  
            />
        ) : null
    }
    ...
```

<br>

* 로그인 후 리다이렉트 서버경로 수신 및 응답

``` php
    //JUST MAPPING UNIQUE USER ID(token.sub) WITH ALLDEAL DATABASE ( NOT USING OR AUTHORIZING TOKEN )
    function apple(){ 
        $result = 'success';
        try{            
            //data
            $code = $_POST['code'];
            $tokens = decode($_POST['id_token']); 
            $user = !empty($_POST['user']) ? json_decode(str_replace('\\','',$_POST['user'])) : null; 
            $appleId = $tokens[1]->sub;
            $destination = 'https://alldeal.kr/Login?applelogin=error';
            $firstName = !empty($user->name->firstName) ? $user->name->firstName : null;
            $lastName = !empty($user->name->lastName) ? $user->name->lastName : null;
            $name = $lastName.$firstName;
            $email = !empty($user->email) ? $user->email : null;

            //check & login
            $row = $this->member->select("mb_id,mb_stt,pt_id,mb_passwd,mb_login_cnt,count(mb_id) as cnt"," and mb_sns_id_2 = '{$appleId}' and pt_id = '{$this->shopId}'");
            if( $row['cnt'] < 1 ){ // if not member -> JOIN

                //generate secret key
                $privKey = openssl_pkey_get_private(file_get_contents('key/<파일명.pem>', true));
                $secret = generateJWT($this->appleKey, $this->appleTeam, $this->appleService, $privKey);

                //access_token request 
                $data = [
                    'client_id' => $this->appleService,
                    'client_secret' => $secret,
                    'code' => $code,
                    'grant_type' => 'authorization_code',
                    'redirect_uri' => $this->redirect
                ];
                $ch = curl_init();
                curl_setopt($ch, CURLOPT_URL, 'https://appleid.apple.com/auth/token');
                curl_setopt($ch, CURLOPT_POST, 1);
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($data));
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                $serverOutput = curl_exec($ch);
                $output = json_decode($serverOutput,true);
                curl_close($ch);
                $refresh = $output['refresh_token'];

                $res = "CONTINUE";
                $sub = <토큰 발급 로직>
                $destination = 'https://alldeal.kr/Login/Phone?res='.$res.'&sub='.$sub.'&name='.$name.'&email='.$email;
            }else{
                //LOGIN
                if( $row['mb_stt'] != 2 || empty($row['mb_id'])){
                    $result['res'] = "FAILED";
                    echo json_encode($result);
                    exit;
                }    
                $res = "LOGIN";
                $memId = $row['mb_id'];
                $destination = 'https://alldeal.kr/Login/Phone?res='.$res.'&memId='.$memId;
            }

        }catch(Exception $e){
            $result['res'] = "FAILED";
            $result['error'] = $e;
            $destination = 'https://alldeal.kr/Login?applelogin=error';
        }
        header('Location:'.$destination);
        exit;
    }
```

<br>

* 클라이언트 수신

``` javascript
const Phone = () => {
    //context
    const { order } = useContext(OrderContext);
    const { base } = useContext(BaseContext);
    const { setSelfHandler } = useContext(SelfContext);

    //init
    const navigate = useNavigate();
    const SearchParams = new URLSearchParams(useLocation().search);
    const APPLE_RESULT = SearchParams.get('res');    
    const APPLE_SUB = SearchParams.get('sub');    
    const APPLE_LOGIN_MEM = SearchParams.get('memId');       
    const APPLE_NAME = SearchParams.get('name');       
    const APPLE_EMAIL = SearchParams.get('email');      
    ...
    <로그인 및 회원가입 절차 >
```


