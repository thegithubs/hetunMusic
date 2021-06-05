// pages/index.js
const app = getApp();

Page({
  data: {
    isEnd: false,
    loading: true,
    name: '全部',
    sub: [
      {
        name: '全部',
      }
    ],
    offset: 0,
    limit: 21,
    songList: []
  },
  async onLoad(){
    this.setData({
      playerData: wx.getStorageSync('playerData')
    })
    await this.getMenu()
    await this.onSongList() //歌单广场
  },
  getMenu(){
    app.get(`/playlist/catalogue`)
    .then(res => {
      const { sub } = res;
      this.setData({
        sub: this.data.sub.concat(sub),
      })
    })
  },
  onSongList(){
    //歌单广场
    this.setData({
      loading: true
    });
    const { songList, limit, name, offset } = this.data;
    app.get(`/playlist/list?limit=${limit}&cat=${name}&offset=${offset}`)
    .then(res => {
      const { playlists } = res;
      this.setData({
        songList: songList.concat(playlists),
        loading: false,
        isEnd: playlists.length < limit ? true : false
      })
    })
  },
  go2SongList(e){
    //跳转歌单详情
    let d = e.currentTarget.dataset
    wx.navigateTo({
      url: `../songList/index?id=${d.id}&type=${d.type}`
    })
  },
  changeSub(e){
    const name = e.currentTarget.dataset.name
    this.setData({
      name,
      page: 0,
      songList: []
    })
    this.onSongList()
  },
  onReachBottom(){
    //滑到底部
    if (this.data.isEnd || this.data.loading) return;
    let offset = this.data.offset * this.data.limit;
    this.setData({
      offset,
    });
    this.onSongList();
  },
  onUnload() {
    let pages = getCurrentPages(),
      prevPage = pages[pages.length - 2] //上一个页面
    prevPage.setData({
      playerData: wx.getStorageSync('playerData')
    })
  }
})