---
layout: post
title: "React Address"
subtitle: "Kakao API / 사용자정보"
date: 2022-09-15 14:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react]
---

### 기본 프로세스 
* 주문시 필요한 사용자 주소 등록
1. 사용자 주소 데이터를 저장
2. 저장된 데이터 중 기본 주소를 지정

<br>

### 구현 결과
<img src="/img/posts/AddressGIF.gif" width="30%" height="30%"> 	
<br>

#### ./src/Login/AddressAdd.js

* 사용자 주소 등록

``` JSX
const AddressAdd = () => {
    //context
    const { self, setSelfHandler } = useContext(SelfContext);

    //init
    const navigate = useNavigate();

    //ref
    const name = useRef();
    const phone = useRef();
    const address1 = useRef();
    const address2 = useRef();
    const password = useRef();
    const etc = useRef();

    //state
    const [data, setData] = useState(null);    
    const [phase1, setPhase1] = useState(false);
    const [phase2, setPhase2] = useState(false);
    const [postModal, setPostModal] = useState(false);
    const [mainAddress, setMainAddress] = useState(null);
    const [postcode, setPostcode] = useState(null);
    const [v, setV] = useState(true);
    const [isPassword, setIsPassword] = useState(false);
    const [isEtc, setIsEtc] = useState(false);    
    const [alertModal, setAlertModal] = useState(null);  
    const [completeModal, setCompleteModal] = useState(false);  

    //function
    const add = async() => {
        try {
            const nameV = name.current.value;
            const phoneV = phone.current.children[0].value;
            const address1V = address1.current.value;
            const address2V = address2.current.value;
            const passwordV = isPassword ? password.current.children[2].value : password.current.children[0].children[1].innerText;
            const etcV = isEtc ? etc.current.children[2].value : etc.current.children[0].children[1].innerText;

            if(!nameV) return setAlertModal("needRecipient");
            if(!phoneV) return setAlertModal("needPhoneNum");
            if(!address1V) return setAlertModal("needMainAddress");
            if(!address2V) return setAlertModal("needDetailAddress");

            const params = {
                'memberId' : self.id,
                'address1' : address1V,
                'address2' : address2V,
                'recipient' : nameV,
                'tel' : phoneV,
                'password' : passwordV,
                'extraInfo' : etcV,
                'postcode' : postcode
            }
            const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
            const result = await apiCall.post("/address", {params}, {headers});

            if(result.data == "000"){
                setCompleteModal(msgData["addressRegi"]);
                const selfData = self;
                selfData.isNew = true;
                setSelfHandler(selfData);
            }else{
                console.log(result.data);
            } 
        }catch(e){
            console.log(e);
        }
    }

    const modalClose = () => {
        setV(false);
        setTimeout(() => {
            setPostModal(false);
            setV(true);
        }, 250);        
    }

    const postcodeCallback = (fullAddress, zoneCode) => {
        modalClose();
        setMainAddress(fullAddress);
        setPostcode(zoneCode);
        setPhase1(true);
    }

    //memo
    const whoGear = useMemo(() => {
        return(
            <StyledWho>
                <StyledSection>
                    <StyledTitle>받는 사람</StyledTitle>
                    <StyledInfo>
                        <StyledInput ref={name} defaultValue={self.name}/>
                    </StyledInfo>
                </StyledSection>
                <StyledSection>
                    <StyledTitle>휴대폰 번호</StyledTitle>
                    <StyledInfo ref={phone}>
                        <MobileInput defaultNumber={self.cellphone}/>
                    </StyledInfo>
                </StyledSection>
            </StyledWho>
        )
    }, []);

    const locateGear = useMemo(() => {
        return !phase1 ?(
            <StyledWhere1>
                <StyledTitle>우편 번호</StyledTitle>
                <StyledSubmit onClick = {() => setPostModal(true)}>우편번호 검색하기</StyledSubmit>
                {/*<StyledSubtitle onCLick = {() => setPhase1(true)}>우편번호 검색이 안되나요? 직접 검색하기</StyledSubtitle> */}
            </StyledWhere1>
        ) : null;
    }, [phase1]);

    const whereGear = useMemo(() => {
        return phase1 ? (
            <>
            <StyledWhere1>
                <StyledTitle>우편 번호</StyledTitle>
                <StyledInput ref={address1} defaultValue={mainAddress}/>
            </StyledWhere1>
            <StyledWhere2>
                <StyledTitle>상세 주소</StyledTitle>
                <StyledInput ref={address2} onChange={() => setPhase2(true)}/>
            </StyledWhere2>
            </>
        ) : null;
    }, [phase1, mainAddress]);    

    const radioGear = useMemo(() => {
        return phase2 ? (
            <>
            <StyledRadioBox>
                <StyledTitle>공동현관 비밀번호</StyledTitle>
                <StyledRadioInfo ref={password}>
                    <StyledRadioSet onClick={() => setIsPassword(false)}>    
                        <StyledCustomRadio id="c1" type="radio" name="password" defaultChecked={true}/>
                        <StyledLabel htmlFor="c1" onClick={() => setIsPassword(false)}>없음</StyledLabel>
                    </StyledRadioSet>                        
                    <StyledRadioSet onClick={() => setIsPassword(true)}>    
                        <StyledCustomRadio id="c2" type="radio" name="password"/>
                        <StyledLabel htmlFor="c2" onClick={() => setIsPassword(true)}>비밀번호</StyledLabel>      
                    </StyledRadioSet>
                    {isPassword ? <StyledExtraInput /> : null}
                </StyledRadioInfo>
            </StyledRadioBox>
            <StyledRadioBox>
                <StyledTitle>배송 수령 방식</StyledTitle>
                <StyledRadioInfo ref={etc}>
                    <StyledRadioSet onClick={() => setIsEtc(false)}>
                        <StyledCustomRadio id="c3" type="radio" name="receive" defaultChecked={true}/>
                        <StyledLabel htmlFor="c3">문 앞</StyledLabel>
                    </StyledRadioSet>
                    <StyledRadioSet onClick={() => setIsEtc(true)}>
                        <StyledCustomRadio id="c4" type="radio" name="receive"/>
                        <StyledLabel htmlFor="c4">직접 입력</StyledLabel>
                    </StyledRadioSet>
                    {isEtc ? <StyledExtraInput /> : null}
                </StyledRadioInfo>
            </StyledRadioBox>
            <StyledSubmit onClick={add}>배송지 추가하기</StyledSubmit>
            </>
        ) : null;
    }, [phase2, isPassword, isEtc])

    const postModalGear = useMemo(() => {
        return(
            <Modal 
                option={{
                    width : "90%", 
                    height : "70%", 
                    textAlign : "left",
                    alignContent : "center",  
                    fontSize : "0.8em", 
                    sink : 1,
                    motion: true,
                /\}\}/ 
                type={0} 
                data={{
                    desc : <Postcode complete={postcodeCallback}/>
                /\}\}/
                state={postModal} 
                vUse={{
                    v:v, 
                    closeEvent: () => modalClose()
                }}
            />
        )
    }, [postModal, v]);            

    const alertModalGear = useMemo(() => {
        return(
            <Modal 
                option={{
                    width : "70%", 
                    height : "15%", 
                    textAlign : "center",
                    alignContent : "stretch",  
                    fontSize : "0.8em", 
                    buttonStyle : 'bold',
                    buttonName: ["확인"],
                }} 
                type={1} 
                data={{
                    desc : msgData[alertModal]
                }}
                state={alertModal}
                closeEvent={() => setAlertModal(false)} 
            />
        )
    }, [alertModal]);                

    const completeModalGear = useMemo(() => {
        return(
            <Modal 
                option={{
                    width : "70%", 
                    height : "15%", 
                    textAlign : "center",
                    alignContent : "stretch",  
                    fontSize : "0.8em", 
                    buttonStyle : 'bold',
                    buttonName: ["확인"],
                }} 
                type={1} 
                data={{
                    desc : completeModal
                }}
                state={completeModal}
                closeEvent={() => {
                    navigate(-1);
                }}
            />
        )
    }, [completeModal]); 

    //render
    return(
        <StyledAddressAdd>
            <Title text="새 배송지 추가하기"/>
            <StyledContent>
                {whoGear}
                {locateGear}
                {whereGear}
                {radioGear}
            </StyledContent>
            {postModalGear}
            {alertModalGear}
            {completeModalGear}
        </StyledAddressAdd>
    )
}

export default AddressAdd;

```

<br>

* 카카오 주소 API 컴포넌트 작성

``` javascript
//------------------------------ MODULE -------------------------------------
import React from 'react';
import DaumPostcodeEmbed from 'react-daum-postcode';

//------------------------------ CSS ----------------------------------------

//------------------------------ COMPONENT ----------------------------------
const Postcode = ({ complete }) => {
    const props = {
    }

    const handleComplete = (data) => {
        let fullAddress = data.address;
        const zonecode = data.zonecode;
        let extraAddress = '';

        if (data.addressType === 'R') {
            if (data.bname !== '') {
                extraAddress += data.bname;
            }
            if (data.buildingName !== '') {
                extraAddress += extraAddress !== '' ? `, ${data.buildingName}` : data.buildingName;
            }
            fullAddress += extraAddress !== '' ? ` (${extraAddress})` : '';
        }

        complete(fullAddress, zonecode);
        //console.log(fullAddress); // e.g. '서울 성동구 왕십리로2길 20 (성수동1가)'
    };

    return <DaumPostcodeEmbed submitMode={false} onComplete={handleComplete} {...props} />;
};

export default Postcode;
```

<br>

* 기본 주소 설정

``` php
    const defaultSave = async() => {
        try {
            const params = {
                addrId : selected,
            }
            const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
            const result = await apiCall.put("/self", {params}, {headers});    
            navigate(-1);
        }catch(e){
            setError(e);
        }
    }
```


