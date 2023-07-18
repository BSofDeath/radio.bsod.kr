export default {
    async fetch(request, env, ctx) {
      const url = new URL(request.url)
      const stn = url.searchParams.get('stn')
      const ch = url.searchParams.get('ch')
      const city = url.searchParams.get('city')
      let result
  
      /*----- KBS 라디오 -----*/
      if (stn == 'kbs') {
        let param;
  
        switch(ch) {
          case '1radio': param = '21'; break;
          case '2radio': param = '22'; break;
          case '3radio': param = '23'; break;
          case '1fm': param = '24'; break;
          case '2fm': param = '25'; break;
          case 'hanminjok': param = '26'; break;
        }
        switch(city) {
          case 'busan': param = '10_' + param; break;
          case 'changwon': param = '20_' + param; break;
          case 'jinju': param = '21_' + param; break;
          case 'daegu': param = '30_' + param; break;
          case 'andong': param = '31_' + param; break;
          case 'pohang': param = '32_' + param; break;
          case 'gwangju': param = '40_' + param; break;
          case 'mokpo': param = '41_' + param; break;
          case 'suncheon': param = '43_' + param; break;
          case 'jeonju': param = '50_' + param; break;
          case 'daejeon': param = '60_' + param; break;
          case 'cheongju': param = '70_' + param; break;
          case 'chuncheon': param = '80_' + param; break;
          case 'gangneung': param = '81_' + param; break;
          case 'wonju': param = '82_' + param; break;
          case 'jeju': param = '90_' + param; break;
          default: break;
        }
        const promise = await fetch("https://cfpwwwapi.kbs.co.kr/api/v1/landing/live/channel_code/" + param);
        try {
         const json = await promise.json();
          result = json.channel_item[0].service_url;
        } catch (e) {
          result = undefined;
        }
      }
      /*----- MBC 라디오 -----*/
      else if (stn == 'mbc') {
        switch(ch) {
          case 'sfm': // MBC 표준FM
            switch(city) {
              case 'busan': result = "https://stream.bsmbc.com/live/mp4:BusanMBC-LiveStream-AM/playlist.m3u8"; break;
              case 'ulsan': result = "https://5ddfd163bd00d.streamlock.net/STDFM/STDFM/playlist.m3u8"; break;
              case 'changwon': result = "https://624a79c87201d.streamlock.net/MBCFM/TV2.stream/playlist.m3u8"; break;
              case 'daegu': result = "https://5ee1ec6f32118.streamlock.net/amradio/am/playlist.m3u8"; break;
              case 'andong': result = "https://live.andongmbc.co.kr/live/amlive/playlist.m3u8"; break;
              case 'pohang': result = "http://stream.yubinet.com:1935/live/_definst_/Radio_Am/playlist.m3u8"; break;
              case 'gwangju': result = "https://media.kjmbc.co.kr/hls/amlive/GWANGJU-MBC-AM/playlist.m3u8"; break;
              case 'mokpo': result = "https://vod.mpmbc.co.kr/live/encoder-am/playlist.m3u8"; break;
              case 'yeosu': result = "https://5c3639aa99149.streamlock.net/표준FM/표준FM/playlist.m3u8"; break;
              case 'jeonju': result = "https://5ee9633b25727.streamlock.net/jmbc_sfm/myStream/playlist.m3u8"; break;
              case 'daejeon': result = "https://ns1.tjmbc.co.kr/live_am/live_am.stream/playlist.m3u8"; break;
              case 'cheongju': result = "https://mbccbp.coreit.co.kr/radio_stfm/myStream.sdp/playlist.m3u8"; break;
              case 'chuncheon': result = "https://stream.chmbc.co.kr/live_radio/fm2/playlist.m3u8"; break;
              case 'wonju': result = "mms://live.wjmbc.co.kr/fm2"; break;
              case 'gangneung': result = "http://123.254.72.24:1935/amlive/livestream/playlist.m3u8"; break;
              case 'jeju': result = "https://wowza.jejumbc.com/live/_definst_/mp3:radio1/playlist.m3u8"; break;
              default:
                const promise = await fetch("https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=sfm");
                const text = await promise.text();
                result = text;
                break;
            }
            break;
          case 'fm4u':  // MBC FM4U
            switch(city) {
              case 'busan': result = "https://stream.bsmbc.com/live/mp4:BusanMBC-LiveStream-FM/playlist.m3u8"; break;
              case 'ulsan': result = "https://5ddfd163bd00d.streamlock.net/FM4U/FM4U/playlist.m3u8"; break;
              case 'changwon': result = "https://624a79c87201d.streamlock.net/MBCFM4U/TV3.stream/playlist.m3u8"; break;
              case 'daegu': result = "https://5ee1ec6f32118.streamlock.net/fmradio/fm/playlist.m3u8"; break;
              case 'andong': result = "https://live.andongmbc.co.kr/live/fmlive/playlist.m3u8"; break;
              case 'pohang': result = "http://stream.yubinet.com:1935/live/_definst_/Radio_Fm/playlist.m3u8"; break;
              case 'gwangju': result = "https://media.kjmbc.co.kr/hls/fmlive/GWANGJU-MBC-FM/playlist.m3u8"; break;
              case 'mokpo': result = "https://vod.mpmbc.co.kr/live/encoder-fm/playlist.m3u8"; break;
              case 'yeosu': result = "https://5c3639aa99149.streamlock.net/FM4U/FM4U/playlist.m3u8"; break;
              case 'jeonju': result = "https://5ee9633b25727.streamlock.net/jmbc_fm4u/myStream/playlist.m3u8"; break;
              case 'daejeon': result = "https://ns1.tjmbc.co.kr/live_fm/live_fm.stream/playlist.m3u8"; break;
              case 'cheongju': result = "https://mbccbp.coreit.co.kr/radio_fm/myStream.sdp/playlist.m3u8"; break;
              case 'chuncheon': result = "https://stream.chmbc.co.kr/live_radio2/fm1/playlist.m3u8"; break;
              case 'wonju': result = "mms://live.wjmbc.co.kr/fm989"; break;
              case 'gangneung': result = "http://123.254.72.24:1935/fmlive/livestream/playlist.m3u8"; break;
              case 'jeju': result = "https://wowza.jejumbc.com/live/_definst_/mp3:radio2/playlist.m3u8"; break;
              default:
                const promise = await fetch("https://sminiplay.imbc.com/aacplay.ashx?agent=webapp&channel=mfm");
                const text = await promise.text();
                result = text;
                break;
            }
            break;
        }
      }
      /*----- SBS 라디오 -----*/
      else if (stn == 'sbs') {
        let text;
  
        switch(ch) {
          case 'lovefm':  // SBS 러브FM
            switch(city) {
              case 'busan': result = "https://stream1.knn.co.kr/hls/b3y26uu6471k8tes9w7h_lfm/index.m3u8"; break;
              default:
                const promise = await fetch("https://apis.sbs.co.kr/play-api/1.0/livestream/lovepc/lovefm?protocol=hls&ssl=Y");
                text = await promise.text();
                result = text;
                break;
            }
            break;
          case 'powerfm': // SBS 파워FM
            switch(city) {
              case 'busan': result = "https://stream1.knn.co.kr/hls/lb9ezl87d37uu0vy65bb_pfm/index.m3u8"; break;
              case 'ulsan': result = "http://59.23.231.102:1935/live/mp3:UBCfmstream/playlist.m3u8"; break;
              case 'daegu': result = "http://203.251.91.122:1935/on-air-Backup/fm/playlist.m3u8"; break;
              case 'gwangju': result = "https://vod.ikbc.co.kr/KBCFM/kbcra_aac/playlist.m3u8"; break;
              case 'jeonju': result = "http://61.85.197.53:1935/jtv_radio/myStream/playlist.m3u8"; break;
              case 'daejeon': result = "http://1.245.74.5/radiolive/radio_64k/playlist.m3u8"; break;
              case 'cheongju': result = "https://wowza1.cjb.co.kr/live/cjbradio/playlist.m3u8"; break;
              case 'chuncheon': result = "http://61.82.49.4:1935/fm/_definst_/myStream/playlist.m3u8"; break;
              case 'jeju': result = "http://123.140.197.22/stream/2/play.m3u8"; break;
              default:
                const promise = await fetch("https://apis.sbs.co.kr/play-api/1.0/livestream/powerpc/powerfm?protocol=hls&ssl=Y");
                text = await promise.text();
                result = text;
                break;
              }
            break;
        }
      }
       /*----- TBN 교통방송 -----*/
      else if (stn == 'tbn') {
        switch(city) {
          case 'busan': result = "http://radio2.tbn.or.kr:1935/busan/myStream/playlist.m3u8"; break;
          case 'ulsan': result = "http://radio2.tbn.or.kr:1935/ulsan/myStream/playlist.m3u8"; break;
          case 'gyeongnam': result = "http://radio2.tbn.or.kr:1935/gyeongnam/myStream/playlist.m3u8"; break;
          case 'daegu': result = "http://radio2.tbn.or.kr:1935/daegu/myStream/playlist.m3u8"; break;
          case 'kyungbuk': result = "http://radio2.tbn.or.kr:1935/kyungbuk/myStream/playlist.m3u8"; break;
          case 'gwangju': result = "http://radio2.tbn.or.kr:1935/gwangju/myStream/playlist.m3u8"; break;
          case 'jeonbuk': result = "http://radio2.tbn.or.kr:1935/jeonbuk/myStream/playlist.m3u8"; break;
          case 'daejeon': result = "http://radio2.tbn.or.kr:1935/daejeon/myStream/playlist.m3u8"; break;
          case 'chungbuk': result = "http://radio2.tbn.or.kr:1935/chungbuk/myStream/playlist.m3u8"; break;
          case 'gangwon': result = "http://radio2.tbn.or.kr:1935/gangwon/myStream/playlist.m3u8"; break;
          case 'jeju': result = "http://radio2.tbn.or.kr:1935/jeju/myStream/playlist.m3u8"; break;
          default: result = "http://radio2.tbn.or.kr:1935/gyeongin/myStream/playlist.m3u8"; break;
        }
      }
      /*----- CBS 기독교방송 -----*/
      else if (stn == 'cbs') {
        switch(ch) {
          case 'sfm': // CBS 표준FM
            switch(city) {
              case 'busan': result = "https://aac.cbs.co.kr/busan981/_definst_/busan981.stream/playlist.m3u8"; break;
              case 'ulsan': result = "https://aac.cbs.co.kr/ulsan/_definst_/ulsan.stream/playlist.m3u8"; break;
              case 'gyeongnam': result = "https://aac.cbs.co.kr/gyeongnam/_definst_/gyeongnam.stream/playlist.m3u8"; break;
              case 'daegu': result = "https://aac.cbs.co.kr/daegu/_definst_/daegu.stream/playlist.m3u8"; break;
              case 'pohang': result = "https://aac.cbs.co.kr/pohang/_definst_/pohang.stream/playlist.m3u8"; break;
              case 'gwangju': result = "https://aac.cbs.co.kr/gwangju/_definst_/gwangju.stream/playlist.m3u8"; break;
              case 'jeonnam': result = "https://aac.cbs.co.kr/jeonnam/_definst_/jeonnam.stream/playlist.m3u8"; break;
              case 'jeonbuk': result = "https://aac.cbs.co.kr/jeonbuk/_definst_/jeonbuk.stream/playlist.m3u8"; break;
              case 'daejeon': result = "https://aac.cbs.co.kr/daejeon/_definst_/daejeon.stream/playlist.m3u8"; break;
              case 'cheongju': result = "https://aac.cbs.co.kr/cheongju/_definst_/cheongju.stream/playlist.m3u8"; break;
              case 'chuncheon': result = "https://aac.cbs.co.kr/chuncheon/_definst_/chuncheon.stream/playlist.m3u8"; break;
              case 'jeju': result = "https://aac.cbs.co.kr/jeju/_definst_/jeju.stream/playlist.m3u8"; break;
              default: result = "https://aac.cbs.co.kr/cbs981/_definst_/cbs981.stream/playlist.m3u8"; break;
            }
            break;
          case 'mfm': // CBS 음악FM
            switch(city) {
              case 'busan': result = "https://aac.cbs.co.kr/busan939/_definst_/busan939.stream/playlist.m3u8"; break;
              case 'daegu': result = "https://aac.cbs.co.kr/daegu939/_definst_/daegu939.stream/playlist.m3u8"; break;
              default: result = "https://aac.cbs.co.kr/cbs939/_definst_/cbs939.stream/playlist.m3u8"; break;
            }
            break;
        }
      }
      /*----- FEBC 극동방송 -----*/
      else if (stn == 'febc') {
        switch(city) {
          case 'busan': result = "http://mlive2.febc.net:1935/live/bsfebc/playlist.m3u8"; break;
          case 'ulsan': result = "http://mlive2.febc.net:1935/live/uslive/playlist.m3u8"; break;
          case 'changwon': result = "http://mlive2.febc.net:1935/live/cwlive/playlist.m3u8"; break;
          case 'daegu': result = "http://220.73.173.216:1935/live/daegulive/playlist.m3u8"; break;
          case 'pohang': result = "http://mlive2.febc.net:1935/live/phlive/playlist.m3u8"; break;
          case 'gwangju': result = "http://mlive2.febc.net:1935/live/gjlive/playlist.m3u8"; break;
          case 'mokpo': result = "http://mlive2.febc.net:1935/live/mplive/playlist.m3u8"; break;
          case 'jeonnam': result = "http://mlive2.febc.net:1935/live/jndblive/playlist.m3u8"; break;
          case 'jeonbuk': result = "http://mlive2.febc.net:1935/live/jblive/playlist.m3u8"; break;
          case 'daejeon': result = "http://mlive2.febc.net:1935/live/djlive/playlist.m3u8"; break;
          case 'gangwon': result = "http://mlive2.febc.net:1935/live/ydlive/playlist.m3u8"; break;
          case 'jeju': result = "http://mlive2.febc.net:1935/live/jejufm/playlist.m3u8"; break;
          default: result = "http://mlive2.febc.net:1935/live/seoulfm/playlist.m3u8"; break;
        }
      }
      /*----- BBS 불교방송 -----*/
      else if (stn == 'bbs') {
        switch(city) {
          case 'gwangju': result = "http://live.cdn.smilecdn.com:1935/kjbbs1_live/live/playlist.m3u8"; break;
          case 'daegu': result = "https://bbslive.goldenday.kr:446/hls/dgbbs.m3u8"; break;
          default: result = "https://bbslive.clouducs.com/bbsradio-live/livestream/playlist.m3u8"; break;
        }
      }
      /*----- CPBC 가톨릭평화방송 -----*/
      else if (stn == 'cpbc') {
        switch(city) {
          case 'busan': result = "http://pbcradio.dynamicsmart.com:1935/radio/bscpbc-radio/index.m3u8"; break;
          case 'daegu': result = "http://live.dgcpbc.co.kr/dgcpbclive/livestream/playlist.m3u8"; break;
          case 'gwangju': result = "http://pbcradio.dynamicsmart.com:1935/radio/kjpbc2/index.m3u8"; break;
          default:
            const promise = await fetch("https://apis.cpbc.co.kr/play-api/2.0/onair/channel/radio");
            const json = await promise.json();
            result = await json.onair.source.mediasource.mediaurl;
            break;
        }
      }
      /*----- WBS 원음방송 -----*/
      else if (stn == 'wbs') {
        switch(city) {
          case 'busan': result = "http://141.164.60.206:8000/wbs-b"; break;
          case 'daegu': result = "http://141.164.60.206:8000/wbs-d"; break;
          case 'gwangju': result = "http://141.164.60.206:8000/wbs-g"; break;
          case 'jeonbuk': result = "http://141.164.60.206:8000/wbs-j"; break;
          default: result = "http://45.76.71.4:8000/wbs-smok"; break;
        }
      }
      /*----- EBS 라디오 -----*/
      else if (stn == 'ebs') {
        result = "https://ebsonair.ebs.co.kr/fmradiofamilypc/familypc1m/playlist.m3u8";
      }
      /*----- TBS 라디오 -----*/
      else if (stn == 'tbs') {
        switch(ch) {
          // TBS FM
          case 'fm': result = "https://cdnfm.tbs.seoul.kr/tbs/_definst_/tbs_fm_web_360.smil/playlist.m3u8"; break;
          // TBS eFM
          case 'efm': result = "https://cdnefm.tbs.seoul.kr/tbs/_definst_/tbs_efm_web_360.smil/playlist.m3u8"; break;
        }
      }
      /*----- YTN 라디오 -----*/
      else if (stn == 'ytn') {
        result = "https://radiolive.ytn.co.kr/radio/_definst_/20211118_fmlive/playlist.m3u8";
      }
      /*----- iFM 경인방송 -----*/
      else if (stn == 'ifm') {
        result = "http://180.131.1.27:1935/live/aod1/playlist.m3u8";
      }
      /*----- OBS 라디오 -----*/
      else if (stn == 'obs') {
        result = "https://vod3.obs.co.kr:444/live/obsstream1/radio.stream/playlist.m3u8";
      }
      /*----- 국방FM -----*/
      else if (stn == 'kookbang') {
        result = "https://mediaworks.dema.mil.kr/live_edge/audio.sdp/playlist.m3u8";
      }
      /*----- 국악방송 -----*/
      else if (stn == 'kugak') {
        result = "https://mgugaklive.nowcdn.co.kr/gugakradio/gugakradio.stream/playlist.m3u8";
      }
  
      if (result != undefined) {
        if (url.pathname.includes("playback.pls")) {  // pls 요청 시 동작
          const pls = `[playlist]\nFile1=` + result + `\nLength1=-1\n`;
          return new Response(pls, {headers: {'content-type': 'audio/x-scpls'}});
        }
        return Response.redirect(result); // m3u8 요청 시 동작
      }
      return new Response('Bad Request', {status: 400, headers: { 'content-type': 'text/plain'}}) // 400 Bad Request
    },
  };