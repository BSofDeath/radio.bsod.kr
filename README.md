# radio.bsod.kr
대한민국에 소속된 모든 라디오 방송국의 Streaming URL을 종합한 웹 사이트를 구축하는 프로젝트입니다.

이곳에는 (파생 프로젝트를 기획하시는 분들께 도움이 될 수 있도록) 본 프로덕트의 개발 과정에서 활용된 **원본 Streaming URL**들에 대한 정보를 기록하였습니다. 개발 과정 자체에 대한 기록은 [블로그에 작성한 글](https://blog.bsod.kr/137)을 참고해 주세요.

<br>

## 프로덕트의 구성
* Vanilla JS 코드로 동작하는 Cloudflare Workers 인스턴스 — [https://radio.bsod.kr/stream/*](https://radio.bsod.kr/stream/*)
* 위의 인스턴스를 동작시키는 유효한 URL을 모아둔 정적 웹 페이지 — [https://radio.bsod.kr](https://radio.bsod.kr)

<br>

## 동적 URL을 사용하는 방송국

### KBS
| 채널 이름 | URL | 콘텐츠 유형 |
|-----------|-----|-------------|
| KBS 1라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/21 | API Response (JSON) |
| KBS 2라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/22 | API Response (JSON) |
| KBS 3라디오 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/23 | API Response (JSON) |
| KBS 1FM | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/24 | API Response (JSON) |
| KBS 2FM | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/25 | API Response (JSON) |
| KBS 한민족방송 | https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/26 | API Response (JSON) |

#### API Request 형식
> <code>https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/[채널코드]</code><br>

Response에서 <code>channel.item[0].service_url</code> 변수에 접근하여 Streaming URL 획득 가능.

#### 채널코드 일람
| | 1라디오 | 2라디오 | 3라디오 | 1FM | 2FM | 한민족방송 | 
|-------|-------|-------|-------|-------|-------|-------|
| 수도권 | <code>21</code> | <code>22</code> | <code>23</code> | <code>24</code> | <code>25</code> | <code>26</code> |
| 부산 | <code>10_21</code> | <code>10_22</code> |  | <code>10_24</code> |  |  |
| 창원 | <code>20_21</code> | <code>20_22</code> |  | <code>20_24</code> |  |  |
| 진주 | <code>21_21</code> |  |  |  |  |  |
| 대구 | <code>30_21</code> | <code>30_22</code> |  | <code>30_24</code> |  |  |
| 안동 | <code>31_21</code> |  |  |  |  |  |
| 포항 | <code>32_21</code> |  |  |  |  |  |
| 광주 | <code>40_21</code> | <code>40_22</code> |  | <code>40_24</code> |  |  |
| 목포 | <code>41_21</code> |  |  | <code>41_24</code> |  |  |
| 순천 | <code>43_21</code> |  |  |  |  |  |
| 전주 | <code>50_21</code> | <code>50_22</code> |  | <code>50_24</code> |  |  |
| 대전 | <code>60_21</code> | <code>60_22</code> |  | <code>60_24</code> |  |  |
| 청주 | <code>70_21</code> | <code>70_22</code> |  | <code>70_24</code> |  |  |
| 춘천 | <code>80_21</code> | <code>80_22</code> |  | <code>80_24</code> |  |  |
| 강릉 | <code>81_21</code> |  |  | <code>81_24</code> |  |  |
| 원주 | <code>82_21</code> |  |  | <code>82_24</code> |  |  |
| 제주 | <code>90_21</code> | <code>90_22</code> |  | <code>90_24</code> |  |  |<br>

<br>

### MBC
| 채널 이름 | URL | 콘텐츠 유형 |
|-----------|-----|-------------|
| MBC 표준FM | https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm | API Response (Plain Text) |
| MBC FM4U | https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=mfm | API Response (Plain Text) |

#### API Request 형식
> <code>https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=[채널코드]</code>

HTML에 Streaming URL만 Plain Text로 포함되어 있으므로 text를 그대로 가져오면 됨.

#### 채널코드 일람
| | 표준FM | FM4U |
|-|-------|-------|
| 수도권 | <code>sfm</code> | <code>mfm</code> |<br>

<br>

### SBS
| 채널 이름 | URL | 콘텐츠 유형 |
|-----------|-----|-------------|
| SBS 러브FM | https://apis.sbs.co.kr/play-api/1.0/livestream/powerpc/powerfm?protocol=hls&ssl=Y | API Response (Plain Text) |
| SBS 파워FM | https://apis.sbs.co.kr/play-api/1.0/livestream/lovepc/lovefm?protocol=hls&ssl=Y | API Response (Plain Text) |

#### API Request 형식
> <code>https://apis.sbs.co.kr/play-api/1.0/livestream/[채널코드]pc/[채널코드]fm?protocol=hls&ssl=Y</code>

HTML에 Streaming URL만 Plain Text로 포함되어 있으므로 text를 그대로 가져오면 됨.

#### 채널코드 일람
| | 러브FM | 파워FM |
|-|--------|--------|
| 수도권 | <code>love</code> | <code>power</code> |<br>

<br>

### CPBC 가톨릭평화방송 (수도권)
| 채널 이름 | URL | 콘텐츠 유형 |
|-----------|-----|-------------|
| CPBC 서울가톨릭평화방송 | https://apis.cpbc.co.kr/play-api/2.0/onair/channel/radio | API Response (JSON) |

#### API Request 형식
> <code>https://apis.cpbc.co.kr/play-api/2.0/onair/channel/radio</code><br>

Response에서 <code>onair.source.mediasource.mediaurl</code> 변수에 접근하여 Streaming URL 획득 가능.

<br>

## 정적 URL을 사용하는 방송국
| 채널 이름 | URL | 콘텐츠 유형 |
|-----------|-----|-------------|
| TBN 경인교통방송 | http://radio2.tbn.or.kr:1935/gyeongin/myStream/playlist.m3u8 | Static Playlist |
| CBS 표준FM | https://aac.cbs.co.kr/cbs981/_definst_/cbs981.stream/playlist.m3u8 | Static Playlist |
| CBS 음악FM | https://aac.cbs.co.kr/cbs981/_definst_/cbs981.stream/playlist.m3u8 | Static Playlist |
| FEBC 서울극동방송 | http://mlive2.febc.net:1935/live/seoulfm/playlist.m3u8 | Static Playlist |
| BBS 서울불교방송 | https://bbslive.clouducs.com/bbsradio-live/livestream/playlist.m3u8 | Static Playlist |
| EBS FM | https://ebsonair.ebs.co.kr/fmradiofamilypc/familypc1m/playlist.m3u8 | Static Playlist |
| YTN 라디오| https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8 | Static Playlist |
| iFM 경인방송 | https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8 | Static Playlist |
| OBS 라디오 | https://vod3.obs.co.kr:444/live/obsstream1/radio.stream/playlist.m3u8 | Static Playlist |
| TBS FM | https://cdnfm.tbs.seoul.kr/tbs/_definst_/tbs_fm_web_360.smil/playlist.m3u8 | Static Playlist |
| TBS eFM | https://cdnfm.tbs.seoul.kr/tbs/_definst_/tbs_efm_web_360.smil/playlist.m3u8 | Static Playlist |
| 국방FM | https://mediaworks.dema.mil.kr/live_edge/audio.sdp/playlist.m3u8 | Static Playlist |
| 국악방송 | https://mgugaklive.nowcdn.co.kr/gugakradio/gugakradio.stream/playlist.m3u8 | Static Playlist |

기타 지역국들의 URL은 [Notion 페이지](https://notion.bsod.kr/7ca7ce3d1011420293084a963fed0b38)에 기재해 놓았습니다.
