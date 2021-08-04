---
layout: post
title: "input 태그 금액표현"
subtitle: "1000단위 콤마 / 양의 정수"
date: 2021-07-26 19:45:13 -0400
background: '/img/posts/05.jpg'
tags: [javascript]
---
# html5 input 태그
신규 패키지 프로그램 제작에 사용중인 DHTMLX API에 순정 input태그를 박아 넣어야 할 일이 생겼다.    
UI상에서 보기에 DHTMLX 자체 제공 기능 중 FORM 형식이 아니라 GRID라고 하는 VIEW용도의 리스트 중 한 컬럼에 품목 개수를 입력 가능하게 해야하는 문제.   

<br>

HTML5 새로운기능인 pattern 속성을 사용해 1000단위 콤마라던가 양의 정수라던가 이런저런 조건을 줄 수 있을 줄 알았는데 막상 사용해 보니 비밀번호라던지 전화번호 같은
입력제한에 쓰이는 패턴밖에 없었다.
모양도 별로고 막고싶은 패턴 전부를 막아낼 수 없었기 때문에 script로 직접 구현하였다.   

``` javascript
//......
//GRID [EMPTY]
async function create_empty_grid(){
	let empty_grid_config = {
		columns: [
			{ id: "stit_nm", header: [{ text: "품목명" }]},
			{ id: "stit_cd", header: [{ text: "품목 코드"}]},
			{
				id: "qty", 
				header: [{ text: "수량"}], 
				htmlEnable: true, 
				template: () => 
				  '<input id="qty_input" type="text" value ="1" onkeyup="inputNumberFormat(this)">'
			}, 
		],
		selection: 'multi',
		autoWidth: true, 
		dragMode: "both",
	};
	let empty_grid = new dhx.Grid("", empty_grid_config);
	return empty_grid;
}
//......
<script>
//......
function inputNumberFormat(obj) {
	if(!obj.value){ // 1. 넘어온 값이 없을때 1 default
		obj.value = 1;
	}
	else if(isNaN(obj.value)){ // 2. 숫자가 아닐경우 
		if(isNaN(obj.value.replace(/,/g,''))){ //콤마 제거 후에도 숫자가 아닐경우 1로 변경
			obj.value = 1;
		}else{ // 콤마 제거 후에 숫자라면 숫자로 형변환 이후 다시 1000 단위 콤마
			obj.value = change_float(Number(obj.value.replace(/,/g,'')));
		}
	}else if(Number.isInteger(Number(obj.value))){ // 3. 정수가 아닐 경우 
		obj.value = Number(obj.value)/1; // 4. 나머지 떨구기
		if(obj.value < 0){ // 5. 음수일 경우 양수로
			obj.value = -obj.value;
		}
		obj.value = change_float(obj.value); // 6. 1000단위 콤마 (패키지함수 따로 구현) -> 2번으로
	}
}
//......
</script>

```
<br>

조건 흐름이 많아서 흐름따라 만들었는데 일단 쓰다가 나중에 업데이트 예정
