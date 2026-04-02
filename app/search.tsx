
import { Song } from './types';


class Search {

  private baseUrl: string = 'https://api.xcvts.cn/api/music/migu';

  // 1. 定义一个私有的静态变量来保存实例
  private static instance: Search | null = null;

  // 2. 私有化构造函数，防止外部通过 new Search() 创建新实例
  private constructor() {
    // 这里可以初始化搜索相关的配置
    console.log("Search 实例已初始化");
  }

  // 3. 提供一个静态方法供外部获取唯一实例
  static getInstance(): Search {
    if (!Search.instance) {
      Search.instance = new Search();
    }
    return Search.instance;
  }

  public async getMiguSongNames(keyword: string, limit: number = 10): Promise<string[]> {
    try {
      const url = `${this.baseUrl}?gm=${encodeURIComponent(keyword)}&n=&num=10&type=json`;
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`network error: ${response.status}`);
      }
      const data = await response.json();
      const list = data.data || [];
      return list.map((item: {n:number, title:string, singer: string})=>{return item.title;}).slice(0, limit) as string[];

    } catch (error) {
      console.log('get songs err' + error);
    }
    return [] as string[];
  }

  public async getMiguSongDetail(name: string): Promise<Song|null> {
    interface Detail {
      code: number,
      title: string,
      singer: string,
      cover: string,
      lrc_url: string,
      link: string,
      music_url: string,
    };

    try {
      const detailUrl = `${this.baseUrl}?gm=${encodeURIComponent(name)}&n=1&num=20&type=json`;
      const res = await fetch(detailUrl);
      const detail: Detail = await res.json();
      if (detail.code !== 200) {
        return null;
      }

      return {
        id: '',
        title: detail.title,
        url: detail.music_url,
      } as Song;
    } catch (error) {
      console.log(`get song ${name} err`, error);
      return null;
    }
  }

  public async getMiguSongs(keyword: string): Promise<Song[]> {
    try {
      const names = await this.getMiguSongNames(keyword, 10);
      console.log(names);
      if (names.length === 0) return [] as Song[];
      const songPromises = names.map(async (name: string, index: number) => {
        return this.getMiguSongDetail(name);
      });
      const results = await Promise.all(songPromises);
      return results.filter((s): s is Song => s !== null);
    } catch (error) {
      console.log('query err' + error);
    }

    return [] as Song[];
  }

  public async query(keyword: string): Promise<Song[]> {
    console.log(`query keyword: ${keyword}`);
    return this.getMiguSongs(keyword);
  }
}

export default Search;
