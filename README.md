# 豆瓣图书搜索页数据解密

页面数据可以在 `script` 标签中 `__DATA__` 的值。

## 数据解密用到的算法
1. xxhash
2. rc4
3. bplist

> 豆瓣的`bplist`与Apple标准实现的有一些小差别。
> 
> https://github.com/opensource-apple/CF/blob/3cc41a76b1491f50813e28a4ec09954ffa359e6f/ForFoundationOnly.h#L390
> 
> Apple实现的 bplist 中的类型如下:
> 
> kCFBinaryPlistMarkerData = 0x4,
> 
> kCFBinaryPlistMarkerASCIIString = 0x5,
> 
> kCFBinaryPlistMarkerUnicode16String = 0x6,
>
> 豆瓣实现的 bplist 类型如下:
> 
> data = 0x6
> 
> ASCII = 0x4
> 
> Unicode16 = 0x5
