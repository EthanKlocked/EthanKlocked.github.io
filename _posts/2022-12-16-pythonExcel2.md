---
layout: post
title: "Python 엑셀병합 프로그램 2"
subtitle: "win32.com / recover file type"
date: 2022-12-16 11:11:05 -0400
background: '/img/posts/python_bg.png'
tags: [python]
---

### 환경구성
* anaconda(Python 3.9), Spyder 에디터 사용
* pandas 사용 (엔진 : xlswriter)

<br>

### 수정, 개선방향
1. 깨지거나 파일형식에 문제가 있는 경우 엑셀데이터 데이터프레임화 작업에서 에러발생
2. 작업전 폴더 내 모든 엑셀파일 xlsx로 형식 통일하여 재저장 로직 추가

<br>

#### 폴더 내 모든 엑셀파일 xlsx 확장자 및 타입으로 변환하여 저장
``` python
# EXCEL RECOVER
def excelRecover(srcDir):
    try:
        # setting
        o = win32com.client.Dispatch("Excel.Application")
        o.Interactive = False
        o.Visible = False
        # find
        file_list = os.listdir(srcDir)
        # recover
        for file in file_list:
            name, ext = os.path.splitext(file)
            origin = f"{srcDir}/{file}"
            new = f"{srcDir}/{name}_recover.xlsx"
            wb = o.Workbooks.Open(origin)
            wb.ActiveSheet.SaveAs(new,51)
            os.remove(f"{srcDir}/{file}")
    except:
        print('error')
    # quit
    o.Quit()
```

<br>

#### 기존 로직에 추가

``` python
# EXCEL MERGE
def excelMerge(srcDir, resultDir, bar, needTransform):
    try:
        # 폴더 내 파일 새로저장 로직 
        # recover
        excelRecover(srcDir)
        
        # setting
        now = datetime.now()
        resultFileName = f"{now.strftime('%Y-%m-%d(%H_%M_%S)')}.xlsx"
        allData = pd.DataFrame()
        # find
        files = pathlib.Path(srcDir).glob('*.xlsx')
        # read
        for file in list(files): 
            file = os.path.normpath(file)
            allData = pd.concat([allData, pd.read_excel(file, usecols=[0,2,7,9,10,17])], ignore_index=True) # concat all dataFrames        
        if allData.shape[0]>1048575: return False 
        # transform
        allData = allData.dropna() #null check
        exceptList = [
            '낚시', 
            '스포츠/레저', 
            '애견/PET', 
            '캠핑', 
            '물류 > 슬리브',
            '물류 > RLH',
            '물류 > 쿠팡',
            '물류 > 아마존',
            '물류 > 이마트',
            '물류 > 트레이더스',
            '물류 > 로켓',
            '물류 > 신세계팩토리'
        ]
        exceptOption = '|'.join(exceptList)
        allData['상품수량'] = pd.to_numeric(allData['상품수량'], errors ='coerce').fillna(0).astype('int')
        allData['판매가'] = pd.to_numeric(allData['판매가'], errors ='coerce').fillna(0).astype('int')
        allData = allData[~allData['카테고리'].str.contains(exceptOption)]
        allData = allData.loc[allData['CS']=='정상'] #filtering CS
        allData['카테고리'] = allData['카테고리'].apply(lambda x:str(x).replace(' ','')).apply(lambda x:x.replace('->',' -> ')).apply(categoryClean) #category clean
        allData['발주일'] = allData['발주일'].apply(lambda x:str(x)[0:7]) #date format
        allData['상품수량'] = allData['상품수량'].apply(lambda x:int(x)) #numeric filter
        sumData = allData.groupby(['발주일','판매처','카테고리']).sum()
        #save
        fromTo(bar, 95, 0.03)
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
        fromTo(bar, 101, 0.02)
        return "success"
    except:
        return "error"
```
