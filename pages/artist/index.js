// pages/artist/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
Page({
  data: {
    current: 0,
    loading: true,
    loading1: false,
    loading2: false,
    song: null,
    isAdd: false,
    add: '+ 收藏',
    canScroll: false,
    scrollTop: 0,
    albumSize: 0,
    album: [],
    singerInfo: null
  },
  onLoad(opt) {
    this.setData({
      name: m.decode(opt.name),
      id: opt.id,
      playerData: wx.getStorageSync('playerData')
    })
    wx.setNavigationBarTitle({
      title: this.data.name
    })
    this.getSigerInfo(this.data.name) //获取歌手信息
  },
  getSigerInfo(name) {
    const add_artist = wx.getStorageSync('add_artist') || []
    //http://www.kuwo.cn/api/www/artist/artist?artistid=${id}&reqId=21616140-a93d-11e9-91f4-a31c5fa5b04b reqId可不用
    wx.request({
      url: url + `/netease/search?keyword=${m.encode(name)}&type=singer&pageSize=10`,
      success: res => {
        const artists = res.data.data.artists,
          d = artists.filter( i =>  i.id == this.data.id)[0],
          isAdd = add_artist.some(i => i.id == d.id)
        this.setData({
          picurl: d.picUrl || d.img1v1Url,
          alias: d.alias,
          isAdd: isAdd,
          albumSize: d.albumSize,
          add: isAdd ? '已收藏' : '+ 收藏'
        })
        this.getArtList(d.id) //获取歌曲
      }
    })
  },
  add(e) {
    //收藏歌手
    if (this.data.isAdd) return
    const old = wx.getStorageSync('add_artist') || [],
      data = this.data
    const d = {
      img1v1Url: data.picurl,
      name: data.name,
      alias: data.alias,
      id: data.id
    }
    this.setData({
      isAdd: true,
      add: '已收藏'
    })
    wx.setStorageSync('add_artist', old.concat(d))
  },
  getArtList(id){
    let s = this
    wx.request({
      url: url + `/netease/song/artist?id=${id}`,
      success: res => {
        s.setData({
          song: res.data.data,
          loading: false
        })
      }
    })
  },
  player(e){
    m.player(e.currentTarget.dataset.id, this)
  },
  palyAll() {
    //播放全部歌曲
    const all = this.data.song,
      id = all[0].id
    wx.setStorageSync('playerList', all)
    m.player(id, this)
  },
  getAlbum(){
    //请求专辑
    this.setData({
      loading1: true
    })
    wx.request({
      url: url + `/netease/album/artist?id=${this.data.id}&pageSize=999`,
      success: res => {
        const album = res.data.data
        if (album.length > 0){
          this.setData({
            album: album
          })
        }
      },
      complete: () => {
        this.setData({
          loading1: false
        })
      }
    })
  },
  go2album(e){
    //跳转专辑详情
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../disc/index?id=${id}`
    })
  },
  artistInfo(){
    //艺人信息
    this.setData({
      loading2: true
    })
    wx.request({
      url: url + `/netease/artist/info?id=${this.data.id}`,
      success: res => {
        this.setData({
          singerInfo: res.data.data
        })
      },
      complete: () => {
        this.setData({
          loading2: false
        })
      }
    })
  },
  change(e){
    this.setData({
      current: e.detail.source == 'touch' ? e.detail.current : e.currentTarget.dataset.cur
    })
    if (this.data.album.length == 0 && this.data.current == 1){
      //请求专辑
      this.getAlbum()
    }
    if (!this.data.singerInfo && this.data.current == 2) {
      //艺人信息
      this.artistInfo()
    }
  },
  onPageScroll(e){
    let n = this.data.current
    if (e.scrollTop >= 210){
      this.setData({
        canScroll: true
      })
    }else{
      if (this.data.canScroll){
        this.setData({
          canScroll: false,
          scrollTop: 0
        })
      }
    }
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})