---
layout: post
title: "JavaScript PDF파일 생성"
subtitle: "jsPDF, autoTable"
date: 2021-07-25 16:45:13 -0400
background: '/img/posts/05.jpg'
tags: [javascript]
---
# JSPDF 사용법

작업 요청사항으로 자사 판매건에 대한 견적서를 PDF파일로 만들어주는 기능에 대한 요청이 들어왔다.     
일반적으로 JSPDF라는 오픈소스 라이브러리를 사용하는 듯 하다.      

<br>

## 1.jsPDF 라이브러리 적용 및 테스트    
github.com/MrRio/jsPDF 에서 라이브러리를 받아서 사용하거나      
해당 cdn을 적용      
``` javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.3.1/jspdf.umd.min.js"></script> 
```

기본적인 사용방법은 직관적이다.   
``` javascript
var doc = new jsPDF("p", "mm", "a4");
doc.line(10, 10, 20, 10); // 선그리기(시작x, 시작y, 종료x, 종료y)
doc.text(15, 40, '안녕하세요'); // 글씨입력(시작x, 시작y, 내용)
doc.addImage('이미지src', 'JPEG', 시작x, 시작y, 넓이, 높이); //이미지 그리기
doc.save('web.pdf');  // 다운로드 실행
```
<img src="/img/n_kor.png" width="100%" height="100%">

<br>

## 2. jsPDF 한글폰트 적용   
기본적으로 한글지원이 되지 않기 때문에 라이브러리 내부에 한글폰트를 셋팅해 줄 필요가 있다.     
구글링을 통해 맑은고딕 (ttf 파일) 다운로드     
www.giftofspeed.com/base64-encoder/ 사이트에 들어가서 Base64형태로 인코딩 한후 결과값을 복사하여      
var myFont = '결과값';      
결과값을 변수에 할당 해 놓는다.(생각보다 문자열이 길고 용량이 크기 때문에 따로 빼서 소스파일로 사용하는 것을 권장)      

<br>

``` javascript
doc.addFileToVFS("MyFont.ttf", myFont);   
doc.addFont("MyFont.ttf", "MyFont", "normal"); //내부에 폰트추가   
doc.setFont("MyFont"); //폰트 할당   
```

<img src="/img/kor.png" width="100%" height="100%">

<br>

## 3. jsPDF 테이블기능 사용   
테이블로 문서양식을 만들 경우는 추가 라이브러리가 필요하다.        
autotable이라는 라이브러리로 jspdf라이브러리 추가기능으로 사용이 가능하다.         
먼저 cdn적용    

``` javascript
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.15/jspdf.plugin.autotable.min.js"></script>
```

<br>

### autoTable 실행  

``` javascript

doc.autoTable({
  theme: 'grid', // 테마
  tableWidth : 116, // 넓이
  startX: 50, // 시작 X값
  startY: 10, // 시작 Y값
  margin: { left: 80, top: 10, right: 10 }, //여백
  styles: { font: "MyFont", fontStyle: "normal" }, //폰트적용
  body: [
	[
		{ content: "공급자", rowSpan: 5, styles: { halign: "center", valign: "middle" } }, 
		{ content: "사업자번호", styles: { halign: "center" } },
		{ content: "XXX-XX-XXXXX", colSpan: 3, styles: { halign: "center" } },
	],
	[
		{ content: "상  호", styles: { halign: "center" } },
		{ content: "(주)XXXX테크", styles: { halign: "center" } },
		{ content: "대표자", styles: { halign: "center" } },
		{ content: "XXX(인)", styles: { halign: "center" } },
	],
  ],
});
```

본문은 body객체 안에 이차원배열 내 다시 객체로 컬럼 한단위씩 작성한다.   
rowSpan, colSpan 값으로 행과 열의 할당범위 지정이 가능하다.   
테이블 최상위 Header구분은 따로 없고 첫번째 row 디자인, 폰트 스타일 등을 통해 구현   
<br>

일반적 사용법:   
동적 생성을 위해서   
테이블 config 내 모든 속성값을 키값으로 할당해 놓고   
테이블 내 같은구조의 row 반복 생성의 경우는 반복문을 통해 객체값 생성 후 배열에 넣고 body값에 할당,   
마지막으로 결과 객체를 파라미터로 넣고 실행   
doc.autoTable(객체);   

``` javascript
//pdf 출력함수
function pdf_print(esti_dt){
  const { jsPDF } = window.jspdf;

//pdf 생성
  const doc = new jsPDF();
  const myFont = m_font;

//font설정 -> 맑은고딕
  doc.addFileToVFS("MyFont.ttf", myFont);
  doc.addFont("MyFont.ttf", "MyFont", "normal");
  doc.setFont("MyFont");

//text 넣기
  doc.setFontSize(20);
  doc.text(15, 30, '개발견적서');
  doc.setFontSize(10);
  doc.text(15, 45, '아래와 같이 견적합니다.');


//상단 Table 넣기
  doc.autoTable({
	theme: 'grid',
	tableWidth : 116,
	startX: 50,
	startY: 10,
	margin: { left: 80, top: 10, right: 10 }, //여백
	styles: { font: "MyFont", fontStyle: "normal" }, //폰트적용
	body: [
		[
			{ content: "공급자", rowSpan: 5, styles: { halign: "center", valign: "middle" } },
			{ content: "사업자번호", styles: { halign: "center" } },
			{ content: "XXX-XX-XXXXX", colSpan: 3, styles: { halign: "center" } },
		],
		[
			{ content: "상  호", styles: { halign: "center" } },
			{ content: "(주)XXXX", styles: { halign: "center" } },
			{ content: "대표자", styles: { halign: "center" } },
			{ content: "XXX(인)", styles: { halign: "center" } },
		],
		[
			{ content: "소 재 지", styles: { halign: "center" } },
			{ content: "대전 유성구 배울1로 271(탑립동)", colSpan: 3, styles: { halign: "center" } },
		],
		[
			{ content: "업 태", styles: { halign: "center" } },
			{ content: "제조,도.소매", styles: { halign: "center" } },
			{ content: "종 목", styles: { halign: "center" } },
			{ content: "계량계측기 외", styles: { halign: "center" } },
		],
		[
			{ content: "담 당 자", styles: { halign: "center" } },
			{ content: "XXX", styles: { halign: "center" } },
			{ content: "연 락 처", styles: { halign: "center" } },
			{ content: "XXX-XXXX-XXXX", styles: { halign: "center" } },
		],
	],
  });

//********************************************************** 품목 data 하단 Table
  var pdf_obj = new Object;
  var pdf_arr = new Array;
  pdf_obj.theme = 'grid';
  pdf_obj.styles = { font: "MyFont", fontStyle: "normal" };
  pdf_obj.tableLineColor = '#CEF6F5';
  var esti_uid = esti_dt[14];
  var esti_data = select_common('gene_esti', 'gees_uid', esti_uid);
  var member_data = select_common('stnd_member', 'stme_uid', esti_data[1].gees_memuid);
  var item_data = select_common('gene_esti_sub', 'gees_uid', esti_uid);
  var esti_header = [
	{ content: "거래처명", styles: { halign: "center", valign: "middle" },
	{ content: esti_data[1].stac_nm, colSpan: 4, styles: { halign: "center" } },
  ];
  var esti_columns = [
	{ content: "품 목 명", styles: { halign: "center", valign: "middle"} },
	{ content: "수  량", styles: { halign: "center", valign: "middle"} },
	{ content: "단  가", styles: { halign: "center", valign: "middle"  } },
	{ content: "세  액", styles: { halign: "center", valign: "middle" } },
	{ content: "금  액(원)", styles: { halign: "center", valign: "middle" } },
  ];
  pdf_arr.push(esti_header);
  pdf_arr.push(esti_columns);
  var sum_price = 0;
  for(d=1; d < 25; d++){
	var sub_obj = new Object;
	var sub_arr = new Array;
	var geessu_item = '';
	var geessu_qty = '';
	var geessu_sprice = '';
	var geessu_vprice = '';
	var geessu_tprice = '';
	if(item_data[d]){
		sum_price += Number(item_data[d].geessu_tprice);
		geessu_item = item_data[d].geessu_item;
		geessu_qty = change_float(item_data[d].geessu_qty);
		geessu_sprice = change_float(item_data[d].geessu_sprice);
		geessu_vprice = change_float(item_data[d].geessu_vprice);
		geessu_tprice = change_float(item_data[d].geessu_tprice);
	}
	var esti_row = [
		{ content: geessu_item, styles: { halign: "right", valign: "middle" } },
		{ content: geessu_qty, styles: { halign: "right", valign: "middle" } },
		{ content: geessu_sprice, styles: { halign: "right", valign: "middle" } },
		{ content: geessu_vprice, styles: { halign: "right", valign: "middle" } },
		{ content: geessu_tprice, styles: { halign: "right", valign: "middle" } },
	];
	pdf_arr.push(esti_row);
  }
  var price_kor = num_to_str(String(sum_price));
  var total_columns = [
	{ content: "합  계", styles: { halign: "center", valign: "middle" } },
	{ content: "일금   "+price_kor+"정  (₩"+change_float(sum_price)+")", colSpan: 4, styles: { halign: "left" } },
  ];
  var etc_columns = [
	{ content: "참고사항", styles: { halign: "center", valign: "middle", fillColor: '#CEF6F5' } },
	{ content: "견적유효기간 : "+esti_data[1].gees_duedate, colSpan: 4, styles: { halign: "left" } },
  ];
  var final_columns = [
	{ content: "담 당 자", styles: { halign: "center", valign: "middle" } },
	{ content: member_data[1].stme_name, styles: { halign: "left" } },
	{ content: "연 락 처", styles: { halign: "center", valign: "middle" } },
	{ content: member_data[1].stme_email, styles: { halign: "left" } },
	{ content: "결재방법 : "+esti_data[1].gees_case, styles: { halign: "center", valign: "middle" } },
  ];
  pdf_arr.push(total_columns);
  pdf_arr.push(etc_columns);
  pdf_arr.push(final_columns);
  pdf_obj.body = pdf_arr;
//**********************************************************
  doc.autoTable(pdf_obj);
  doc.setProperties({
	title: '견적서',
  });
  doc.save("estimate.pdf");
}
```
<br>

<img src="/img/estimate.png" width="100%" height="100%">
