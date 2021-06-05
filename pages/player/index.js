// pages/player/index.js
let backgroundAudioManager = wx.getBackgroundAudioManager()
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    showLrc: false,
    hasEn: false,
    isShowList: true,
    qualityTxt: '标准',
    showMusicList: false,
    hasMusic: true,
    lrcArray: [],
    lrctime: [],
    nowtime: 0,
    id: null,
    cur: 0,
    list: [],
    musicbg: '',
    scrollTop: 0,
    scrollIntoView: 'lrcRow0',
    showCover: true,
    hideList: true,
    title: '',
    author: '',
    isPlay: false,
    page: 1,
    duration: '00:00',
    position: '00:00',
    durationTxt: '00:00',
    positionTxt: '00:00',
    showActionSheet: false,
    authors: [],
    playSortArray: ['icon-xunhuan', 'icon-danquxunhuan', 'icon-icon--'],
    playSort: 'icon-xunhuan',
    modelArray: ['顺序', '单曲', '随机'],
    modelTxt: '顺序',
    playSort: wx.getStorageSync('playSort') || 'icon-xunhuan'
  },
  onLoad(){
    const opt = wx.getStorageSync('playerData')
    this.setData({
      id: opt.id,
      isPlay: opt.isPlay,
      qualityTxt: wx.getStorageSync('qualityTxt') || '标准',
      playSort: wx.getStorageSync('playSort') || 'icon-xunhuan',
      modelTxt: wx.getStorageSync('modelTxt') || '顺序'
    })
    this.updata()
  },
  toggleList() {
    this.setData({
      isShowList: !this.data.isShowList,
      cur: wx.getStorageSync('playerIndex') || 0
    })
  },
  lt10(v){
    return v < 10 ? '0' + v : v
  },
  format(v){
    let ismax = parseInt(v) >= 3600, 
      out = ismax ? this.lt10(parseInt(v / 3600)) + ':' : ''
    return out + this.lt10(parseInt(v / 60 % 60)) + ':' + this.lt10(parseInt(v % 60))
  },
  quality(){
    //切换音质
    let s = this, ac = ['192', '320', 'flac'],
      acTxt = ['一般', '标准', '无损']
    wx.showActionSheet({
      itemList: acTxt,
      success: res => {
        const idx = res.tapIndex, txt = acTxt[idx]
        s.setData({
          quality: txt
        })
        wx.setStorageSync('quality', ac[idx])
        wx.setStorageSync('qualityTxt', txt)
        wx.showToast({
          title: `已开启${txt}音质`,
          icon: 'none',
          duration: 2000
        })
      }
    })
  },
  time2ms(times){
    if (times){
      return parseFloat(times.split(':')[0] * 60) + parseFloat(times.split(':')[1])
    }
    return 0
  },
  lrcTxt(){
    let s = this
    if (!s.data.id) return
    s.setData({
      hasEn: false
    })
    wx.request({
      url: url + `/netease/lrc?id=${s.data.id}`,
      success: res => {
        var lrcDatas = res.data
        if (lrcDatas) {
          //遇到[00:00.000]先添加换行(修复多语言歌词最后一句不换行的情况)
          //多个时间轴和多语言的歌词 先排序再合并多语言
          let lrcData = lrcDatas.replace(/(.*)\[00:00.\d{2,3}\](.*)/g, '$1\n[00:00.000]$2'),
            splits = lrcData.split(/\r|\n|\\s/g),
            lrcContainer = [], isMoreTime = /(\[\d{2}:\d{2}(\.\d{2,3})?\]){2,}(.*)/,
            matchs = /\[\d{2}:\d{2}\.\d{2,3}\]/g,
            reg = /\[(\d{2}:\d{2}(\.\d{2,3})?)\](.*)/,
            hasCn = /[^\u4e00-\u9fa5]/
          splits.forEach(item => {
            if (isMoreTime.test(item)) {
              //有2个及以上时间轴
              item.match(matchs).forEach(i => {
                lrcContainer.push(i + item.replace(isMoreTime, '$3'))
              })
            } else {
              if (s.time2ms(item.replace(reg, '$1')) >= 0) lrcContainer.push(item)
            }
          })
          lrcContainer.sort((a, b) => {
            //排序
            let l = s.time2ms(a.replace(reg, '$1')).toFixed(3),
              r = s.time2ms(b.replace(reg, '$1')).toFixed(3)
            return l - r
          })
          let getLrc = [], curTime = []
          lrcContainer.forEach(i => {
            //合并多语言
            if (!i) return
            let time = s.time2ms(i.replace(reg, '$1')).toFixed(3),
              txt = i.replace(reg, '$3').trim()
            if (curTime.includes(time)) {
              let len = getLrc.length - 1,
                old = getLrc[len].replace(reg, '$3').trim()
              //判断是否有中文 有则对调一下 真机和工具不一致
              if (!hasCn.test(txt)) getLrc.splice(len, 1, i.replace(reg, '[$1]' + old + '\n' + txt))
              else getLrc.splice(len, 1, i.replace(reg, '[$1]' + txt + '\n' + old))
              if (!s.data.hasEn) {
                s.setData({
                  hasEn: true //标志是否有多语言
                })
              }
            } else {
              curTime.push(time)
              getLrc.push(i)
            }
          })
          let newLrcArray = [], timeArray = [], cn = /作曲|作词/
          getLrc.forEach( item => {
            let key = item.replace(reg, '$1'), //时间轴
              value = item.replace(reg, '$3') //歌词
            if ( !key ) return
            cn.test(value) ? newLrcArray.unshift(value) : newLrcArray.push(value)
            cn.test(value) ? timeArray.unshift(parseInt(s.time2ms(key))) : timeArray.push(parseInt(s.time2ms(key)))
          })
          s.setData({
            lrcArray: newLrcArray,
            lrctime: timeArray,
            showLrc: true
          })
        }
      }
    })
  },
  lrc2Html(v){
    return v.replace(/.*\]/g, '').trim()
  },
  changeCover(){
    this.setData({
      showCover: !this.data.showCover
    })
    if (!this.data.showLrc){
      this.lrcTxt()
    }
    this.setData({
      scrollIntoView: this.data.scrollIntoView
    })
  },
  timeToSec(time) {
    if (!time) return 0
    const min = time.split(':')[0],
      sec = time.split(':')[1]
    return parseFloat(min * 60) + parseFloat(sec)
  },
  updata() {
    let s = this
    const opt = wx.getStorageSync('playerData')
    this.setData({
      id: opt.id,
      scrollTop: 'lrcRow0',
      name: opt.name,
      author: m.concat(opt.ar),
      pic: opt.al.picUrl,
      duration: opt.duration || '00:00',
      position: opt.position || '00:00',
      durationTxt: s.timeToSec(opt.duration) || '00:00',
      positionTxt: s.timeToSec(opt.position) || '00:00',
      list: wx.getStorageSync('playerList') || []
    })
    wx.setNavigationBarTitle({
      title: this.data.name + ' - ' + this.data.author
    })
    backgroundAudioManager.onTimeUpdate(() => {
      let duration = backgroundAudioManager.duration //总时长
      let position = backgroundAudioManager.currentTime //当前进度
      let _time = parseInt(backgroundAudioManager.currentTime)
      if (s.data.nowtime === _time) return //防止多次执行
      s.setData({
        nowtime: _time,
        duration: s.format(duration),
        position: s.format(position),
        durationTxt: duration,
        positionTxt: position
      })
      let n = s.data.lrctime.indexOf(_time)
      if (n != -1) {
        let curLine = s.data.hasEn ? n - 3 : n - 5,
          line = curLine < 0 ? 0 : curLine
        s.setData({
          scrollIntoView: 'lrcRow' + line
        })
      }
    })
    backgroundAudioManager.onEnded( ()=> {
      s.conNext(s.data.model)
    })
    backgroundAudioManager.onError( res => {
      wx.showToast({
        title: '网络错误，请稍后重试',
        icon: 'none',
        duration: 2000
      })
    })
  },
  play(e, cur){
    wx.showLoading({
      title: '切歌中...',
      mask: true
    })
    //列表点击播放
    let id, n = cur
    if (e === null) {
      //自动下一首
      let playerList = wx.getStorageSync('playerList')
      id = playerList[cur].id
    }else{
      //手动点击下一首
      let dataset = e.currentTarget.dataset
      id = dataset.id, n = dataset.index
    }
    wx.setStorageSync('playerNew', 1)
    this.setData({
      id: id,
      cur: n,
      scrollIntoView: 'lrcRow0',
      showActionSheet: false
    })
    wx.setStorageSync('playerIndex', n)
    m.player(id, this, () => {
      //切歌后更新状态
      wx.hideLoading()
      if (this.data.showLrc) {
        //如果已切换到歌词面板 则加载歌词
        this.lrcTxt()
      }
      backgroundAudioManager.onPlay(() => {
        this.updata()
      })
    })
  },
  conPrev(){
    //上一首
    let s = this, i = wx.getStorageSync('playerIndex'), len = wx.getStorageSync('playerList').length
    this.selectComponent("#playComponent").conNext()
    wx.setStorageSync('playerIplayerDatandex', wx.getStorageSync('playerData'))
    
    let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
      modelType = this.data.playSortArray.indexOf(playSort) //0顺序1单曲2随机
    if (modelType == 2) {
      //随机
      let n = Math.floor(Math.random() * len)
      s.setData({
        cur: n
      })
    } else {
      //单曲 & 顺序
      i -= 1
      s.setData({
        cur: i < 0 ? len - 1 : i
      })
    }
    s.play(null, s.data.cur)
  },
  conNext(){
    //下一首
    const list = wx.getStorageSync('playerList')
    let s = this, i = wx.getStorageSync('playerIndex'), len = list.length
    let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
      modelType = this.data.playSortArray.indexOf(playSort) //0顺序1单曲2随机
    if (modelType == 1) {
      //单曲
      if (typeof model !== 'object'){
        s.setData({
          cur: i
        })
      }else{
        i += 1
        s.setData({
          cur: i >= len ? 0 : i
        })
      }
    }else if (modelType == 2) {
      //随机
      let n = Math.floor(Math.random() * len)
      s.setData({
        cur: n
      })
    }else{
      //顺序
      i += 1
      s.setData({
        cur: i >= len ? 0 : i
      })
    }
    wx.setStorageSync('playerIndex', s.data.cur)
    s.play(null, s.data.cur)
  },
  conPlay(){
    //播放暂停
    const _isPlay = this.data.isPlay == 1 ? 0 : 1,
      pd = wx.getStorageSync('playerData'),
      mp3src = backgroundAudioManager.src
    pd['isPlay'] = _isPlay
    this.setData({
      isPlay: _isPlay,
      playerData: pd
    })
    wx.setStorageSync('playerData', pd)
    if (mp3src) {
      this.data.isPlay == 1 ? backgroundAudioManager.play() : backgroundAudioManager.pause()
    }else{
      //找不到音频 暂停跳转播放页面会出现此情况
      m.player(pd.id, this)
    }
    backgroundAudioManager.onPlay(() => {
      this.updata()
    })
  },
  showlist(){
    this.setData({
      hideList: !this.data.hideList,
      showMusicList: !this.data.showMusicList
    })
  },
  sliderchange(e){
    //拖动进度
    let val = e.detail.value
    this.setData({
      positionTxt: val
    })
    backgroundAudioManager.seek(val)
  },
  sliderchanging(e) {
    //正在拖动进度
    let val = e.detail.value
    this.setData({
      positionTxt: val
    })
  },
  getAuthor(e){
    let author = e.currentTarget.dataset.author,
      ar = author.split('/')
      this.setData({
        showActionSheet: true,
        authors: ar
      })
  },
  chooseAuthor(e){
    let author = e.currentTarget.dataset.author
    this.hideSheet()
    wx.navigateTo({
      url: `../artist/index?name=${author}`
    })
  },
  hideSheet(){
    this.setData({
      showActionSheet: false
    })
  },
  deleteMusic(e){
    let playList = wx.getStorageSync('playerList') || []
    if (playList.length > 0){
      const idx = e.currentTarget.dataset.index
      playList.splice(idx, 1)
      this.setData({
        list: playList
      })
      wx.setStorageSync('playerList', playList)
    }
  },
  returnFalse() {
    return false
  },
  changeSort() {
    //改变播放顺序
    let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
      n = this.data.playSortArray.indexOf(playSort)
    n += 1
    if (n > 2) n = 0
    const _playSort = this.data.playSortArray[n],
      modelTxt = this.data.modelArray[n]
    this.setData({
      playSort: _playSort,
      modelTxt: modelTxt
    })
    // wx.showToast({
    //   title: modelTxt + '播放',
    //   icon: 'none'
    // })
    wx.setStorageSync('playSort', _playSort)
    wx.setStorageSync('modelTxt', modelTxt)
  },
  onUnload() {
    let d = this.data,
      getData = wx.getStorageSync('playerData')
    getData['isPlay'] = d['isPlay']
    getData['nowtime'] = d['nowtime']
    getData['duration'] = d['duration']
    getData['position'] = d['position']
    getData['durationTxt'] = d['durationTxt']
    getData['positionTxt'] = d['positionTxt']
    wx.setStorageSync('playerData', getData)

    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})