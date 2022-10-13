---
layout: post
title: "React Payment"
subtitle: "Toss API / 사용자정보"
date: 2022-09-15 05:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 기본 프로세스 
* 주문시 필요한 사용자 결제방식 등록
1. 전용 카드정보 저장 시 TOSS 카드 등록 API 이용
2. 쇼핑몰쪽 고객 고유값과 TOSS 발행 고유값을 통해 주문

<br>

### 구현 결과
<img src="/img/posts/PaymentGIF.gif" width="30%" height="30%"> 	
<br>

#### ./src/Login/paymentUpdate.js

* 사용자 기본 결제수단 저장

``` JSX
const PaymentUpdate = () => {
    //context
    const { self, setSelfHandler } = useContext(SelfContext);

    //init
    const navigate = useNavigate();    

    //state
    const [paymentType, setPaymentType] = useState(self.paymentType || 'fair');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);    
    const [data, setData] = useState(null);    
    const [paymentCard, setPaymentCard] = useState(self.billingId);    
    const [alertModal, setAlertModal] = useState(null);

    //function
    const initData = async() => {
        if(self.isNewCard){
            setPaymentType('fair');
            const selfData = self;
            selfData.isNewCard = false;
            setSelfHandler(selfData);
        }
        try {
            setError(null);
            setLoading(true);
            setData(null);
            
            const result = await apiCall.get("/billing");
            if(Array.isArray(result.data) && !result.data.length) return setPaymentCard(null);
            if(Array.isArray(result.data) && !result.data.find(element => Number(element.id) == self.billingId)){
                setPaymentCard(result.data[result.data.length-1].id);
            } 
            setData(result.data.reverse());
        }catch(e){
            setError(e);
        }
    }

    const save = async() => {
        if(paymentType == 'fair' && !paymentCard) return setAlertModal('noCardSelected'); 
        try {
            const params = {
                billingId : paymentCard,
                paymentType : paymentType,
            }
            const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
            const result = await apiCall.put("/self", {params}, {headers});    
            if(result.data == '000'){
                //const updateData = await apiCall.get(`/self/self`);
                //setSelfHandler(updateData.data); //----SELF CONTEXT UPDATE----//
            } 
            navigate(-1);
        }catch(e){
            setError(e);
            setAlertModal('error'); 
        }
    }

    const deleteCard = async() => {
        try{
            const result = await apiCall.delete(`/billing/${paymentCard}`);
            if(result.data="000") initData();
        }catch(e){
            console.log(e);
            setAlertModal('error');
        }
    }

    const moveAdd = useCallback(() => {
        navigate('/MyPage/PaymentAdd');
    }, []);

    //effect
    useEffect(() => {
        initData();
    }, []);

    //memo
    const defaultGear = useMemo(() => {
        return (
            <StyledDefaultSetting>
                <StyledDefaultCheckbox id="m" type="checkbox" defaultChecked={true} disabled/>
                <StyledDefaultLabel htmlFor="m">현재 결제 수단을 기본 결제 수단으로 설정</StyledDefaultLabel>
            </StyledDefaultSetting>                
        )
    }, []);    

    const addBtnGear = useMemo(() => {
        if(paymentType != 'fair') return null;
        return (
            <StyledItemBodyAdd>
                <StyledAddBtn onClick={moveAdd}>
                    <StyledAddIcon>
                        +
                    </StyledAddIcon>
                    <StyledAddText>
                        새 카드 등록하기
                    </StyledAddText>
                </StyledAddBtn>
            </StyledItemBodyAdd>
        )
    }, [paymentType]);

    const cardListGear = useMemo(() => {
        if(paymentType != 'fair') return null;
        if(!data) return null;
        return (
            data.map((item, index)=>(                
                <div key={index}>
                    <StyledItemRadio
                        id={'itemF'+index} 
                        type="radio" 
                        name="cardSelect" 
                        value={item.id} 
                        onChange = {(e) => {setPaymentCard(e.target.value)}}
                        defaultChecked={item.id == paymentCard} 
                    />
                    <StyledItemList htmlFor={'itemF'+index}>
                        {item.sInfo}
                    </StyledItemList>
                </div>
            ))                         
        )
    }, [data, paymentCard, paymentType]);

    const fairGear = useMemo(() => {
        return(
            <StyledItemTitle>
                <StyledItemTitleRadio>
                    <StyledRadioSetting>
                        <StyledRadio 
                            id="f" 
                            type="radio" 
                            name="paymentType" 
                            value="fair" 
                            checked={paymentType == "fair"} 
                            onChange = {(e) => {setPaymentType(e.target.value)}}
                        />
                    </StyledRadioSetting>
                </StyledItemTitleRadio>
                <StyledItemTitleLabel htmlFor="f">
                    <StyledItemTitleIcon><SiSamsungpay color="crimson" size="1.5em"/></StyledItemTitleIcon>
                    <StyledItemTitleText>페어페이</StyledItemTitleText>
                </StyledItemTitleLabel>
                {paymentCard && paymentType == 'fair' ? <StyledItemTitleDelete onClick={deleteCard}>카드 삭제</StyledItemTitleDelete> : null}
            </StyledItemTitle>
        )
    }, [paymentType, paymentCard])

    const kakaoGear = useMemo(() => {
        return(
            <StyledItemTitle>
                <StyledItemTitleRadio>
                    <StyledRadioSetting>
                        <StyledRadio 
                            id="k" 
                            type="radio" 
                            name="paymentType" 
                            value="kakao" 
                            checked={paymentType == "kakao"} 
                            onChange = {(e) => {setPaymentType(e.target.value)}}
                        />
                    </StyledRadioSetting>
                </StyledItemTitleRadio>
                <StyledItemTitleLabel htmlFor="k">
                    <StyledItemTitleIcon><img src={kakaoPayIcon}/></StyledItemTitleIcon>
                    <StyledItemTitleText>카카오페이</StyledItemTitleText>                        
                </StyledItemTitleLabel>
            </StyledItemTitle>            
        )
    }, [paymentType])

    const creditGear = useMemo(() => {
        return(
            <StyledItemTitle>
                <StyledItemTitleRadio>
                    <StyledRadioSetting>
                        <StyledRadio 
                            id="c" 
                            type="radio" 
                            name="paymentType" 
                            value="credit" 
                            checked={paymentType == "credit"} 
                            onChange = {(e) => {setPaymentType(e.target.value)}}
                        />
                    </StyledRadioSetting>
                </StyledItemTitleRadio>
                <StyledItemTitleLabel htmlFor="c">
                    <StyledItemTitleIcon><AiFillCreditCard color="#006699" size="1.5em"/></StyledItemTitleIcon>
                    <StyledItemTitleText>신용/체크카드</StyledItemTitleText>                    
                </StyledItemTitleLabel>
            </StyledItemTitle>        
        )
    }, [paymentType])

    const alertModalGear = useMemo(() => {
        return(
            <Modal 
                option={{
                    width : "70%", 
                    height : "8em", 
                    textAlign : "center",
                    alignContent : "stretch",  
                    fontSize : "1em", 
                    buttonStyle : 'bold',
                    buttonName: ["확인"],
                }} 
                type={1} 
                data={{
                    desc : msgData[alertModal],
                    title: "결제 수단 등록 실패"
                }}
                state={alertModal}
                closeEvent={() => setAlertModal(false)} 
            />
        )
    }, [alertModal]); 

    //render
    if(!data) return <StyledSimpleLoading />;
    return(
        <StyledPaymentUpdate>
            <Title text="결제 수단" />
            <StyledContent>
                <StyledItem>
                    {fairGear}
                    <StyledItemBody>    
                        <StyledItemBodyList>
                            {cardListGear}
                        </StyledItemBodyList>
                        <StyledItemBodyAdd>
                            {addBtnGear}
                        </StyledItemBodyAdd>
                    </StyledItemBody>
                </StyledItem>
                <StyledItem>
                    {kakaoGear}
                </StyledItem>
                <StyledItem>
                    {creditGear}
                </StyledItem>
                {defaultGear}
                <StyledSubmit onClick = {save}>확인</StyledSubmit>
            </StyledContent>
            {alertModalGear}
        </StyledPaymentUpdate>
    )
}

export default PaymentUpdate;
```

<br>

#### ./src/Login/paymentAdd.js

* 카드정보 등록 시 서버 검증 요청

``` javascript
    //function
    const numberChange = (e) => {
        const thisVal = e.target.value.replace(/[^0-9]/g, '');
        const thisId = e.target.id;
        let length = e.target.dataset.len || 2;

        if(thisId=="i1" && thisVal.length<=length)         setNum1(thisVal);
        if(thisId=="i2" && thisVal.length<=length)         setNum2(thisVal);
        if(thisId=="i3" && thisVal.length<=length)         setNum3(thisVal);
        if(thisId=="i4" && thisVal.length<=length)         setNum4(thisVal);
        if(thisId=="i5" && thisVal.length<=length)        setMonth(thisVal);
        if(thisId=="i6" && thisVal.length<=length)         setYear(thisVal);
        if(thisId=="i7" && thisVal.length<=length)     setPassword(thisVal);
        if(thisId=="i8" && thisVal.length<=length)        setIdNum(thisVal);
        
        setTimeout(() => {
            const thisIndex = thisId.replace('i', '');
            if(thisVal.length==length){
                const nextInput = document.getElementById(`i${Number(thisIndex)+1}`);
                if(nextInput) nextInput.focus();
            }else if(thisVal.length==0){
                /*
                const nextInput = document.getElementById(`i${Number(thisIndex)-1}`);
                if(nextInput) nextInput.focus();
                */
            }
        },0);
    }
```

<br>

* toss api를 통한 카드정보  및 카드 데이터 신규등록

``` php
    function add(){
        //---- API REQUEST ----//
        $res = 'success';
        try{
            $arr = $this->postData['params'];

            $data = [
                'cardNumber' => $arr['cardNum'],
                'cardExpirationMonth' => $arr['month'], 
                'cardExpirationYear' => $arr['year'],
                'cardPassword' => $arr['password'],
                'customerIdentityNumber' => $arr['idNum'],
                'customerKey' => $this->accessInfo['index']  
            ];
            $credential = base64_encode($this->secretKey . ':');
    
            $curlHandle = curl_init($this->addUrl);
            curl_setopt_array($curlHandle, [
                CURLOPT_POST => TRUE,
                CURLOPT_RETURNTRANSFER => TRUE,
                CURLOPT_HTTPHEADER => [
                    'Authorization: Basic ' . $credential,
                    'Content-Type: application/json'
                ],
                CURLOPT_POSTFIELDS => json_encode($data)
            ]);
    
            $response = curl_exec($curlHandle);
            $httpCode = curl_getinfo($curlHandle, CURLINFO_HTTP_CODE);
            $responseJson = json_decode($response,true);
            
            if($httpCode != 200) $res = 'netwrokErr';
            if(!empty($responseJson['code']) && $responseJson['code'] == "INVALID_CARD_EXPIRATION") $res = 'invalid';
        }catch(Exception $e){
            $res = 'systemErr';
        }

        //---- BILLING KEY SAVE ----//
        if($res == 'success' && !empty($responseJson)){
            $addInfo = array();
            $addInfo['memberId'] = $responseJson['customerKey'];
            $addInfo['bKey'] = $responseJson['billingKey'];

            $cardFrontNum = substr($responseJson['card']['number'], 0, 4);
            $cardCompany = $responseJson['card']['company'];
            $addInfo['sInfo'] = "[{$cardCompany}] {$cardFrontNum}-****-****-****";
            
            $addRes = $this->memberBilling->add($addInfo);
            if($addRes != '000') $res = 'saveErr';
        }
        echo json_encode($res);
    }    
```


