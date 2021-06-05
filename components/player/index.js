// pages/components/player/index.js 播放器组件
import m from '../../lib/main.js'
const App = getApp(), url = App.globalData.url;
const backgroundAudioManager = wx.getBackgroundAudioManager()
let isFirst = true
Component({
  properties: {
    name: {
      type: String,
      value: ''
    },
    pic: {
      type: String,
      value: ''
    },
    author: {
      type: String,
      value: ''
    },
    pid: {
      type: Number,
      value: null
    },
    isPlay: {
      type: String,
      value: 0
    },
    playerData: null
  },
  data: {
    isShowList: true,
    cur: 0,
    nowtime: '0',
    duration: '00:00',
    position: '00:00',
    durationTxt: '0',
    positionTxt: '0',
    playSortArray: ['icon-xunhuan', 'icon-danquxunhuan', 'icon-icon--'],
    playSort: 'icon-xunhuan',
    modelArray: ['顺序', '单曲', '随机'],
    musicCurrent: 0,
    swiperDuration: 500
  },
  methods: {
    onPlay(){
      let d = this.data.playerData
      d.isPlay = d.isPlay == 1 ? 0 : 1
      d.durationTxt = this.data.durationTxt
      d.positionTxt = this.data.positionTxt
      d.duration = this.data.duration
      d.position = this.data.position
      wx.setStorageSync('playerData', d)
      this.setData({
        playerData: d,
        isPlay: d.isPlay
      })
    },
    onGo2player(){
      if (!this.data.name) return
      wx.navigateTo({
        url: `/pages/player/index`
      })
    },
    lt10(v) {
      return v < 10 ? '0' + v : v
    },
    format(v) {
      let ismax = parseInt(v) >= 3600,
        out = ismax ? this.lt10(parseInt(v / 3600)) + ':' : ''
      return out + this.lt10(parseInt(v / 60 % 60)) + ':' + this.lt10(parseInt(v % 60))
    },
    updata(playerData) {
      if (!playerData) return
      let s = this, id = playerData.id
      if (playerData.isPlay == 1 && (wx.getStorageSync('playerNew') == 1 || isFirst === true)){
        if (wx.getStorageSync('playerNew') == 0){
          //防止重复调用接口/netease/url
          s.getMusic('', false)
          return
        }
        wx.setStorageSync('playerNew', 0)
        const quality = wx.getStorageSync('quality') || 320
        const mp3url = url + `/netease/url?id=${id}&quality=${quality}&isRedirect=0`
        wx.request({
          url: mp3url,
          success: res => {
            const mp3 = res.data.data,
              canIUse = mp3.indexOf('music.163.com') == -1
            if (canIUse) {
              //有版权
              s.getMusic(mp3, true)
            }else{
              //无版权
              const _name = m.encode(playerData.name)
              wx.request({
                url: url + `/tencent/search?keyword=${_name}&type=song&pageSize=1&page=0`,
                success: res => {
                  const id = res.data.data.list[0].songmid,
                    mp3 = url + `/tencent/url?id=${id}&quality=${quality}`
                  s.getMusic(mp3, true)
                },
                fail: () => {
                  wx.showToast({
                    title: '读取音频失败',
                    icon: 'none',
                    mask: true
                  })
                }
              })
            }
          },
          fail: () => {
            wx.showToast({
              title: '读取音频失败',
              icon: 'none',
              mask: true
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })
      }else{
        s.getMusic('', false)
      }
    },
    getMusic(mp3, flag) {
      let s = this, playerData = wx.getStorageSync('playerData'), id = playerData.id
      if (flag){
        backgroundAudioManager.src = mp3
        wx.setStorageSync('playerNew', 0)
        isFirst = false
        //切歌后读取成功再改变封面歌名等
        const list = wx.getStorageSync('playerList') || []
        s.setData({
          id: id,
          list: list,
          pic: playerData.al.picUrl,
          name: playerData.name,
          author: m.concat(playerData.ar),
          isPlay: playerData.isPlay == 0 ? 0 : 1,
          durationTxt: playerData.durationTxt || '0',
          positionTxt: playerData.positionTxt || '0'
        })
        let myFavoriteMusic = wx.getStorageSync('myFavoriteMusic') || [],
          inFav = myFavoriteMusic.some(i => i.id == id)
        s.setData({
          isfav: inFav ? 1 : -1
        })
      }
      backgroundAudioManager.title = playerData.name
      backgroundAudioManager.epname = playerData.al.name
      backgroundAudioManager.singer = m.concat(playerData.ar)
      backgroundAudioManager.coverImgUrl = playerData.al.picUrl

      wx.setStorageSync('domplayer', 0)
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
      })
      backgroundAudioManager.onEnded(() => {
        s.conNext()
      })
    },
    play(e, cur) {
      let s = this
      // wx.showLoading({
      //   title: '切歌中...',
      //   mask: true
      // })
      //列表点击播放
      let id, n = cur, playerList = wx.getStorageSync('playerList')
      if (e === null) {
        //自动下一首
        id = playerList[cur].id
      } else {
        //手动点击下一首
        let dataset = e.currentTarget.dataset
        id = dataset.id, n = dataset.index
      }
      wx.setStorageSync('playerNew', 1)
      wx.setStorageSync('playerIndex', n)
      this.setData({
        id: id,
        cur: n,
        scrollIntoView: 'lrcRow0',
        musicCurrent: n
      })
      m.player(id, this, () => {
        //切歌后更新状态
        //this.lrcTxt() 组件这里不加载歌词
        wx.hideLoading()
        backgroundAudioManager.onPlay(() => {
          this.updata()
        })
      })
    },
    conPrev(source) {
      //上一首
      const list = wx.getStorageSync('playerList')
      let s = this, i = s.data.cur, len = list.length
      let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
        modelType = this.data.playSortArray.indexOf(playSort) //0顺序1单曲2随机
      if (source && source == 'touch') {
        //手动切歌不分播放模式 直接播放上一首
        modelType = 0
        this.setData({
          swiperDuration: 0
        })
      }
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
      wx.setStorageSync('playerIndex', s.data.cur)
      s.play(null, s.data.cur)
    },
    conNext(source) {
      //下一首
      const list = wx.getStorageSync('playerList')
      let s = this, i = wx.getStorageSync('playerIndex'), len = list.length
      let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
        modelType = this.data.playSortArray.indexOf(playSort) //0顺序1单曲2随机
      if (source && source == 'touch'){
        //手动切歌如果是单曲循环则使用顺序模式
        if (modelType == 1 ) modelType = 0
        this.setData({
          swiperDuration: 0
        })
      }
      if (modelType == 1) {
        //单曲
        if (typeof model !== 'object') {
          s.setData({
            cur: i
          })
        } else {
          i += 1
          s.setData({
            cur: i >= len ? 0 : i
          })
        }
      } else if (modelType == 2) {
        //随机
        let i = Math.floor(Math.random() * len)
        if (i == s.data.cur) i += 1
        s.setData({
          cur: i >= len ? 0 : i
        })
      } else {
        //顺序
        i += 1
        s.setData({
          cur: i >= len ? 0 : i
        })
      }
      this.setData({
        musicCurrent: s.data.cur,
        id: list[s.data.cur].id
      })
      wx.setStorageSync('playerIndex', s.data.cur)
      s.play(null, s.data.cur)
    },
    lrcTxt() {
      let s = this, id = wx.getStorageSync('playerData').id
      if (!id) return
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      wx.request({
        url: url + `/netease/lrc?id=${id}`,
        complete() {
          wx.hideLoading()
        },
        success: res => {
          var lrcDatas = res.data
          if (lrcDatas) {
            //遇到[00:00.000]先添加换行(修复中英文歌词最后一句不换行的情况) 再匹配时间戳
            let lrcData = lrcDatas.replace(/(.*)\[00:00.\d{2,3}\](.*)/g, '$1\n[00:00.000]$2'),
              sp = lrcData.split(/\r|\n|\\s/),
              reg = /\[(\d{2}:\d{2}(\.\d{2,3})?)\](.*)/g,
              newLrcArray = [], getTimeArray = [], timeArray = [], cn = /作曲|作词/;
            sp.forEach(function (t, i, a) {
              let key = t.replace(reg, '$1'), value = t.replace(reg, '$3')
              if (!key) return
              if (!getTimeArray.includes(key)) {
                cn.test(value) ? newLrcArray.unshift(value) : newLrcArray.push(value)
                cn.test(value) ? getTimeArray.unshift(key) : getTimeArray.push(key)
                cn.test(value) ? timeArray.unshift(s.time2ms(key)) : timeArray.push(s.time2ms(key))
              } else {
                s.setData({
                  hasen: true
                })
                let n = getTimeArray.indexOf(key)
                newLrcArray.splice(n, 1, value + '\n' + newLrcArray[n])
              }
            })
            s.setData({
              lrcArray: _txt,
              lrctime: _lrctime
            })
          }
        }
      })
    },
    lrc2Html(v) {
      return v.replace(/.*\]/g, '').trim()
    },
    toggleList(){
      if (!this.data.isShowList){
        this.setData({
          isShowList: !this.data.isShowList
        })
        return
      }
      const pd = wx.getStorageSync('playerData'),
        list = wx.getStorageSync('playerList')
      let n = 0
      for (let i = 0; i < list.length; i++){
        if (list[i].id == pd.id){
          n = i
          break
        }
      }
      this.setData({
        isShowList: !this.data.isShowList,
        cur: n || 0
      })
    },
    deleteMusic(e) {
      let playList = wx.getStorageSync('playerList') || []
      if (playList.length > 0) {
        const idx = e.currentTarget.dataset.index
        playList.splice(idx, 1)
        this.setData({
          list: playList
        })
        wx.setStorageSync('playerList', playList)
      }
    },
    returnFalse(){
      return false
    },
    changeSort(){
      //切换顺序 -> 单曲 随机 循环
      let playSort = wx.getStorageSync('playSort') || 'icon-xunhuan',
        n = this.data.playSortArray.indexOf(playSort)
      n += 1
      if (n > 2) n = 0
      const _playSort = this.data.playSortArray[n]
      this.setData({
        playSort: _playSort
      })
      wx.setStorageSync('playSort', _playSort)
    },
    favorite(e){
      //添加收藏 只有点击才会显示到首页 -> 我的音乐
      let id = e.currentTarget.dataset.id,
        isfav = e.currentTarget.dataset.isfav == 1,
        myFavoriteMusic = wx.getStorageSync('myFavoriteMusic') || [],
        playerData = wx.getStorageSync('playerData')
      if (isfav){
        //已收藏 则取消收藏
        for (let i in myFavoriteMusic){
          if (myFavoriteMusic[i].id == id){
            playerData['isfav'] = -1
            this.setData({
              isfav: -1
            })
            myFavoriteMusic.splice(i, 1)
            wx.showToast({
              title: '已取消收藏',
              icon: 'none',
              mask: true
            })
            wx.setStorageSync('myFavoriteMusic', myFavoriteMusic)
            wx.setStorageSync('playerData', playerData)
            break
          }
        }
      }else{
        //收藏
        let inFav = myFavoriteMusic.some(i => i.id == id)
        if (!inFav) {
          playerData['isfav'] = 1
          myFavoriteMusic.unshift(playerData)
          this.setData({
            isfav: 1
          })
          wx.showToast({
            title: '已收藏',
            icon: 'none',
            mask: true
          })
          wx.setStorageSync('myFavoriteMusic', myFavoriteMusic)
          wx.setStorageSync('playerData', playerData)
        }
      }
      this.triggerEvent('bdfavorite', myFavoriteMusic)
    },
    changeTabMusic(e){
      //如果最后一个则直接下一首
      if (e.detail.current == this.data.list.length) {
        this.conNext('touch')
        return
      }
      // if (e.detail.current == -1) {
      //   this.conPrev('touch')
      //   return
      // }
      if (e.detail.source != 'touch') return
      const dataset = e.currentTarget.dataset,
        isNext = this.data.musicCurrent < e.detail.current
      this.setData({
        musicCurrent: e.detail.current,
        id: dataset.id
      })
      isNext ? this.conNext('touch') : this.conPrev('touch')
    },
    finishTabMusic(e){
      //if (e.detail.current == this.data.list.length - 1) this.conNext('touch')
      this.setData({
        swiperDuration: 500
      })
    }
  },
  attached() {
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
  },
  observers: {
    'playerData'(playerData) {
      if (playerData) {
        let mp3src = backgroundAudioManager.src
        this.updata(playerData)
        if (mp3src) {
          playerData.isPlay == 1 ? backgroundAudioManager.play() : backgroundAudioManager.pause()
        } else {
          //判断domplayer 防止多次执行
          if (wx.getStorageSync('domplayer') == 1) return
          wx.setStorageSync('domplayer', 1)
          m.player(playerData.id, this)
        }
      }
    }
  },
  pageLifetimes: {
    show(){
      this.setData({
        durationTxt: this.data.durationTxt || '0',
        positionTxt: this.data.positionTxt || '0'
      })
      let playerData = wx.getStorageSync('playerData')
      if (!playerData) return
      let myFavoriteMusic = wx.getStorageSync('myFavoriteMusic'),
        playerList = wx.getStorageSync('playerList') || []
      for (let i in playerList){
        if (playerList[i].id == playerData.id){
          this.setData({
            musicCurrent: Number(i)
          })
          break
        }
      }
      this.setData({
        list: playerList,
        id: playerData.id,
        //返回上一页设置一些播放的数据
        isfav: playerData.isfav || false,
        pic: playerData.al.picUrl,
        name: playerData.name,
        author: m.concat(playerData.ar),
        isPlay: playerData.isPlay == 0 ? 0 : 1
      })
      backgroundAudioManager.onPlay(() => {
        this.updata()
      })
      this.setData({
        playSort: wx.getStorageSync('playSort') || 'icon-xunhuan'
      })
    }
  }
})
