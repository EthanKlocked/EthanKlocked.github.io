---
layout: post
title: "PHP 가변변수"
subtitle: "가변변수를 통한 변수명 동적생성"
date: 2021-09-02 20:45:13 -0400
background: '/img/posts/php.png'
tags: [php]
---
PHP상에서의 변수는 '$' 뒤에 변수명을 적어서 선언한다.
ex) $test = 0;
'$' 뒤에 오는 이름은 텍스트, 기호, 숫자 등 선언시에 default 되어 버리기 때문에 이 방식을 통해 동적으로 변수명을 할당하는 것이 불가능하다.
동적으로 변수명을 할당하고 싶은 경우 '$'앞에 다시 '$'를 선언하여 할당하는 것이 가능하다.

<br>

## 기존방식

PHP 파일로 넘겨받은 json데이터($data) 연관배열 내 값을 사용하기 좋게 재할당하여 사용한다.     
이 경우 $abc = $data['abc']; 식으로 변수명을 일일이 맞춰주어야 한다.

<br>

``` php
$name = $data['name'];
$age = $data['age'];
$gender = $data['gender'];
$nationality = $data['nationality'];
$job = $data['job'];
```

<br>

## 가변변수 사용

foreach문을 통해 연관배열을 순회하며 key값을 변수명에 자동으로 할당한다.

<br>

``` php
foreach($data as $key => $value){
  $$key = $value;
} 
```

<br>

## 결론
$key 자체가 변수이며 key 이름을 나타내기 때문에 재차 $를 붙여 변수명을 선언하는 것이 가능하다.   
동적 할당이 가능해질 경우 for문을 통해 순회하며 자동으로 모든 변수명들을 재할당할 수 있다.