---
layout: post
title: "Python 엑셀병합 프로그램 1"
subtitle: "pandas / xlswriter"
date: 2022-12-15 13:11:05 -0400
background: '/img/posts/python_bg.png'
tags: [python]
---

### 환경구성
* anaconda(Python 3.9), Spyder 에디터 사용
* pandas 사용 (엔진 : xlswriter)

<br>

### 프로세스
1. 기존 엑셀파일 데이터를 데이터프레임 구조로 변경
2. 데이터프레임 수정(병합, 정렬, 필터링 등)
3. 새로운 이름으로 저장

<br>

#### 엑셀데이터 추출 및 데이터프레임화
``` python
  # read
  files = pathlib.Path(<디렉토리주소>).glob('*.xlsx')
  for file in list(files): 
      file = os.path.normpath(file)
      allData = pd.concat([allData, pd.read_excel(file, usecols=[0,2,7,9,10,17])], ignore_index=True) # concat all dataFrames        
  if allData.shape[0]>1048575: return False #엑셀시트 최대 행수 초과 시 예외처리             
```

<br>

#### 필터링 및 데이터 병합

``` python
  # 결측치 제거
  allData = allData.dropna() #null check
  
  # 결측치 제거
  exceptList = [
      '', 
      'test', 
      'test2', 
      'error code', 
      '빼고싶은 단어', 
      ' 비정상타입 데이터', 
      ' . ', 
  ]
  exceptOption = '|'.join(exceptList)
  allData = allData[~allData['카테고리'].str.contains(exceptOption)]
  
  # 필터링 및 문자열 변환, 타입변환
  allData['상품수량'] = pd.to_numeric(allData['상품수량'], errors ='coerce').fillna(0).astype('int')
  allData['판매가'] = pd.to_numeric(allData['판매가'], errors ='coerce').fillna(0).astype('int')
  allData = allData.loc[allData['CS']=='정상'] #filtering CS
  allData['카테고리'] = allData['카테고리'].apply(lambda x:str(x).replace(' ','')).apply(lambda x:x.replace(' ',' -> ')).apply(categoryClean) #category clean
  allData['발주일'] = allData['발주일'].apply(lambda x:str(x)[0:7]) #date format
  allData['상품수량'] = allData['상품수량'].apply(lambda x:int(x)) #numeric filter
  
  # 합계를 위한 데이터병합
  sumData = allData.groupby(['발주일','판매처','카테고리']).sum()
```

<br>

#### 이름 생성 및 신규저장

``` python
  # unique 파일명 생성
  now = datetime.now()
  resultFileName = f"{now.strftime('%Y-%m-%d(%H_%M_%S)')}.xlsx"
  
  # 엑셀서식 세팅 및 
  file_path = f"{resultDir}/{resultFileName}"
  with pd.ExcelWriter(file_path, engine='xlsxwriter') as writer:
      sumData.to_excel(writer)
      ws = writer.sheets['Sheet1']
      #fix width of columns
      ws.set_column(0, 1, 20)
      ws.set_column(1, 2, 20)
      ws.set_column(2, 3, 40)
      ws.set_column(3, 4, 15)
      ws.set_column(4, 5, 15)
```
