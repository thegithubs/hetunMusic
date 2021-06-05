// pages/index.js
const App = getApp(), url = App.globalData.url;
import m from '../../lib/main.js'
// const backgroundAudioManager = wx.getBackgroundAudioManager()
Page({
  data: {
    homeCurrent: 0,
    dsIndex: 0,
    loading0: true,
    loading1: true,
    loading2: true,
    songList: [],
    newList: [],
    artist: [],
    isMy: true,
    id: null,
    tabIndex: 0,
    myMusic: [],
    mySonglist: [],
    myArtist: []
  },
  onLoad(opts){
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    this.onSongList() //推荐歌单
    // this.onAlbum() //新碟上架
    //使用旧接口监听下一首 新接口会覆盖监听不到
    //wx.onBackgroundAudioPlay(() => {
    // setTimeout( () => {
    //   this.init()
    // }, 0)
    //})
  },
  onSongList(){
    //推荐歌单
    wx.request({
      url: `${url}/v5/special/recommend?recommend_expire=0&sign=52186982747e1404d426fa3f2a1e8ee4&plat=0&uid=0&version=9108&page=1&area_code=1&appid=1005&mid=286974383886022203545511837994020015101&_t=1545746286`,
      success: res => {
        this.setData({
          loading0: false,
          songList: res.data.data.list.splice(0, 6)
        })
      }
    })
  },
  onArtist(){
    //热门歌手
    wx.request({
      url: url + '/netease/artist/top?pageSize=6',
      success: res => {
        this.setData({
          loading1: false,
          artist: res.data.data
        })
      }
    })
  },
  onAlbum() {
    //新碟上架
    wx.request({
      url: url + '/netease/album/newest',
      success: res => {
        this.setData({
          loading2: false,
          newList: res.data.data.splice(0, 6)
        })
      }
    })
  },
  cds(e){
    //切换新碟和歌手
    this.setData({
      dsIndex: e.currentTarget.dataset.index
    })
    if (this.data.dsIndex == 1 && this.data.artist.length == 0) {
      this.onArtist()
    }
  },
  cdschange(e){
    //切换新碟和歌手
    this.setData({
      dsIndex: e.detail.current
    })
    if (this.data.dsIndex == 1 && this.data.artist.length == 0){
      this.onArtist()
    }
  },
  go2Artist(e){
    //跳转歌手详情
    let dataset = e.currentTarget.dataset,
      info = {
        id: dataset.id,
        name: dataset.name,
        alias: dataset.alias
      }
    wx.navigateTo({
      url: `../artist/index?${m.str(info)}`,
    })
  },
  format(date) {
    var unix = new Date(parseInt(date)),
      local = unix.toLocaleString().split(' ')[0],
      out = local.replace(/\//g, '-')
    return out
  },
  go2search(){
    wx.navigateTo({
      url: '../search/index',
    })
  },
  go2disc(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `../disc/index?id=${id}`,
    })
  },
  swiperTab(e){
    this.setData({
      tabIndex: e.currentTarget.dataset.index
    })
  },
  swiperChange(e){
    this.setData({
      tabIndex: e.detail.current
    })
  },
  init() {
    const playerList = wx.getStorageSync('playerList') || [],
      playerData = wx.getStorageSync('playerData')
    if (playerList.length > 0) {
      const filter = playerList.filter(item => {
        if (item.id == playerData.id) return item.id
      })
      this.setData({
        id: filter[0].id
      })
    }
  },
  showMy(){
    this.setData({
      isMy: !this.data.isMy,
      myMusic: wx.getStorageSync('myFavoriteMusic') || []
    })
    this.mysongList() //我的歌单
    this.myArtist() //我的歌手
  },
  bdfavorite(e){
    //监听组件收藏取消
    this.setData({
      myMusic: e.detail
    })
  },
  play(e){
    //播放我的音乐
    const id = e.currentTarget.dataset.id
    m.player(id, this)
    this.setData({
      id: id
    })
    //更新临时播放列表
    const myFavoriteMusic = wx.getStorageSync('myFavoriteMusic')
    wx.setStorageSync('playerList', myFavoriteMusic)
  },
  mysongList(){
    //我的歌单
    const add_songList = wx.getStorageSync('add_songList') || []
    this.setData({
      mySonglist: add_songList
    })
  },
  myArtist(){
    //我的歌手
    const add_artist = wx.getStorageSync('add_artist') || []
    this.setData({
      myArtist: add_artist
    })
  },
  del(e, s){
    const d = e.currentTarget.dataset,
      id = d.id, type = d.type,
      songList = wx.getStorageSync('add_songList'),
      artist = wx.getStorageSync('add_artist')
    if (type == 'songlist') {
      //删除我的歌单
      for (let i = 0; i < songList.length; i++) {
        if (songList[i].id == id) {
          songList.splice(i, 1)
          break
        }
      }
      s.setData({
        mySonglist: songList
      })
      wx.setStorageSync('add_songList', songList)
    }
    if (type == 'artist') {
      //删除我的歌手
      for (let i = 0; i < artist.length; i++) {
        if (artist[i].id == id) {
          artist.splice(i, 1)
          break
        }
      }
      s.setData({
        myArtist: artist
      })
      wx.setStorageSync('add_artist', artist)
    }
  },
  deleteEvent(e){
    wx.showModal({
      title: '提示',
      content: '确定要删除吗',
      confirmColor: '#C20C0C',
      success:res => {
        if (res.confirm) {
          this.del(e, this)
        }
      }
    })
  },
  deleteMusic(e){
    //删除我的音乐
    let myFavoriteMusic = wx.getStorageSync('myFavoriteMusic') || []
    if (myFavoriteMusic.length > 0) {
      const idx = e.currentTarget.dataset.index
      myFavoriteMusic.splice(idx, 1)
      this.setData({
        myMusic: myFavoriteMusic
      })
      wx.setStorageSync('myFavoriteMusic', myFavoriteMusic)
    }
  }
})