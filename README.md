# radio.bsod.kr
대한민국 내 모든 라디오 방송국의 스트림 URL을 수집 및 종합하여, 웹에서 클릭 한 번으로 원하는 방송을 실시간 청취할 수 있는 **라디오 플레이어** 웹 앱을 구축하는 프로젝트입니다.

파생 프로젝트를 기획하시는 분들께 도움이 될 수 있도록, README에서는 **실제 프로덕션의 동작 구조**와 개발 과정에서 취합한 **주요 방송국별 스트림 URL 취득 방식**을 일부 정리하여 안내합니다.

<br>

> 2026년 11월 기준으로 작성된 내용이며, 방송국의 정책 변경 등에 따라 적용 가능한 부분이 실제와 달라질 수 있습니다.

<br>

## 프로덕션의 동작 구조
* 본 리포지토리에는 웹 앱을 구성하는 정적 파일이 저장되어 있으며, [프로덕션](https://radio.bsod.kr) 환경에서는 이를 **Cloudflare Pages**로 배포 및 호스팅하고 있습니다.
* 사전 정의된 [템플릿](functions/api/template)이나 방송국 서버에서 스트림 URL을 가져오는 로직은 Cloudflare의 서버리스 함수(**Pages Functions**)가 처리하며, 웹 앱에서는 이렇게 얻은 URL을 토대로 (필요한 경우 hls.js 등의 라이브러리를 활용해) 방송을 재생합니다.

<br>

## 스트림 URL의 취득 방식
* 대부분의 방송국은 고정된 스트림 URL로 HLS(m3u8) 스트림을 서비스합니다. 이러한 URL들은 [템플릿](functions/api/template)에 사전 정의되어 있습니다.
* 다만, 일부 방송국은 접근 제어를 목적으로 자체 API를 통해 유효 기간이 부여된 토큰을 발급하고, 이를 스트림 URL의 일부로 포함하여 서비스합니다. 이 때문에 **접속할 때마다 URL의 일부가 변동되며 한번 획득한 URL도 일정 시간이 지나면 사용할 수 없게 되므로** 이러한 방송국의 경우 URL 취득 시 추가적인 방안을 강구해야 합니다.
  * Cloudflare 서비스 기반으로 운용 중인 [프로덕션](https://radio.bsod.kr) 환경에서는 **Pages Functions**를 통해 방송국 API에서 받은 URL을 **Workers KV** 저장소에 최대 12시간 동안 임시 저장 후 재사용하여, 방송국 API 서버로의 호출 횟수를 가능한 한 줄일 수 있는 방식으로 운영하고 있습니다.
  * 2026년 11월 기준, 해당 정책에 따라 스트림 URL을 제공하는 방송국은 다음과 같습니다.
    * **KBS 한국방송 본사 및 전체 지역국**
    * **MBC 문화방송**
    * **MBC 부산문화방송**
    * **SBS**
    * **CPBC 가톨릭평화방송 본사** (고정 URL도 동시 제공)

<br>

## 방송국별 스트림 URL 취득 정보
### KBS 한국방송
> 실제 구현된 코드는 [functions/api/template/kbs.js](https://github.com/BSofDeath/radio.bsod.kr/blob/main/functions/api/template/kbs.js)에서 확인 가능
#### API 요청 주소
* 본사 기준 스트림 URL을 받아올 수 있는 API 요청 주소는 채널별로 아래와 같습니다.

| 채널명 | URL | 응답 형식 |
|--------|-----|-----------|
| KBS 1라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/21 | JSON |
| KBS 2라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/22 | JSON |
| KBS 3라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/23 | JSON |
| KBS 1FM | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/24 | JSON |
| KBS 2FM | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/25 | JSON |
| KBS 한민족방송 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/26 | JSON |

<br>

* API 요청 주소 중 맨 끝 `channel_code/` 다음에 들어가는 값을 적절히 바꾸어 다른 지역국 채널의 스트림 URL도 받아올 수 있습니다.

| | 1라디오 | 2라디오 | 3라디오 | 1FM | 2FM | 한민족방송 | 
|-------|-------|-------|-------|-------|-------|-------|
| 본사(수도권) | `21` | `22` | `23` | `24` | `25` | `26` |
| KBS부산 | `10_21` | `10_22` |  | `10_24` |  |  |
| KBS울산 | `11_21` |  |  |  |  |  |
| KBS창원 | `20_21` | `20_22` |  | `20_24` |  |  |
| KBS진주 | `21_21` |  |  |  |  |  |
| KBS대구 | `30_21` | `30_22` |  | `30_24` |  |  |
| KBS안동 | `31_21` |  |  |  |  |  |
| KBS포항 | `32_21` |  |  |  |  |  |
| KBS광주 | `40_21` | `40_22` |  | `40_24` |  |  |
| KBS목포 | `41_21` |  |  | `41_24` |  |  |
| KBS순천 | `43_21` |  |  |  |  |  |
| KBS전주 | `50_21` | `50_22` |  | `50_24` |  |  |
| KBS대전 | `60_21` | `60_22` |  | `60_24` |  |  |
| KBS청주 | `70_21` | `70_22` |  | `70_24` |  |  |
| KBS충주 | `71_21` |  |  | `71_24` |  |  |
| KBS춘천 | `80_21` | `80_22` |  | `80_24` |  |  |
| KBS강릉 | `81_21` |  |  | `81_24` |  |  |
| KBS원주 | `82_21` |  |  | `82_24` |  |  |
| KBS제주 | `90_21` | `90_22` |  | `90_24` |  |  |<br>

<br>

#### API 응답 해석
* Response 객체 내에서 `channel.item[0].service_url`의 값이 토큰이 포함된 스트림 URL입니다.

<br>

---

### MBC 문화방송 본사
> 실제 구현된 코드는 [functions/api/template/mbc.js](https://github.com/BSofDeath/radio.bsod.kr/blob/main/functions/api/template/mbc.js)에서 확인 가능
#### API 요청 주소
공식 온에어 내 모든 채널의 스트림 URL을 받아올 수 있는 API 요청 주소는 아래와 같습니다. 
| 채널명 | URL | 응답 형식 |
|--------|-----|-----------|
| MBC 표준FM | https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm | HTML (plain text only) |
| MBC FM4U | https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=mfm | HTML (plain text only) |
| MBC mini 올댓뮤직 | https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=chm | HTML (plain text only) |

<br>

#### API 응답 해석
* API 응답은 HTML 페이지 안에 텍스트 한 줄만 포함된 형태이며, 응답 본문(response body)의 텍스트가 곧 토큰이 포함된 스트림 URL입니다.
* JavaScript의 경우 `await response.text()` 등으로 본문을 통째로 읽어 URL을 얻을 수 있습니다.

<br>

---

### MBC 부산문화방송
> 실제 구현된 코드는 [functions/api/template/mbc.js](https://github.com/BSofDeath/radio.bsod.kr/blob/main/functions/api/template/mbc.js)에서 확인 가능

MBC 부산문화방송은 별도의 토큰을 발급하지 않고, 날짜 단위로 유효한 URL이 변동되는 방식을 사용합니다.

#### 스트림 URL 구조
| 채널명 | URL 형식 |
|--------|----------|
| 부산MBC 표준FM | `https://brook.bsmbc.com/live/BusanMBC_AM_onairstream.<날짜코드>/playlist.m3u8` |
| 부산MBC FM4U | `https://brook.bsmbc.com/live/BusanMBC_FM_onairstream.<날짜코드>/playlist.m3u8` |

* 스트림 URL 경로의 일부에 한국 표준시(UTC+9) 기준 **오늘 날짜(`yymmdd`)를 6자리 알파벳으로 변환한 문자열**(일명 '날짜코드')이 포함되며, 방송국 서버에서는 이 값으로 URL의 유효성을 검증합니다.
* 별도의 토큰 없이 특정한 날짜에 의해 결정되는 값이기에, 오늘 날짜를 알 수 있다면 아래의 변환표를 참고하여 날짜코드가 포함된 유효한 URL을 직접 만들 수 있습니다.
  * 예) 오늘 날짜가 2026년 11월 1일이라면 유효한 날짜코드는 `261101` → **`sjhhqh`** 가 됩니다.

<br>

#### 날짜코드 변환표
| 숫자 | 대응 알파벳 |
|------|-------------|
| 0 | q |
| 1 | h |
| 2 | s |
| 3 | a |
| 4 | g |
| 5 | b |
| 6 | j |
| 7 | c |
| 8 | p |
| 9 | d |

<br>

---

### SBS
> 실제 구현된 코드는 [functions/api/template/sbs.js](https://github.com/BSofDeath/radio.bsod.kr/blob/main/functions/api/template/sbs.js)에서 확인 가능
#### API 요청 주소
공식 온에어 내 모든 채널의 스트림 URL을 받아올 수 있는 API 요청 주소는 아래와 같습니다. 
| 채널명 | URL | 응답 형식 |
|--------|-----|-----------|
| SBS 러브FM | https://apis.sbs.co.kr/play-api/1.0/livestream/powerpc/powerfm?protocol=hls&ssl=Y | HTML (plain text only) |
| SBS 파워FM | https://apis.sbs.co.kr/play-api/1.0/livestream/lovepc/lovefm?protocol=hls&ssl=Y | HTML (plain text only) |
| 고릴라디오M | https://apis.sbs.co.kr/play-api/1.0/livestream/sbsdmbpc/sbsdmb?protocol=hls&ssl=Y | HTML (plain text only) |

<br>

#### API 응답 해석
* API 응답은 HTML 페이지 안에 텍스트 한 줄만 포함된 형태이며, 응답 본문(response body)의 텍스트가 곧 토큰이 포함된 스트림 URL입니다.
* JavaScript의 경우 `await response.text()` 등으로 본문을 통째로 읽어 URL을 얻을 수 있습니다.

<br>

---

### CPBC 가톨릭평화방송 본사
> 실제 구현된 코드는 [functions/api/template/cpbc.js](https://github.com/BSofDeath/radio.bsod.kr/blob/main/functions/api/template/cpbc.js)에서 확인 가능
#### API 요청 주소
| URL | 응답 형식 |
|-----|-----------|
| https://apis.cpbc.co.kr/play-api/2.0/onair/channel/radio | JSON |

<br>

#### API 응답 해석
* Response 객체 내에서 `onair.source.mediasource.mediaurl`의 값이 토큰이 포함된 스트림 URL입니다.
