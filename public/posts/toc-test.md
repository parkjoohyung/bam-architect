# 건축 설계와 필수 건축 법규 가이드 (TOC 테스트)

건축물을 설계하고 준공에 이르기까지는 디자인적 아름다움뿐만 아니라 복잡한 건축 법규들을 철저히 준수해야 합니다. 이 글에서는 건축 설계 시 가장 기본이 되면서도 중요한 필수 건축 법규들을 상세히 다룹니다.

## 1. 건축 설계의 시작과 법적 기준

모든 건축 프로젝트는 대지가 가진 법적 테두리를 분석하는 데서 출발합니다. 용도지역, 용도지구에 따라 건축할 수 있는 건물의 종류와 규모가 완전히 달라지기 때문입니다.

### 1.1 용도지역지구제 개요
용도지역은 국토의 계획 및 이용에 관한 법률에 따라 전국 토지를 효율적으로 이용하기 위해 지정한 구분입니다. 주거지역, 상업지역, 공업지역, 녹지지역 등으로 크게 나뉘며, 각 지역마다 건축 가능한 용도와 밀도가 다르게 제한됩니다.

### 1.2 토지이용계획확인서 확인 방법
설계를 시작하기 전 가장 먼저 확인해야 할 서류는 '토지이용계획확인서'입니다. 이를 통해 해당 필지의 규제 상태와 도로와의 관계 등을 명확하게 파악할 수 있습니다.

## 2. 건폐율과 용적률의 이해

건축물의 밀도와 규모를 결정하는 핵심 지표인 건폐율과 용적률에 대해 알아봅니다.

### 2.1 건폐율 (Building-to-Land Ratio)
건폐율은 대지면적에 대한 건축면적(하늘에서 바라본 건물의 수평투영면적)의 비율을 뜻합니다.
$$\text{건폐율} = \frac{\text{건축면적}}{\text{대지면적}} \times 100$$
대지 내에 최소한의 공지를 확보하여 일조, 통풍, 방화 및 피난에 필요한 공간을 남겨두기 위한 법적 기준입니다.

### 2.2 용적률 (Floor Area Ratio)
용적률은 대지면적에 대한 연면적(각 층 바닥면적의 합계)의 비율을 말합니다. 다만, 용적률 산정 시 지하층 면적, 지상층의 주차용 면적, 피난안전구역 등은 제외됩니다.
$$\text{용적률} = \frac{\text{용적률 산정용 연면적}}{\text{대지면적}} \times 100$$
도시의 수직적 밀도를 제어하여 기반 시설(도로, 상하수도 등)의 과부하를 방지하기 위해 규제합니다.

### 2.3 [실시간 계산기] 건폐율 & 용적률 시뮬레이터

대지 정보를 아래에 입력하면 자동으로 건폐율과 용적률이 계산됩니다.

<div style="background: var(--q-lightgray); border: 1px solid var(--q-gray); padding: 1.5rem; border-radius: 12px; margin: 1.5rem 0; max-width: 480px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); font-family: sans-serif;">
    <h4 style="margin-top: 0; margin-bottom: 1.25rem; font-size: 1.1rem; color: var(--q-dark); border-bottom: 1px solid var(--q-gray); padding-bottom: 0.5rem; display: flex; align-items: center; gap: 0.5rem;">
        📊 실시간 건축 규모 시뮬레이터
    </h4>
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
        <div>
            <label style="display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: var(--q-darkgray);">대지면적 (㎡)</label>
            <input type="number" id="calc-land" value="200" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--q-gray); background: var(--q-light); color: var(--q-dark); font-size: 0.9rem;" oninput="runCalculator()">
        </div>
        <div>
            <label style="display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: var(--q-darkgray);">건축면적 (㎡)</label>
            <input type="number" id="calc-build" value="120" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--q-gray); background: var(--q-light); color: var(--q-dark); font-size: 0.9rem;" oninput="runCalculator()">
        </div>
    </div>
    <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.4rem; font-size: 0.85rem; font-weight: 600; color: var(--q-darkgray);">용적률 산정용 연면적 (㎡)</label>
        <input type="number" id="calc-floor" value="360" style="width: 100%; padding: 0.6rem; border-radius: 6px; border: 1px solid var(--q-gray); background: var(--q-light); color: var(--q-dark); font-size: 0.9rem;" oninput="runCalculator()">
        <span style="font-size: 0.75rem; color: var(--q-gray); display: block; margin-top: 0.25rem;">* 지하층, 지상층 주차장 등은 산정에서 제외</span>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; border-top: 1px solid var(--q-gray); padding-top: 1.25rem; background: rgba(0,0,0,0.02); border-radius: 0 0 8px 8px;">
        <div style="text-align: center; padding: 0.5rem; background: var(--q-light); border-radius: 8px; border: 1px solid var(--q-lightgray);">
            <div style="font-size: 0.8rem; color: var(--q-gray); margin-bottom: 0.25rem; font-weight: 600;">건폐율 결과</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--q-secondary);"><span id="res-coverage">60.00</span> %</div>
        </div>
        <div style="text-align: center; padding: 0.5rem; background: var(--q-light); border-radius: 8px; border: 1px solid var(--q-lightgray);">
            <div style="font-size: 0.8rem; color: var(--q-gray); margin-bottom: 0.25rem; font-weight: 600;">용적률 결과</div>
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--q-secondary);"><span id="res-far">180.00</span> %</div>
        </div>
    </div>
</div>

<script>
function runCalculator() {
    const land = parseFloat(document.getElementById('calc-land').value) || 0;
    const build = parseFloat(document.getElementById('calc-build').value) || 0;
    const floor = parseFloat(document.getElementById('calc-floor').value) || 0;
    
    const coverageEl = document.getElementById('res-coverage');
    const farEl = document.getElementById('res-far');
    
    if (land <= 0) {
        coverageEl.innerText = '0.00';
        farEl.innerText = '0.00';
        return;
    }
    
    const coverage = (build / land) * 100;
    const far = (floor / land) * 100;
    
    coverageEl.innerText = coverage.toFixed(2);
    farEl.innerText = far.toFixed(2);
}
// Initial run
setTimeout(runCalculator, 500);
</script>

## 3. 대지 안의 공지 및 일조권 사선제한

주변 건물과의 조화와 도심 내 쾌적성을 유지하기 위한 공간 배치 규정입니다.

### 3.1 대지 안의 공지 기준
건축물을 건축할 때는 대지경계선으로부터 건물 외벽까지 일정 거리 이상을 띄워야 합니다. 용도와 규모에 따라 최소 0.5m에서 6m까지 이격 거리가 규정되어 있습니다.

### 3.2 일조 등의 확보를 위한 높이 제한 (일조권)
전용주거지역과 일반주거지역 안에서 건축하는 경우, 인접 대지경계선으로부터 일조 확보를 위해 정북 방향으로 일정 거리를 띄워 건물을 지어야 합니다.
- 높이 9m 이하 부분: 인접 대지경계선으로부터 최소 1.5m 이상 이격
- 높이 9m 초과 부분: 건축물 높이의 1/2 이상 이격

## 4. 도로와 대지의 관계 (접도구역)

건축물은 반드시 도로에 접해 있어야 정상적으로 건축 허가를 받을 수 있습니다.

### 4.1 접도의 의무 (소방 도로 확보)
건축물의 대지는 4미터 이상 도로에 2미터 이상 접하여야 합니다. 이는 화재 등 비상사태 시 소방차의 진입과 피난을 돕기 위한 필수 요건입니다.

### 4.2 막다른 도로의 예외 규정
도로의 끝이 막혀 있는 막다른 도로의 경우, 도로의 길이에 따라 필요한 너비 기준(10m 미만은 2m, 35m 이상은 6m 등)이 다르게 적용되므로 면밀히 확인해야 합니다.

## 5. 결론 및 종합 의견

아무리 뛰어난 디자인 아이디어가 있더라도 건축 법규의 검토 없이는 실현 가능한 건축물이 될 수 없습니다. 초기 기획 단계부터 전문 건축사와 함께 대지 분석 및 관련 법규를 정밀 검토하는 프로세스가 반드시 수반되어야 성공적인 건축을 완성할 수 있습니다.
