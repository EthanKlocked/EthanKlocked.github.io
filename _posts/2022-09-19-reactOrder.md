---
layout: post
title: "React Order"
subtitle: "Toss API / 일반결제, 간편결제"
date: 2022-09-19 11:23:11 -0400
background: '/img/posts/react_bg3.jpg'
tags: [react, php]
---

### 기본 프로세스 
* 주문데이터 기반 결제 요청 후 결과 저장
1. 팀 참여가 아닐 경우 신규 팀 생성
2. 주문 데이터 생성 (주문데이터 관리는 Context를 통해 유지)
3. 결제 요청 (일반 / 간편)
4. 결과 반영

<br>

### 간편결제

<img src="/img/posts/OrderGIF.gif" width="30%" height="30%"> 	

<br>

#### ./src/Login/Order.js

* 팀생성 -> 주문생성 -> 결제요청 API

``` js
    const orderExec = async() => {
        if(defaultDelivery == 'empty' || defaultDelivery == 'blank') return setOrderAlert('isNotAddress');
        if(!paymentType) return setOrderAlert('isNotPayment');
        if(paymentType == 'fair' && !defaultCard ) return setOrderAlert('noCardSelected');
        if(paymentType == 'kakao') return setOrderAlert('noFunction');

        const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
        let teamId = null;
        let params = { 'order' : order.set };

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< make team >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        if(!order.set.join){ // NEW
            const teamResult = await apiCall.post("/team", {params}, {headers});        
            if(teamResult.data.res != 'success') return setOrderAlert('error');
            teamId = teamResult.data.teamId;
        }else{// JOIN
            teamId = order.set.join.team.teamId;
        }

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< make order >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        params['addr'] = defaultDelivery;
        params['count'] = count;
        params['teamId'] = teamId;
        params['amount'] = count * (deliveryFee + (order.set.goods.goodsPrice + order.set.option.addPrice));
        params['paymentType'] = paymentType;

        const orderResult = await apiCall.post("/order", {params}, {headers});        
        console.log(orderResult);
        if(orderResult.data.res != 'success') return setOrderAlert('error');

        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< make pay >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        setLoading(true);
        let payChk = false;
        if(paymentType == 'fair'){ 
            params = { 
                'orderName' : `${order.set.goods.goodsName} : ${order.set.option.optionName}`,
                'orderNum' : orderResult.data.orderNum,
                'amount' : count * (deliveryFee + (order.set.goods.goodsPrice + order.set.option.addPrice)),
                'customerName' : self.name,
            }
            const payResult = await apiCall.get(`/billing/${defaultCard.id}/pay`, {params});        
            
            if(payResult.data == 'success'){ //pay Success
                params = { 'teamId' : teamId }
                const teamUpdateResult = await apiCall.put("/team", {params}, {headers}); //case 1 : ready -> set, case2 : set -> go(order state to 11)
                if(teamUpdateResult.data != 'success') { //team update failed => order status 0, payback
                    //order status 0
                    params = { 
                        'orderNum' : orderResult.data.orderNum,
                        'orderStatus' : '0',
                    }
                    const orderUpdateResult = await apiCall.put("/order", {params}, {headers}); //orderCancel

                    //payback
                    params.reason = '팀 생성 오류';
                    const cancelResult = await apiCall.get("/billing/payback/cancel", {params}); //billingCancel

                    payChk = false;
                }else{
                    payChk = true;
                }
            }else{
                if(payResult.data == 'updateErr'){ //order update failed => payback
                    //payback
                    params = { 
                        'orderNum' : orderResult.data.orderNum,
                        'reason' : '결제 오류',
                    }
                    const cancelResult = await apiCall.get("/billing/payback/cancel", {params});
                }
                payChk = false;
            }
        } 
        
        if(payChk){
            setOrderConfirm(true);
            setCacheHandler(new Object);
        }else{
            setOrderAlert('error');
        }
        setLoading(false);
    };
```
<br>

* 서버쪽 카드검증 및 결제 프로세스

``` php
    function pay(){
        $res = 'success';
        $updateRes = null;
        try{
            //---- INIT ----//
            $id = $this->param['ident'];
            $bKey = $this->memberBilling->get($id, $this->memberBilling->getCol(array('bKey')));
            $orderNum = $_REQUEST['orderNum'];
            $orderName = $_REQUEST['orderName'];
            $amount = $_REQUEST['amount'];
            $customerId = $this->accessInfo['index'];
            $customerName = $_REQUEST['customerName'];

            //---- API REQUEST ----//
            $data = [
                'orderId' => $orderNum,
                'orderName' => $orderName,
                'amount' => $amount,
                'customerKey' => $customerId,
                'customerName' => $customerName
            ];
            $credential = base64_encode($this->secretKey . ':');
    
            $curlHandle = curl_init("{$this->payUrl}/{$bKey['bKey']}");
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
            
            if($httpCode != 200){
                $res = 'netwrokErr';
            }else{
                $updateArr = array();
                $updateArr['od_no'] = $orderNum;
                $updateArr['od_stt'] = "2";
                $updateArr['od_pay_request_dt'] = $responseJson['requestedAt'];
                $updateArr['od_pay_approved_dt'] = $responseJson['approvedAt'];
                $updateArr['od_pg_mid'] = $responseJson['mId'];
                $updateArr['od_pg_company'] = 'toss';
                $updateArr['od_payment_id'] = $responseJson['paymentKey'];
                $updateArr['od_escrow_yn'] = $responseJson['useEscrow']=="true"?"y":"n";
                $updateArr['od_response_msg'] = $response;
                $updateRes = $this->order->setNo($updateArr,$orderNum,"value");

                if($updateRes != '000' && $updateRes != '001') $res = 'updateErr';
            }
            //if(!empty($responseJson['code']) && $responseJson['code'] == "INVALID_CARD_EXPIRATION") $res = 'invalid';
        }catch(Exception $e){
            $res = 'systemErr';
        }
        echo json_encode($res);
    }    
```

<br>

### 일반결제

<img src="/img/posts/CreditOrderGIF.gif" width="30%" height="30%"> 	

<br>

#### ./src/Login/Order.js

* 결제요청 페이지 이동 -> 성공, 실패 시 리다이렉트 URL 지정

``` javascript
        ...
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<< make pay >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
        if(paymentType == 'credit'){ //card&credit
            const clientKey = process.env.REACT_APP_TOSS_CLIENT;
            loadTossPayments(clientKey).then(tossPayments => {
                tossPayments.requestPayment(`카드`, {
                    amount: count * (deliveryFee + (order.set.goods.goodsPrice + order.set.option.addPrice)), 
                    orderId: `${orderResult.data.orderNum}`, 
                    orderName: `${order.set.goods.goodsName} : ${order.set.option.optionName}`, 
                    customerName: self.name, 
                    successUrl: `http://211.37.174.67:3000/TossSuccess?teamId=${teamId}`, 
                    failUrl: `http://211.37.174.67:3000/TossFail`, 
                });
            });
            return;
        }
```

<br>

#### ./src/Login/TossSuccess.js

* 결제 요청 성공 시 서버로 인증 요청 데이터 송신

``` javascript
    //function
    const certificate = async() => {
        setLoading(true);
        let payChk = 'fail';
        try {
            let params = {
                paymentKey : paymentKey,
                orderId : orderId,
                amount : amount,
            }
            const payResult = await apiCall.get("/billing/card/certificate", {params});    
            console.log(payResult);
            if(payResult.data == 'success'){
                params = { teamId : teamId };
                const headers = {'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'};
                const teamUpdateResult = await apiCall.put("/team", {params}, {headers}); //case 1 : ready -> set, case2 : set -> go(order state to 11)
                if(teamUpdateResult.data != 'success') { //team update failed => order status 1, payback
                    //order status 1
                    params = { 
                        'orderNum' : orderId,
                        'orderStatus' : '0',
                    }
                    const orderUpdateResult = await apiCall.put("/order", {params}, {headers}); //orderCancel

                    //payback
                    params.reason = '팀 생성 오류';
                    const cancelResult = await apiCall.get("/billing/payback/cancel", {params}); //billingCancel

                    payChk = 'fail';
                }else{
                    payChk = 'success';
                }
            }else{
                if(payResult.data == 'updateErr'){ //order update failed => payback
                    //payback
                    params = { 
                        'orderNum' : orderId,
                        'reason' : '결제 오류',
                    }
                    const cancelResult = await apiCall.get("/billing/payback/cancel", {params});
                }
                payChk = 'fail';
            } 
        }catch(e){
            console.log(e);
        }
        setResult(payChk);
        if(payChk == "success"){
            setOrderConfirm(true);
        }else{
            setOrderAlert('orderFail');
        } 
        setLoading(false);
    }

```

<br>

* 서버쪽 결제 인증 프로세스

``` php
    function certificate(){
        $res = 'success';
        try{
            //---- INIT ----//
            $paymentKey = $_REQUEST['paymentKey'];
            $orderId = $_REQUEST['orderId'];
            $amount = $_REQUEST['amount'];

            //---- API REQUEST ----//
            $data = [
                'paymentKey' => $paymentKey,
                'orderId' => $orderId,
                'amount' => $amount,
            ];
            $credential = base64_encode($this->secretKey . ':');
    
            $curlHandle = curl_init("{$this->confirmUrl}");
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
            
            if($httpCode != 200){
                $res = 'netwrokErr';
            }else{
                $updateArr = array();
                $updateArr['od_no'] = $orderId;
                $updateArr['od_stt'] = "2";
                $updateArr['od_pay_request_dt'] = $responseJson['requestedAt'];
                $updateArr['od_pay_approved_dt'] = $responseJson['approvedAt'];
                $updateArr['od_pg_mid'] = $responseJson['mId'];
                $updateArr['od_pg_company'] = 'toss';
                $updateArr['od_payment_id'] = $responseJson['paymentKey'];
                $updateArr['od_escrow_yn'] = $responseJson['useEscrow']=="true"?"y":"n";
                $updateArr['od_response_msg'] = $response;
                $updateRes = $this->order->setNo($updateArr,$orderId,"value");

                if($updateRes != '000' && $updateRes != '001') $res = 'updateErr';
            }
        }catch(Exception $e){
            $res = 'systemErr';
        }
        echo json_encode($res);        
    } 
```
